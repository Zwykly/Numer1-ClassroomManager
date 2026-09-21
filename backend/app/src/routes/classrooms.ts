import { selectCompositeClassroomSchema, paginatedClassroomsResponseSchema } from "../models/composite";
import { Elysia, t } from "elysia";
import { ClassroomsController } from "../controllers/classrooms";
import { insertClassroomSchema, updateClassroomSchema, patchClassroomSchema, classroomsQuerySchema } from "../models/classrooms";
import { authGuard } from "../auth/authGuard";

const classroomsRoutes = new Elysia({
    prefix: "/classrooms",
})
    .use(authGuard)
    .get("/", ClassroomsController.getAll, {
        query: classroomsQuerySchema,
        response: paginatedClassroomsResponseSchema,
        isAuth: true
    })
    .get("/:id", ClassroomsController.getById, {
        params: t.Object({ id: t.String() }),
        response: selectCompositeClassroomSchema,
        isAuth: true
    })
    .post("/", ClassroomsController.create, {
        body: insertClassroomSchema,
        response: selectCompositeClassroomSchema,
        isAdmin: true
    })
    .put("/:id", ClassroomsController.update, {
        params: t.Object({ id: t.String() }),
        body: updateClassroomSchema,
        response: selectCompositeClassroomSchema,
        isAdmin: true
    })
    .patch("/:id", ClassroomsController.patch, {
        params: t.Object({ id: t.String() }),
        body: patchClassroomSchema,
        response: selectCompositeClassroomSchema,
        isAdmin: true
    })
    .delete("/:id", ClassroomsController.remove, {
        params: t.Object({ id: t.String() }),
        isAdmin: true
    });

export default classroomsRoutes;
