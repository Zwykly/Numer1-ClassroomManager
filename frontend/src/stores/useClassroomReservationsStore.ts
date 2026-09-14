import { create } from "zustand/react";
import type { selectCalendarReservationSchema } from "../../../backend/app/src/models/composite";
import eden from "@/lib/eden";

export type ClassroomReservation = typeof selectCalendarReservationSchema.static;

export type ClassroomReservationFilter = {
    classroomId?: string;
    onlineClassroomId?: string;
    includeOnline?: boolean;
};

type ClassroomReservationsState = {
    classroomReservations: ClassroomReservation[];
    isLoading: boolean;
    actions: {
        fetchClassroomReservations: (from: Date, to: Date, filter?: ClassroomReservationFilter) => Promise<void>;
        setClassroomReservations: (reservations: ClassroomReservation[]) => void;
        clearClassroomReservations: () => void;
    }
}
export const useClassroomReservationsStore = create<ClassroomReservationsState>()((set) => ({
    classroomReservations: [],
    isLoading: false,
    actions: {
        setClassroomReservations: (reservations: ClassroomReservation[]) => set({ classroomReservations: reservations }),
        clearClassroomReservations: () => set({ classroomReservations: [] }),
        fetchClassroomReservations: async (from: Date, to: Date, filter?: ClassroomReservationFilter) => {
            set({ isLoading: true });
            try {
                const response = await eden["classroom-reservations"].calendar.get({
                    query: {
                        from: from.toISOString(),
                        to: to.toISOString(),
                        ...(filter?.classroomId ? { classroomId: filter.classroomId } : {}),
                        ...(filter?.onlineClassroomId ? { onlineClassroomId: filter.onlineClassroomId } : {}),
                        ...(filter?.includeOnline === false ? { includeOnline: false } : {}),
                    },
                });

                if (response.error || !response.data) {
                    console.error("Failed to fetch classroom reservations:", response.error);
                    set({ classroomReservations: [] });
                    return;
                }

                set({
                    classroomReservations: response.data.map((reservation) => ({
                        ...reservation,
                        reservationTime: new Date(reservation.reservationTime as unknown as string),
                    })),
                });
            } catch (error) {
                console.error("Failed to fetch classroom reservations:", error);
                set({ classroomReservations: [] });
            } finally {
                set({ isLoading: false });
            }
        }
    }
}));

export const useClassroomReservations = () => useClassroomReservationsStore((state) => state.classroomReservations);
export const useClassroomReservationsLoading = () => useClassroomReservationsStore((state) => state.isLoading);
export const useClassroomReservationsActions = () => useClassroomReservationsStore((state) => state.actions);
