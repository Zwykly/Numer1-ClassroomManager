import { Elysia } from "elysia";
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { openapi } from '@elysiajs/openapi';
import routes from "./routes";

const db = drizzle(process.env.DATABASE_URL!);
export { db };

const app = new Elysia()
  .use(openapi())
  .use(routes.classroomReservationsRoutes)
  .use(routes.classroomsRoutes)
  .use(routes.usersRoutes)
  .use(routes.groupsRoutes)
  .use(routes.groupStudentsRoutes)
  .use(routes.onlineClassroomsRoutes)
  .use(routes.reservationGroupsRoutes)
  .use(routes.reservationStudentsRoutes)
  .use(routes.studentsRoutes)
  .use(routes.teacherGroupsRoutes)
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
