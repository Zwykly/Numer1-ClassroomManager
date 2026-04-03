import { Elysia, t } from "elysia";
import { classroomsController } from "../controllers/classrooms";
import { insertClassroomSchema, selectClassroomSchema, updateClassroomSchema, removeClassroomSchema } from "../models/classrooms"
import { authGuard } from "../auth/authGuard";

const classroomsRoutes = new Elysia({
    prefix: "/classrooms",
})
    .get("/", async () => await classroomsController.getAllClassrooms(), {
        response: t.Array(selectClassroomSchema)
    })
    .post("/", async ({ body }) => await classroomsController.createClassroom(body), {
        body: insertClassroomSchema,
        response: selectClassroomSchema
    })
    .put("/", async ({ body }) => await classroomsController.updateClassroom(body), {
        body: updateClassroomSchema,
        response: selectClassroomSchema
    })
    .delete("/", async ({ body }) => await classroomsController.removeClassroom(body), {
        body: removeClassroomSchema,
        response: selectClassroomSchema
    });

export default classroomsRoutes;
