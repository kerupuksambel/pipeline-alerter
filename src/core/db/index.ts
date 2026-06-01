import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { config } from "@/config";
import { Pipeline } from "@/core/db/schemas/pipeline";
import { Subscriber } from "@/core/db/schemas/user";

const sqlite = new Database(config.DB_FILENAME);
sqlite.pragma("journal_mode = WAL");

export const schema = { Pipeline, Subscriber };

export const db = drizzle(sqlite, { schema });

export type DB = typeof db;
