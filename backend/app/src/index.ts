import { Elysia } from "elysia";
import { openapi } from '@elysiajs/openapi';
import apiRoutes from "./routes";
import { auth } from "./auth/auth";
export { db } from "./db/db";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .mount(auth.handler)
  .use(openapi())
  .use(cors({
    origin: ["http://localhost:3030", "http://zwykly.duckdns.org", "http://zwykly.duckdns.org:3030"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }))
  .use(apiRoutes)
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;