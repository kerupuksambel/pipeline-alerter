import { config } from "./config";
import { getPipelinesList } from "./core/bitbucket";
import { Log } from "./utils/log";

const main = async () => {
  // test the big fetch first
  Log.info("Starting main. Pipeline fetching is started");
  const resp = await getPipelinesList();

  Log.debug(resp);
};

main();
