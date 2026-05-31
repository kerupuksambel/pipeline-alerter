import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Log } from "@/utils/log";

export interface HttpClientOptions extends AxiosRequestConfig {
  name: string; // for logging/debugging
}

export function createHttpClient(opts: HttpClientOptions): AxiosInstance {
  const { name, ...axiosConfig } = opts;

  const instance = axios.create({
    timeout: 15_000,
    ...axiosConfig,
  });

  instance.interceptors.request.use((cfg) => {
    Log.debug(`[${name}] ${cfg.method?.toUpperCase()} ${cfg.url}`);
    return cfg;
  });

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      Log.error(
        `[${name}] ${err.response?.status ?? "ERR"} ${err.config?.url} - ${err.message}`,
      );
      return Promise.reject(err);
    },
  );

  return instance;
}
