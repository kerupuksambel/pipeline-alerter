import { Elysia } from "elysia";

export const webhook = new Elysia({ prefix: "/auth" }).post(
  "/",
  async ({ body }) => {},
);
