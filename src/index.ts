import { Elysia } from "elysia";
import { webhook } from "@/modules/webhook";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(webhook)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
