import { create } from "zustand/react";
import type { selectCompositeStudentSchema } from "../../../backend/app/src/models/composite";
import type { insertStudentSchema, patchStudentSchema } from "../../../backend/app/src/models/students";
import eden from "@/lib/eden";

export type Student = typeof selectCompositeStudentSchema.static;
export type NewStudent = typeof insertStudentSchema.static;
export type StudentPatch = typeof patchStudentSchema.static;

type StudentsState = {
    students: Student[];
    isLoading: boolean;
    actions: {
        fetchStudents: (search?: string) => Promise<void>;
        createStudents: (students: NewStudent[]) => Promise<void>;
        patchStudent: (id: string, data: StudentPatch) => Promise<void>;
        deleteStudent: (id: string) => Promise<void>;
    }
}

export const useStudentsStore = create<StudentsState>()((set, get) => ({
    students: [],
    isLoading: false,
    actions: {
        fetchStudents: async (search?: string) => {
            set({ isLoading: true });
            try {
                const response = await eden.students.get({
                    query: {
                        limit: 100,
                        ...(search ? { search } : {}),
                    }
                });
                set({ students: response.data?.data ?? [] });
            } catch (error) {
                console.error("Failed to fetch students:", error);
            } finally {
                set({ isLoading: false });
            }
        },
        createStudents: async (students: NewStudent[]) => {
            try {
                await eden.students.batch.post({ students });
                await get().actions.fetchStudents();
            } catch (error) {
                console.error("Failed to create students:", error);
            }
        },
        patchStudent: async (id: string, data: StudentPatch) => {
            try {
                await eden.students({ id }).patch(data);
                await get().actions.fetchStudents();
            } catch (error) {
                console.error("Failed to patch student:", error);
            }
        },
        deleteStudent: async (id: string) => {
            try {
                await eden.students({ id }).delete();
                await get().actions.fetchStudents();
            } catch (error) {
                console.error("Failed to delete student:", error);
            }
        }
    }
}));

export const useStudents = () => useStudentsStore((state) => state.students);
export const useStudentsLoading = () => useStudentsStore((state) => state.isLoading);
export const useStudentsActions = () => useStudentsStore((state) => state.actions);
