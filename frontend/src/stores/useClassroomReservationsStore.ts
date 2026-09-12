import { create } from "zustand/react";
import { addDays, endOfDay, startOfDay } from "date-fns";
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
            const from = startOfDay(date);
            const to = endOfDay(addDays(from, Math.max(range - 1, 0)));
            try {
                const response = await eden["classroom-reservations"].get({
                    query: {
                        from: from.toISOString(),
                        to: to.toISOString(),
                        limit: 100,
                    },
                });

                if (response.error || !response.data) {
                    console.error("Failed to fetch classroom reservations:", response.error);
                    set({ classroomReservations: [] });
                    return;
                }

                set({
                    classroomReservations: response.data.data.map((reservation) => ({
                        ...reservation,
                        reservationTime: new Date(reservation.reservationTime as unknown as string),
                    })),
                });
            } catch (error) {
                console.error("Failed to fetch classroom reservations:", error);
                set({ classroomReservations: [] });
            }
        }
    }
}));

export const useClassroomReservations = () => useClassroomReservationsStore((state) => state.classroomReservations);
export const useClassroomReservationsActions = () => useClassroomReservationsStore((state) => state.actions);