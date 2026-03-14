import { Elysia, t } from "elysia";
import { usersController } from "../controllers/users";
import { insertUserSchema, selectUserSchema, updateUserSchema, removeUserSchema, loginRequestUsersSchema, loginResponseUsersSchema } from "../models/users"
import { authGuard } from "../auth/authGuard";

const usersRoutes = new Elysia({
    prefix: "/users",
})
    .use(authGuard)
    .get("/me", async ({ user }) => await usersController.getUserInfo(user.userInfo.id), {
        response: selectUserSchema,
        isAuth: true,
    })
    .get("/", async () => await usersController.getAllUsers(), {
        response: t.Array(selectUserSchema)
    })
    .post("/", async ({ body }) => await usersController.createUser(body), {
        body: insertUserSchema,
        response: selectUserSchema
    })
    .put("/", async ({ body }) => await usersController.updateUser(body), {
        body: updateUserSchema,
        response: selectUserSchema
    })
    .delete("/", async ({ body }) => await usersController.removeUser(body), {
        body: removeUserSchema,
        response: selectUserSchema
    });

export default usersRoutes;
