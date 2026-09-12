import { selectCompositeUserSchema, paginatedUsersResponseSchema, createUserAccountResponseSchema } from "../models/composite";
import { Elysia, t } from "elysia";
import { UsersController } from "../controllers/users";
import { insertUserSchema, updateUserSchema, patchUserSchema, usersQuerySchema, createUserAccountSchema } from "../models/users";
import { authGuard } from "../auth/authGuard";

const usersRoutes = new Elysia({
    prefix: "/users",
})
    .use(authGuard)
    .get("/", UsersController.getAll, {
        query: usersQuerySchema,
        response: paginatedUsersResponseSchema,
        isAdmin: true
    })
    .get("/:id", UsersController.getById, {
        params: t.Object({ id: t.String() }),
        response: selectCompositeUserSchema,
        isAdmin: true
    })
    .get("/auth/:authId", UsersController.getByAuthId, {
        params: t.Object({ authId: t.String() }),
        response: selectCompositeUserSchema,
        isAdmin: true
    })
    .post("/", UsersController.create, {
        body: insertUserSchema,
        response: selectCompositeUserSchema,
        isAdmin: true
    })
    .post("/account", UsersController.createAccount, {
        body: createUserAccountSchema,
        response: createUserAccountResponseSchema,
        isAdmin: true
    })
    .put("/:id", UsersController.update, {
        params: t.Object({ id: t.String() }),
        body: updateUserSchema,
        response: selectCompositeUserSchema,
        isAdmin: true
    })
    .patch("/:id", UsersController.patch, {
        params: t.Object({ id: t.String() }),
        body: patchUserSchema,
        response: selectCompositeUserSchema,
        isAdmin: true
    })
    .delete("/:id", UsersController.remove, {
        params: t.Object({ id: t.String() }),
        isAdmin: true
    });

export default usersRoutes;
