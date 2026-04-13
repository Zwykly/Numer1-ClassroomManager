import { selectCompositeUserSchema, paginatedUsersResponseSchema } from "../models/composite";
import { Elysia, t } from "elysia";
import { UsersController } from "../controllers/users";
import { insertUserSchema, updateUserSchema, patchUserSchema, usersQuerySchema } from "../models/users";
import { authGuard } from "../auth/authGuard";

const usersRoutes = new Elysia({
    prefix: "/users",
})
    .use(authGuard)
    .get("/", UsersController.getAll, {
        query: usersQuerySchema,
        response: paginatedUsersResponseSchema
    })
    .get("/:id", UsersController.getById, {
        params: t.Object({ id: t.String() }),
        response: selectCompositeUserSchema
    })
    .get("/auth/:authId", UsersController.getByAuthId, {
        params: t.Object({ authId: t.String() }),
        response: selectCompositeUserSchema
    })
    .post("/", UsersController.create, {
        body: insertUserSchema,
        response: selectCompositeUserSchema
    })
    .put("/:id", UsersController.update, {
        params: t.Object({ id: t.String() }),
        body: updateUserSchema,
        response: selectCompositeUserSchema
    })
    .patch("/:id", UsersController.patch, {
        params: t.Object({ id: t.String() }),
        body: patchUserSchema,
        response: selectCompositeUserSchema
    })
    .delete("/:id", UsersController.remove, {
        params: t.Object({ id: t.String() }),
    });

export default usersRoutes;
