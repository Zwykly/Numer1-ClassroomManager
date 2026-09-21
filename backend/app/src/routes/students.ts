import { selectCompositeStudentSchema, paginatedStudentsResponseSchema, selectStudentsBatchResponseSchema } from "../models/composite";
import { Elysia, t } from "elysia";
import { StudentsController } from "../controllers/students";
import { createStudentSchema, insertStudentsBatchSchema, updateStudentSchema, patchStudentSchema, studentsQuerySchema } from "../models/students";
import { authGuard } from "../auth/authGuard";

const studentsRoutes = new Elysia({
    prefix: "/students",
})
    .use(authGuard)
    .get("/", StudentsController.getAll, {
        query: studentsQuerySchema,
        response: paginatedStudentsResponseSchema,
        isAuth: true
    })
    .get("/:id", StudentsController.getById, {
        params: t.Object({ id: t.String() }),
        response: selectCompositeStudentSchema,
        isAuth: true
    })
    .post("/", StudentsController.create, {
        body: createStudentSchema,
        response: selectCompositeStudentSchema,
        isAdmin: true
    })
    .post("/batch", StudentsController.createMany, {
        body: insertStudentsBatchSchema,
        response: selectStudentsBatchResponseSchema,
        isAdmin: true
    })
    .put("/:id", StudentsController.update, {
        params: t.Object({ id: t.String() }),
        body: updateStudentSchema,
        response: selectCompositeStudentSchema,
        isAdmin: true
    })
    .patch("/:id", StudentsController.patch, {
        params: t.Object({ id: t.String() }),
        body: patchStudentSchema,
        response: selectCompositeStudentSchema,
        isAdmin: true
    })
    .delete("/:id", StudentsController.remove, {
        params: t.Object({ id: t.String() }),
        isAdmin: true
    });

export default studentsRoutes;
