import { paginatedTeacherGroupsResponseSchema } from "../models/composite";
import { Elysia, t } from "elysia";
import { TeacherGroupsController } from "../controllers/teacher_groups";
import { insertTeacherGroupSchema, selectSimpleTeacherGroupSchema, updateTeacherGroupSchema, patchTeacherGroupSchema, teacherGroupsQuerySchema } from "../models/teacher_groups";
import { authGuard } from "../auth/authGuard";

const teacherGroupsRoutes = new Elysia({
    prefix: "/teacher-groups",
})
    .use(authGuard)
    .get("/", TeacherGroupsController.getAll, {
        query: teacherGroupsQuerySchema,
        response: paginatedTeacherGroupsResponseSchema
    })
    .get("/:id", TeacherGroupsController.getById, {
        params: t.Object({ id: t.String() }),
        response: selectSimpleTeacherGroupSchema
    })
    .post("/", TeacherGroupsController.create, {
        body: insertTeacherGroupSchema,
        response: selectSimpleTeacherGroupSchema
    })
    .put("/:id", TeacherGroupsController.update, {
        params: t.Object({ id: t.String() }),
        body: updateTeacherGroupSchema,
        response: selectSimpleTeacherGroupSchema
    })
    .patch("/:id", TeacherGroupsController.patch, {
        params: t.Object({ id: t.String() }),
        body: patchTeacherGroupSchema,
        response: selectSimpleTeacherGroupSchema
    })
    .delete("/:id", TeacherGroupsController.remove, {
        params: t.Object({ id: t.String() }),
    });

export default teacherGroupsRoutes;
