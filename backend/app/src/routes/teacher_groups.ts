import { Elysia, t } from "elysia";
import { teacherGroupsController } from "../controllers/teacher_groups";
import { insertTeacherGroupSchema, selectTeacherGroupSchema, updateTeacherGroupSchema, removeTeacherGroupSchema } from "../models/teacher_groups"

const teacherGroupsRoutes = new Elysia({
    prefix: "/teacher-groups",
})
    .get("/", async () => await teacherGroupsController.getAllTeacherGroups(), {
        response: t.Array(selectTeacherGroupSchema)
    })
    .post("/", async ({ body }) => await teacherGroupsController.createTeacherGroup(body), {
        body: insertTeacherGroupSchema,
        response: selectTeacherGroupSchema
    })
    .put("/", async ({ body }) => await teacherGroupsController.updateTeacherGroup(body), {
        body: updateTeacherGroupSchema,
        response: selectTeacherGroupSchema
    })
    .delete("/", async ({ body }) => await teacherGroupsController.removeTeacherGroup(body), {
        body: removeTeacherGroupSchema,
        response: selectTeacherGroupSchema
    });

export default teacherGroupsRoutes;
