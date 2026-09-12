import { create } from "zustand/react";
import type { selectCompositeClassroomSchema } from "../../../backend/app/src/models/composite";
import eden from "@/lib/eden";

export type Classroom = typeof selectCompositeClassroomSchema.static;

type ClassroomsState = {
    classrooms: Classroom[];
    isLoading: boolean;
    actions: {
        fetchClassrooms: () => Promise<void>;
    }
}

export const useClassroomsStore = create<ClassroomsState>()((set) => ({
    classrooms: [],
    isLoading: false,
    actions: {
        fetchClassrooms: async () => {
            set({ isLoading: true });
            try {
                const response = await eden.classrooms.get({ query: { limit: 100 } });
                set({ classrooms: response.data?.data ?? [] });
            } catch (error) {
                console.error("Failed to fetch classrooms:", error);
            } finally {
                set({ isLoading: false });
            }
        }
    }
}));

export const useClassrooms = () => useClassroomsStore((state) => state.classrooms);
export const useClassroomsLoading = () => useClassroomsStore((state) => state.isLoading);
export const useClassroomsActions = () => useClassroomsStore((state) => state.actions);
