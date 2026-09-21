import { create } from "zustand/react";
import type { selectCompositeClassroomSchema } from "../../../backend/app/src/models/composite";
import type { insertClassroomSchema, patchClassroomSchema } from "../../../backend/app/src/models/classrooms";
import eden from "@/lib/eden";

export type Classroom = typeof selectCompositeClassroomSchema.static;
export type NewClassroom = typeof insertClassroomSchema.static;
export type ClassroomPatch = typeof patchClassroomSchema.static;

function resolveErrorMessage(error: unknown, fallback: string): string {
    const value = (error as { value?: unknown } | null)?.value;
    if (typeof value === "string" && value.length > 0) return value;
    if (value && typeof value === "object" && "message" in value) {
        const message = (value as { message?: unknown }).message;
        if (typeof message === "string" && message.length > 0) return message;
    }
    return fallback;
}

type ClassroomsState = {
    classrooms: Classroom[];
    isLoading: boolean;
    actions: {
        fetchClassrooms: (search?: string) => Promise<void>;
        createClassroom: (data: NewClassroom) => Promise<void>;
        patchClassroom: (id: string, data: ClassroomPatch) => Promise<void>;
        deleteClassroom: (id: string) => Promise<void>;
    }
}

export const useClassroomsStore = create<ClassroomsState>()((set, get) => ({
    classrooms: [],
    isLoading: false,
    actions: {
        fetchClassrooms: async (search?: string) => {
            set({ isLoading: true });
            try {
                const response = await eden.classrooms.get({
                    query: {
                        limit: 100,
                        ...(search ? { search } : {}),
                    }
                });
                set({ classrooms: response.data?.data ?? [] });
            } catch (error) {
                console.error("Failed to fetch classrooms:", error);
            } finally {
                set({ isLoading: false });
            }
        },
        createClassroom: async (data: NewClassroom) => {
            const response = await eden.classrooms.post(data);
            if (response.error) {
                throw new Error(resolveErrorMessage(response.error, "Failed to create classroom."));
            }
            await get().actions.fetchClassrooms();
        },
        patchClassroom: async (id: string, data: ClassroomPatch) => {
            const response = await eden.classrooms({ id }).patch(data);
            if (response.error) {
                throw new Error(resolveErrorMessage(response.error, "Failed to update classroom."));
            }
            await get().actions.fetchClassrooms();
        },
        deleteClassroom: async (id: string) => {
            const response = await eden.classrooms({ id }).delete();
            if (response.error) {
                throw new Error(resolveErrorMessage(response.error, "Failed to delete classroom."));
            }
            await get().actions.fetchClassrooms();
        },
    }
}));

export const useClassrooms = () => useClassroomsStore((state) => state.classrooms);
export const useClassroomsLoading = () => useClassroomsStore((state) => state.isLoading);
export const useClassroomsActions = () => useClassroomsStore((state) => state.actions);
