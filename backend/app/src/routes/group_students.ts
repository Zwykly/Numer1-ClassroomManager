import { paginatedGroupStudentsResponseSchema } from "../models/composite";
import { Elysia, t } from "elysia";
import { GroupStudentsController } from "../controllers/group_students";
import { insertGroupStudentSchema, selectSimpleGroupStudentSchema, updateGroupStudentSchema, patchGroupStudentSchema, groupStudentsQuerySchema } from "../models/group_students";
import { authGuard } from "../auth/authGuard";

const groupStudentsRoutes = new Elysia({
    prefix: "/group-students",
})
    .use(authGuard)
    .get("/", GroupStudentsController.getAll, {
        query: groupStudentsQuerySchema,
        response: paginatedGroupStudentsResponseSchema
    })
    .get("/:id", GroupStudentsController.getById, {
        params: t.Object({ id: t.String() }),
        response: selectSimpleGroupStudentSchema
    })
    .post("/", GroupStudentsController.create, {
        body: insertGroupStudentSchema,
        response: selectSimpleGroupStudentSchema
    })
    .put("/:id", GroupStudentsController.update, {
        params: t.Object({ id: t.String() }),
        body: updateGroupStudentSchema,
        response: selectSimpleGroupStudentSchema
    })
    .patch("/:id", GroupStudentsController.patch, {
        params: t.Object({ id: t.String() }),
        body: patchGroupStudentSchema,
        response: selectSimpleGroupStudentSchema
    })
    .delete("/:id", GroupStudentsController.remove, {
        params: t.Object({ id: t.String() }),
    });

export default groupStudentsRoutes;
