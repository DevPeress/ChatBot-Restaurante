import Fastify from "fastify";
import process from "node:process";
import { chatRoutes } from "./routes/chat.ts";

const app = Fastify({ logger: true });

await app.register(chatRoutes);

await app.listen({
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? "127.0.0.1",
});
