import { paginatedTeacherStudentsResponseSchema } from "../models/composite";
import { Elysia, t } from "elysia";
import { TeacherStudentsController } from "../controllers/teacher_students";
import { insertTeacherStudentSchema, selectSimpleTeacherStudentSchema, updateTeacherStudentSchema, patchTeacherStudentSchema, teacherStudentsQuerySchema } from "../models/teacher_students";
import { authGuard } from "../auth/authGuard";

const teacherStudentsRoutes = new Elysia({
    prefix: "/teacher-students",
})
    .use(authGuard)
    .get("/", TeacherStudentsController.getAll, {
        query: teacherStudentsQuerySchema,
        response: paginatedTeacherStudentsResponseSchema
    })
    .get("/:id", TeacherStudentsController.getById, {
        params: t.Object({ id: t.String() }),
        response: selectSimpleTeacherStudentSchema
    })
    .post("/", TeacherStudentsController.create, {
        body: insertTeacherStudentSchema,
        response: selectSimpleTeacherStudentSchema
    })
    .put("/:id", TeacherStudentsController.update, {
        params: t.Object({ id: t.String() }),
        body: updateTeacherStudentSchema,
        response: selectSimpleTeacherStudentSchema
    })
    .patch("/:id", TeacherStudentsController.patch, {
        params: t.Object({ id: t.String() }),
        body: patchTeacherStudentSchema,
        response: selectSimpleTeacherStudentSchema
    })
    .delete("/:id", TeacherStudentsController.remove, {
        params: t.Object({ id: t.String() }),
    });

export default teacherStudentsRoutes;
