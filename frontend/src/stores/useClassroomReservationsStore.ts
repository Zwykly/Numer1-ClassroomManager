import { create } from "zustand/react";
import type { selectCompositeClassroomReservationSchema } from "../../../backend/app/src/models/composite";
import eden from "@/lib/eden";

export type ClassroomReservation = typeof selectCompositeClassroomReservationSchema.static;

type ClassroomReservationsState = {
    classroomReservations: ClassroomReservation[];
    actions: {
        fetchClassroomReservations: (date: Date, range: number) => Promise<void>;
        setClassroomReservations: (reservations: ClassroomReservation[]) => void;
        clearClassroomReservations: () => void;
    }
}
export const useClassroomReservationsStore = create<ClassroomReservationsState>()((set) => ({
    classroomReservations: [],
    actions: {
        setClassroomReservations: (reservations: ClassroomReservation[]) => set({ classroomReservations: reservations }),
        clearClassroomReservations: () => set({ classroomReservations: [] }),
        fetchClassroomReservations: async (date: Date, range: number) => {
            try {
                eden["classroom-reservations"].get()
                .then((data) => {
                    set({ classroomReservations: data.data?.data });
                }).catch((error) => {
                    console.error("Failed to fetch classroom reservations:", error);
                });
            } catch (error) {
                console.error("Failed to fetch classroom reservations:", error);
            }
        }
    }
}));

export const useClassroomReservations = () => useClassroomReservationsStore((state) => state.classroomReservations);
export const useClassroomReservationsActions = () => useClassroomReservationsStore((state) => state.actions);