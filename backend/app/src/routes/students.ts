import { Elysia, t } from "elysia";
import { studentsController } from "../controllers/students";
import { insertStudentSchema, selectStudentSchema, updateStudentSchema, removeStudentSchema } from "../models/students"

const studentsRoutes = new Elysia({
    prefix: "/students",
})
    .get("/", async () => await studentsController.getAllStudents(), {
        response: t.Array(selectStudentSchema)
    })
    .post("/", async ({ body }) => await studentsController.createStudent(body), {
        body: insertStudentSchema,
        response: selectStudentSchema
    })
    .put("/", async ({ body }) => await studentsController.updateStudent(body), {
        body: updateStudentSchema,
        response: selectStudentSchema
    })
    .delete("/", async ({ body }) => await studentsController.removeStudent(body), {
        body: removeStudentSchema,
        response: selectStudentSchema
    });

export default studentsRoutes;
