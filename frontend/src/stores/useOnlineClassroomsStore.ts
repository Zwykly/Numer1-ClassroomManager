import { create } from "zustand/react";
import type { selectCompositeOnlineClassroomSchema } from "../../../backend/app/src/models/composite";
import eden from "@/lib/eden";

export type OnlineClassroom = typeof selectCompositeOnlineClassroomSchema.static;

type OnlineClassroomsState = {
    onlineClassrooms: OnlineClassroom[];
    isLoading: boolean;
    actions: {
        fetchOnlineClassrooms: () => Promise<void>;
    }
}

export const useOnlineClassroomsStore = create<OnlineClassroomsState>()((set) => ({
    onlineClassrooms: [],
    isLoading: false,
    actions: {
        fetchOnlineClassrooms: async () => {
            set({ isLoading: true });
            try {
                const response = await eden["online-classrooms"].get({ query: { limit: 100 } });
                set({ onlineClassrooms: response.data?.data ?? [] });
            } catch (error) {
                console.error("Failed to fetch online classrooms:", error);
            } finally {
                set({ isLoading: false });
            }
        }
    }
}));

export const useOnlineClassrooms = () => useOnlineClassroomsStore((state) => state.onlineClassrooms);
export const useOnlineClassroomsLoading = () => useOnlineClassroomsStore((state) => state.isLoading);
export const useOnlineClassroomsActions = () => useOnlineClassroomsStore((state) => state.actions);
