import { create } from "zustand/react";
import type { selectCompositeGroupSchema } from "../../../backend/app/src/models/composite";
import type { createGroupSchema, patchGroupSchema } from "../../../backend/app/src/models/groups";
import eden from "@/lib/eden";

export type Group = typeof selectCompositeGroupSchema.static;
export type NewGroup = typeof createGroupSchema.static;
export type GroupPatch = typeof patchGroupSchema.static;

type GroupsState = {
    groups: Group[];
    isLoading: boolean;
    actions: {
        fetchGroups: (search?: string) => Promise<void>;
        createGroup: (data: NewGroup) => Promise<void>;
        patchGroup: (id: string, data: GroupPatch) => Promise<void>;
        deleteGroup: (id: string) => Promise<void>;
    }
}

export const useGroupsStore = create<GroupsState>()((set, get) => ({
    groups: [],
    isLoading: false,
    actions: {
        fetchGroups: async (search?: string) => {
            set({ isLoading: true });
            try {
                const response = await eden.groups.get({
                    query: {
                        limit: 100,
                        ...(search ? { search } : {}),
                    }
                });
                set({ groups: response.data?.data ?? [] });
            } catch (error) {
                console.error("Failed to fetch groups:", error);
            } finally {
                set({ isLoading: false });
            }
        },
        createGroup: async (data: NewGroup) => {
            try {
                await eden.groups.post(data);
                await get().actions.fetchGroups();
            } catch (error) {
                console.error("Failed to create group:", error);
            }
        },
        patchGroup: async (id: string, data: GroupPatch) => {
            try {
                await eden.groups({ id }).patch(data);
                await get().actions.fetchGroups();
            } catch (error) {
                console.error("Failed to patch group:", error);
            }
        },
        deleteGroup: async (id: string) => {
            try {
                await eden.groups({ id }).delete();
                await get().actions.fetchGroups();
            } catch (error) {
                console.error("Failed to delete group:", error);
            }
        },
    }
}));

export const useGroups = () => useGroupsStore((state) => state.groups);
export const useGroupsLoading = () => useGroupsStore((state) => state.isLoading);
export const useGroupsActions = () => useGroupsStore((state) => state.actions);
