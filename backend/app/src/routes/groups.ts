import { Elysia, t } from "elysia";
import { groupsController } from "../controllers/groups";
import { insertGroupSchema, selectGroupSchema, updateGroupSchema, removeGroupSchema } from "../models/groups"

const groupsRoutes = new Elysia({
    prefix: "/groups",
})
    .get("/", async () => await groupsController.getAllGroups(), {
        response: t.Array(selectGroupSchema)
    })
    .post("/", async ({ body }) => await groupsController.createGroup(body), {
        body: insertGroupSchema,
        response: selectGroupSchema
    })
    .put("/", async ({ body }) => await groupsController.updateGroup(body), {
        body: updateGroupSchema,
        response: selectGroupSchema
    })
    .delete("/", async ({ body }) => await groupsController.removeGroup(body), {
        body: removeGroupSchema,
        response: selectGroupSchema
    });

export default groupsRoutes;
