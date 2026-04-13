import { selectCompositeStudentSchema, paginatedStudentsResponseSchema } from "../models/composite";
import { Elysia, t } from "elysia";
import { StudentsController } from "../controllers/students";
import { insertStudentSchema, updateStudentSchema, patchStudentSchema, studentsQuerySchema } from "../models/students";
import { authGuard } from "../auth/authGuard";

const studentsRoutes = new Elysia({
    prefix: "/students",
})
    .use(authGuard)
    .get("/", StudentsController.getAll, {
        query: studentsQuerySchema,
        response: paginatedStudentsResponseSchema
    })
    .get("/:id", StudentsController.getById, {
        params: t.Object({ id: t.String() }),
        response: selectCompositeStudentSchema
    })
    .post("/", StudentsController.create, {
        body: insertStudentSchema,
        response: selectCompositeStudentSchema
    })
    .put("/:id", StudentsController.update, {
        params: t.Object({ id: t.String() }),
        body: updateStudentSchema,
        response: selectCompositeStudentSchema
    })
    .patch("/:id", StudentsController.patch, {
        params: t.Object({ id: t.String() }),
        body: patchStudentSchema,
        response: selectCompositeStudentSchema
    })
    .delete("/:id", StudentsController.remove, {
        params: t.Object({ id: t.String() }),
    });

export default studentsRoutes;
