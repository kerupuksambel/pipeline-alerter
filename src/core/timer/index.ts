import { Log } from "@/utils/log";

/** Return `false` from a tick to stop the timer; anything else keeps it going. */
export type TickResult = void | boolean;

export interface TimerOptions {
  /** Label used in logs. */
  name: string;
  /** Delay between the END of one tick and the START of the next. */
  intervalMs: number;
  /** Work to perform each tick. Return `false` to stop the timer. */
  onTick: () => Promise<TickResult> | TickResult;
  /** Fire the first tick immediately instead of waiting one interval. */
  immediate?: boolean;
}

/**
 * A self-scheduling timer.
 *
 * Uses a chained `setTimeout` rather than `setInterval`: the next tick is only
 * scheduled once the current one has settled, so a slow (or hung) async tick
 * can never overlap with the next one. Thrown errors are logged and swallowed
 * so a transient failure doesn't kill the loop.
 */
export class Timer {
  private readonly name: string;
  private readonly intervalMs: number;
  private readonly onTick: () => Promise<TickResult> | TickResult;
  private readonly immediate: boolean;

  private handle: NodeJS.Timeout | null = null;
  private active = false;

  constructor(opts: TimerOptions) {
    this.name = opts.name;
    this.intervalMs = opts.intervalMs;
    this.onTick = opts.onTick;
    this.immediate = opts.immediate ?? false;
  }

  get isRunning(): boolean {
    return this.active;
  }

  start(): this {
    if (this.active) return this;
    this.active = true;
    Log.info(`[timer:${this.name}] started (every ${this.intervalMs}ms)`);

    if (this.immediate) {
      void this.runTick();
    } else {
      this.schedule();
    }
    return this;
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;
    if (this.handle) {
      clearTimeout(this.handle);
      this.handle = null;
    }
    Log.info(`[timer:${this.name}] stopped`);
  }

  private schedule(): void {
    if (!this.active) return;
    this.handle = setTimeout(() => void this.runTick(), this.intervalMs);
  }

  private async runTick(): Promise<void> {
    if (!this.active) return;
    try {
      const result = await this.onTick();
      if (result === false) {
        this.stop();
        return;
      }
    } catch (err) {
      Log.error(
        `[timer:${this.name}] tick failed: ${(err as Error)?.message ?? err}`,
      );
    }
    this.schedule();
  }
}
