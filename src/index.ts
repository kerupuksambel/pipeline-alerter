import { config } from "./config";
import { getPipelineDetail, getPipelinesList } from "./core/bitbucket";
import {
  addPipeline,
  getPipeline,
  getPipelinesByIds,
} from "./core/db/repositories/pipeline";
import { Log } from "./utils/log";

const main = async () => {
  // test the big fetch first
  Log.info("Starting main. Pipeline fetching is started");
  const pipelines = await getPipelinesList();
  Log.info(`Pipeline list has been fetched.`);

  const existedPipelines = await getPipelinesByIds(
    pipelines.values.map((pl) => pl.uuid),
  );
  const existedPipelineIDs = existedPipelines.map((pl) => pl.id);
  pipelines.values.forEach(async (pl) => {
    if (!existedPipelineIDs.includes(pl.uuid)) {
      await addPipeline({
        id: pl.uuid,
        pipelineStatus: pl.state.name,
        resultStatus:
          pl.state.name === "COMPLETED" ? pl.state.result.name : null,
        updatedAt: new Date(),
      });
    }
  });

  const pipeline = await getPipelineDetail(pipelines.values[0].uuid);

  Log.info(`Pipeline detail for first pipeline has been fetched.`);
  Log.debug(pipeline);
};

main();
