import { selectCompositeGroupSchema, paginatedGroupsResponseSchema } from "../models/composite";
import { Elysia, t } from "elysia";
import { GroupsController } from "../controllers/groups";
import { createGroupSchema, updateGroupSchema, patchGroupSchema, groupsQuerySchema } from "../models/groups";
import { authGuard } from "../auth/authGuard";

const groupsRoutes = new Elysia({
    prefix: "/groups",
})
    .use(authGuard)
    .get("/", GroupsController.getAll, {
        query: groupsQuerySchema,
        response: paginatedGroupsResponseSchema
    })
    .get("/:id", GroupsController.getById, {
        params: t.Object({ id: t.String() }),
        response: selectCompositeGroupSchema
    })
    .post("/", GroupsController.create, {
        body: createGroupSchema,
        response: selectCompositeGroupSchema
    })
    .put("/:id", GroupsController.update, {
        params: t.Object({ id: t.String() }),
        body: updateGroupSchema,
        response: selectCompositeGroupSchema
    })
    .patch("/:id", GroupsController.patch, {
        params: t.Object({ id: t.String() }),
        body: patchGroupSchema,
        response: selectCompositeGroupSchema
    })
    .delete("/:id", GroupsController.remove, {
        params: t.Object({ id: t.String() }),
    });

export default groupsRoutes;
