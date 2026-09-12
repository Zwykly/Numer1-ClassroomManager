import { NotFoundError, status } from "elysia";
import { UsersService } from "../services/users";
import { UserAccountsService } from "../services/user_accounts";
import { insertUserSchema, updateUserSchema, patchUserSchema, usersQuerySchema, createUserAccountSchema } from "../models/users";

export const UsersController = {
    async getAll({ query }: { query: typeof usersQuerySchema.static }) {
        return await UsersService.getAll(query);
    },

    async getById({ params: { id } }: { params: { id: string } }) {
        const user = await UsersService.getById(id);
        if (!user) throw new NotFoundError( "User not found");
        return user;
    },
    
    async getByAuthId({ params: { authId } }: { params: { authId: string } }) {
        const user = await UsersService.getByAuthId(authId);
        if (!user) throw new NotFoundError( "User not found");
        return user;
    },

    async getCurrentUser({ user }: { user: any }) {
        const userInfo = await UsersService.getById(user.userInfo.id);
        if (!userInfo) throw new NotFoundError( "User not found");
        return userInfo;
    },

    async create({ body }: { body: typeof insertUserSchema.static }) {
        const created = await UsersService.create(body);
        if (!created) throw new NotFoundError( "User not found");
        return created;
    },

    async createAccount({ body }: { body: typeof createUserAccountSchema.static }) {
        const result = await UserAccountsService.createAccount(body);
        if (!result.ok) {
            if (result.reason === "EMAIL_IN_USE") {
                throw status(400, "A user with this email already exists");
            }
            throw status(500, "Failed to create user account");
        }
        return { user: result.user, password: result.password };
    },

    async update({ params: { id }, body }: { params: { id: string }, body: typeof updateUserSchema.static }) {
        const updated = await UsersService.update(id, body);
        if (!updated) throw new NotFoundError( "User not found");
        return updated;
    },

    async patch({ params: { id }, body }: { params: { id: string }, body: typeof patchUserSchema.static }) {
        const patched = await UsersService.patch(id, body);
        if (!patched) throw new NotFoundError( "User not found");
        return patched;
    },

    async remove({ params: { id } }: { params: { id: string } }) {
        const removedUser = await UsersService.remove(id);
        if (!removedUser) throw new NotFoundError( "User not found");
        return { success: true, user: removedUser };
    }
} as const;
