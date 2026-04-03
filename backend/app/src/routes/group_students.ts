import { Elysia, t } from "elysia";
import { groupStudentsController } from "../controllers/group_students";
import { insertGroupStudentSchema, selectGroupStudentSchema, updateGroupStudentSchema, removeGroupStudentSchema } from "../models/group_students"

const groupStudentsRoutes = new Elysia({
    prefix: "/group-students",
})
    .get("/", async () => await groupStudentsController.getAllGroupStudents(), {
        response: t.Array(selectGroupStudentSchema)
    })
    .post("/", async ({ body }) => await groupStudentsController.createGroupStudent(body), {
        body: insertGroupStudentSchema,
        response: selectGroupStudentSchema
    })
    .put("/", async ({ body }) => await groupStudentsController.updateGroupStudent(body), {
        body: updateGroupStudentSchema,
        response: selectGroupStudentSchema
    })
    .delete("/", async ({ body }) => await groupStudentsController.removeGroupStudent(body), {
        body: removeGroupStudentSchema,
        response: selectGroupStudentSchema
    });

export default groupStudentsRoutes;
