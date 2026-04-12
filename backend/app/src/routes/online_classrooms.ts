import { selectCompositeOnlineClassroomSchema, paginatedOnlineClassroomsResponseSchema } from "../models/composite";
import { Elysia, t } from "elysia";
import { OnlineClassroomsController } from "../controllers/online_classrooms";
import { insertOnlineClassroomSchema, updateOnlineClassroomSchema, patchOnlineClassroomSchema, onlineClassroomsQuerySchema } from "../models/online_classrooms";
import { authGuard } from "../auth/authGuard";

const onlineClassroomsRoutes = new Elysia({
    prefix: "/online-classrooms",
})
    .use(authGuard)
    .get("/", OnlineClassroomsController.getAll, {
        query: onlineClassroomsQuerySchema,
        response: paginatedOnlineClassroomsResponseSchema
    })
    .get("/:id", OnlineClassroomsController.getById, {
        params: t.Object({ id: t.String() }),
        response: selectCompositeOnlineClassroomSchema
    })
    .post("/", OnlineClassroomsController.create, {
        body: insertOnlineClassroomSchema,
        response: selectCompositeOnlineClassroomSchema
    })
    .put("/:id", OnlineClassroomsController.update, {
        params: t.Object({ id: t.String() }),
        body: updateOnlineClassroomSchema,
        response: selectCompositeOnlineClassroomSchema
    })
    .patch("/:id", OnlineClassroomsController.patch, {
        params: t.Object({ id: t.String() }),
        body: patchOnlineClassroomSchema,
        response: selectCompositeOnlineClassroomSchema
    })
    .delete("/:id", OnlineClassroomsController.remove, {
        params: t.Object({ id: t.String() }),
    });

export default onlineClassroomsRoutes;
