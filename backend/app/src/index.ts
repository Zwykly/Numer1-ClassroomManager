import { Elysia } from "elysia";
import { openapi } from '@elysiajs/openapi';
import routes from "./routes";
import { auth } from "./auth/auth";
export { db } from "./db/db";

const app = new Elysia()
  .mount(auth.handler)
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
