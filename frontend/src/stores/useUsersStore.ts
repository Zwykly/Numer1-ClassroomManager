import { create } from "zustand/react";
import type { selectCompositeUserSchema } from "../../../backend/app/src/models/composite";
import type { createUserAccountSchema, patchUserSchema } from "../../../backend/app/src/models/users";
import eden from "@/lib/eden";

export type User = typeof selectCompositeUserSchema.static;
export type NewUserAccount = typeof createUserAccountSchema.static;
export type UserPatch = typeof patchUserSchema.static;

type UsersState = {
    users: User[];
    isLoading: boolean;
    actions: {
        fetchUsers: (search?: string) => Promise<void>;
        createUser: (data: NewUserAccount) => Promise<string | null>;
        patchUser: (id: string, data: UserPatch) => Promise<void>;
        deleteUser: (id: string) => Promise<void>;
        resetUserPassword: (id: string) => Promise<string | null>;
        setOwnPassword: (newPassword: string) => Promise<boolean>;
    }
}

export const useUsersStore = create<UsersState>()((set, get) => ({
    users: [],
    isLoading: false,
    actions: {
        fetchUsers: async (search?: string) => {
            set({ isLoading: true });
            try {
                const response = await eden.users.get({
                    query: {
                        limit: 100,
                        ...(search ? { search } : {}),
                    }
                });
                set({ users: response.data?.data ?? [] });
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                set({ isLoading: false });
            }
        },
        createUser: async (data: NewUserAccount) => {
            try {
                const response = await eden.users.account.post(data);
                await get().actions.fetchUsers();
                return response.data?.password ?? null;
            } catch (error) {
                console.error("Failed to create user:", error);
                return null;
            }
        },
        patchUser: async (id: string, data: UserPatch) => {
            try {
                await eden.users({ id }).patch(data);
                await get().actions.fetchUsers();
            } catch (error) {
                console.error("Failed to patch user:", error);
            }
        },
        deleteUser: async (id: string) => {
            try {
                await eden.users({ id }).delete();
                await get().actions.fetchUsers();
            } catch (error) {
                console.error("Failed to delete user:", error);
            }
        },
        resetUserPassword: async (id: string) => {
            try {
                const response = await eden.users({ id }).password.post();
                return response.data?.password ?? null;
            } catch (error) {
                console.error("Failed to reset user password:", error);
                return null;
            }
        },
        setOwnPassword: async (newPassword: string) => {
            try {
                const response = await eden.users.me.password.patch({ newPassword });
                return !response.error;
            } catch (error) {
                console.error("Failed to set password:", error);
                return false;
            }
        },
    }
}));

export const useUsers = () => useUsersStore((state) => state.users);
export const useUsersLoading = () => useUsersStore((state) => state.isLoading);
export const useUsersActions = () => useUsersStore((state) => state.actions);
