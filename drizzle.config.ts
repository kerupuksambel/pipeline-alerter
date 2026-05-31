import type { Config } from "drizzle-kit";
import { config } from "@/config";

export default {
  schema: "./src/core/db/schemas/*",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url: config.DB_FILENAME },
} satisfies Config;
