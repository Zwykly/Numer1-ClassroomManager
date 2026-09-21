import { Elysia } from "elysia";
import { openapi } from '@elysiajs/openapi';
import apiRoutes from "./routes";
import { auth } from "./auth/auth";
export { db } from "./db/db";
import { cors } from "@elysiajs/cors";
import { startReservationStatusJob } from "./jobs/reservation_status";
import { isOriginAllowed } from "./utils/origins";

const app = new Elysia()
  .mount(auth.handler)
  .use(openapi())
  .use(cors({
    origin: (request: Request) => isOriginAllowed(request.headers.get("origin")),
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