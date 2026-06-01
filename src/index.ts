import { getPipelineDetail, getPipelinesList } from "./core/bitbucket";
import type { PipelineResultName, PipelineState } from "./core/bitbucket/types";
import { getBranchName, isCompleted } from "./core/bitbucket/util";
import {
  addPipeline,
  getPipeline,
  getPipelinesByIds,
  updatePipelineState,
} from "./core/db/repositories/pipeline";
import { teleBot } from "./core/telebot";
import { Timer } from "./core/timer";
import { removeBrackets } from "./utils/formatter";
import { Log } from "./utils/log";

const LIST_INTERVAL_MS = 30_000;
const DETAIL_INTERVAL_MS = 15_000;

/** A pipeline is terminal once it has COMPLETED — nothing left to poll. */
const isDone = (state: PipelineState): boolean => state.name === "COMPLETED";

const resultOf = (state: PipelineState): PipelineResultName | null =>
  state.name === "COMPLETED" ? state.result.name : null;

/**
 * Per-pipeline detail timers, keyed by uuid. Presence in this map is the
 * "already watching this pipeline" guard, so the 30s discovery tick never
 * spawns a duplicate poller.
 */
const detailTimers = new Map<string, Timer>();

/**
 * Spawn a 15s detail poll for a single non-terminal pipeline. Writes to the DB
 * only when pipelineStatus / resultStatus actually changes, and stops itself
 * once the pipeline reaches a terminal (COMPLETED) state.
 */
const trackPipeline = (uuid: string): void => {
  if (detailTimers.has(uuid)) return; // already being watched

  const timer = new Timer({
    name: `detail:${uuid}`,
    intervalMs: DETAIL_INTERVAL_MS,
    immediate: true,
    onTick: async () => {
      const detail = await getPipelineDetail(uuid);
      const nextStatus = detail.state.name;
      const nextResult = resultOf(detail.state);

      const current = await getPipeline(uuid);
      const changed =
        !current ||
        current.pipelineStatus !== nextStatus ||
        current.resultStatus !== nextResult;

      if (changed) {
        Log.info(
          `[WATCH] ${uuid} ${current?.pipelineStatus ?? "?"} -> ${nextStatus}` +
            (nextResult ? ` (${nextResult})` : ""),
        );
        await updatePipelineState(uuid, nextStatus, nextResult);
      }

      if (isCompleted(detail.state)) {
        detailTimers.delete(uuid);
        return false; // retire this poller
      }
    },
  });

  detailTimers.set(uuid, timer);
  timer.start();
};

/**
 * 30s discovery tick: list pipelines, persist any we haven't seen yet, and
 * start a detail poll for every non-terminal pipeline we aren't already
 * tracking.
 */
const discover = async (): Promise<void> => {
  const { values: pipelines } = await getPipelinesList();

  const known = await getPipelinesByIds(pipelines.map((pl) => pl.uuid));
  const knownIds = new Set(known.map((pl) => pl.id));

  for (const pl of pipelines) {
    if (!knownIds.has(pl.uuid)) {
      Log.info(`[discover] new pipeline ${pl.uuid} (${pl.state.name})`);
      await teleBot.broadcastMessages(
        `⚙️ A new pipeline with ID: <b>${removeBrackets(pl.uuid)}</b> sourced from branch <b>${getBranchName(pl.target)}</b> has been started at ${pl.created_on}`,
      );
      await addPipeline({
        id: pl.uuid,
        pipelineStatus: pl.state.name,
        resultStatus: resultOf(pl.state),
        updatedAt: new Date(),
        executedAt: new Date(pl.created_on),
      });
    }

    if (!isDone(pl.state)) {
      trackPipeline(pl.uuid);
    }
  }
};

const main = async () => {
  Log.info("Starting pipeline watcher.");
  await teleBot.start();

  new Timer({
    name: "discover",
    intervalMs: LIST_INTERVAL_MS,
    immediate: true,
    onTick: discover,
  }).start();
};

/**
 * Stop polling before the process dies so Telegram frees the getUpdates slot;
 * otherwise nodemon's restart races the old long-poll connection -> 409.
 * nodemon restarts with SIGUSR2; SIGINT/SIGTERM cover Ctrl-C and normal kills.
 */
let shuttingDown = false;
const shutdown = async (signal: NodeJS.Signals) => {
  if (shuttingDown) return;
  shuttingDown = true;
  Log.info(`[MAIN] Received ${signal}, shutting down.`);
  await teleBot.stop();
  process.exit(0);
};

for (const signal of ["SIGINT", "SIGTERM", "SIGUSR2"] as const) {
  process.once(signal, () => void shutdown(signal));
}

main();
