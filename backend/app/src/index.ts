import { Elysia } from "elysia";
import { openapi } from '@elysiajs/openapi';
import apiRoutes from "./routes";
import { auth } from "./auth/auth";
export { db } from "./db/db";
import { cors } from "@elysiajs/cors";
import { startReservationStatusJob } from "./jobs/reservation_status";

const localNetworkOrigin = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|zwykly\.duckdns\.org)(:\d+)?$/;

const envOrigins = (process.env.TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const allowedOrigins: (string | RegExp)[] =
  envOrigins.length > 0 ? [...envOrigins, localNetworkOrigin] : [localNetworkOrigin];

const app = new Elysia()
  .mount(auth.handler)
  .use(openapi())
  .use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }))
  .use(apiRoutes)
  .get("/", () => "Hello Elysia")
  .listen({ port: 3000, hostname: "0.0.0.0" });

startReservationStatusJob();

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;