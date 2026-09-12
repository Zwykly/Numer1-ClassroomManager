import { create } from "zustand/react";
import type { selectCompositeGroupSchema } from "../../../backend/app/src/models/composite";
import eden from "@/lib/eden";

export type Group = typeof selectCompositeGroupSchema.static;

type GroupsState = {
    groups: Group[];
    isLoading: boolean;
    actions: {
        fetchGroups: () => Promise<void>;
    }
}

export const useGroupsStore = create<GroupsState>()((set) => ({
    groups: [],
    isLoading: false,
    actions: {
        fetchGroups: async () => {
            set({ isLoading: true });
            try {
                const response = await eden.groups.get({ query: { limit: 100 } });
                set({ groups: response.data?.data ?? [] });
            } catch (error) {
                console.error("Failed to fetch groups:", error);
            } finally {
                set({ isLoading: false });
            }
        }
    }
}));

export const useGroups = () => useGroupsStore((state) => state.groups);
export const useGroupsLoading = () => useGroupsStore((state) => state.isLoading);
export const useGroupsActions = () => useGroupsStore((state) => state.actions);
