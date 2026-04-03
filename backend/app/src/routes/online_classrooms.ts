import { Elysia, t } from "elysia";
import { onlineClassroomsController } from "../controllers/online_classrooms";
import { insertOnlineClassroomSchema, selectOnlineClassroomSchema, updateOnlineClassroomSchema, removeOnlineClassroomSchema } from "../models/online_classrooms"

const onlineClassroomsRoutes = new Elysia({
    prefix: "/online-classrooms",
})
    .get("/", async () => await onlineClassroomsController.getAllOnlineClassrooms(), {
        response: t.Array(selectOnlineClassroomSchema)
    })
    .post("/", async ({ body }) => await onlineClassroomsController.createOnlineClassroom(body), {
        body: insertOnlineClassroomSchema,
        response: selectOnlineClassroomSchema
    })
    .put("/", async ({ body }) => await onlineClassroomsController.updateOnlineClassroom(body), {
        body: updateOnlineClassroomSchema,
        response: selectOnlineClassroomSchema
    })
    .delete("/", async ({ body }) => await onlineClassroomsController.removeOnlineClassroom(body), {
        body: removeOnlineClassroomSchema,
        response: selectOnlineClassroomSchema
    });

export default onlineClassroomsRoutes;
