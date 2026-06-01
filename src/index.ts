import { config } from "./config";
import { getPipelineDetail, getPipelinesList } from "./core/bitbucket";
import { Log } from "./utils/log";

const main = async () => {
  // test the big fetch first
  Log.info("Starting main. Pipeline fetching is started");
  const pipelines = await getPipelinesList();
  Log.info(`Pipeline list has been fetched.`);

  const pipeline = await getPipelineDetail(pipelines.values[0].uuid);

  Log.info(`Pipeline detail for first pipeline has been fetched.`);
  Log.debug(pipeline);
};

main();
