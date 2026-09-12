import { create } from "zustand/react";
import type { selectCompositeClassroomReservationSchema } from "../../../backend/app/src/models/composite";
import type {
    createClassroomReservationSchema,
    createRecurringReservationSchema,
    patchClassroomReservationSchema,
} from "../../../backend/app/src/models/classroom_reservations";
import eden from "@/lib/eden";

export type Reservation = typeof selectCompositeClassroomReservationSchema.static;
export type NewReservation = typeof createClassroomReservationSchema.static;
export type NewRecurringReservation = typeof createRecurringReservationSchema.static;
export type ReservationPatch = typeof patchClassroomReservationSchema.static;

export type ReservationView = "all" | "recurring" | "upcoming" | "archived";

type ReservationsState = {
    reservations: Reservation[];
    isLoading: boolean;
    actions: {
        fetchReservations: (view?: ReservationView, search?: string) => Promise<void>;
        createReservation: (data: NewReservation) => Promise<void>;
        createRecurringReservation: (data: NewRecurringReservation) => Promise<void>;
        patchReservation: (id: string, data: ReservationPatch) => Promise<void>;
        deleteReservation: (id: string) => Promise<void>;
    };
};

export const useReservationsStore = create<ReservationsState>()((set, get) => ({
    reservations: [],
    isLoading: false,
    actions: {
        fetchReservations: async (view: ReservationView = "all", search?: string) => {
            set({ isLoading: true });
            try {
                const response = await eden["classroom-reservations"].get({
                    query: {
                        limit: 100,
                        view,
                        ...(search ? { search } : {}),
                    },
                });

                if (response.error || !response.data) {
                    console.error("Failed to fetch reservations:", response.error);
                    set({ reservations: [] });
                    return;
                }

                set({
                    reservations: response.data.data.map((reservation) => ({
                        ...reservation,
                        reservationTime: new Date(reservation.reservationTime as unknown as string),
                    })),
                });
            } catch (error) {
                console.error("Failed to fetch reservations:", error);
                set({ reservations: [] });
            } finally {
                set({ isLoading: false });
            }
        },
        createReservation: async (data: NewReservation) => {
            try {
                await eden["classroom-reservations"].post(data);
                await get().actions.fetchReservations();
            } catch (error) {
                console.error("Failed to create reservation:", error);
            }
        },
        createRecurringReservation: async (data: NewRecurringReservation) => {
            try {
                await eden["classroom-reservations"].recurring.post(data);
                await get().actions.fetchReservations();
            } catch (error) {
                console.error("Failed to create recurring reservation:", error);
            }
        },
        patchReservation: async (id: string, data: ReservationPatch) => {
            try {
                await eden["classroom-reservations"]({ id }).patch(data);
                await get().actions.fetchReservations();
            } catch (error) {
                console.error("Failed to patch reservation:", error);
            }
        },
        deleteReservation: async (id: string) => {
            try {
                await eden["classroom-reservations"]({ id }).delete();
                await get().actions.fetchReservations();
            } catch (error) {
                console.error("Failed to delete reservation:", error);
            }
        },
    },
}));

export const useReservations = () => useReservationsStore((state) => state.reservations);
export const useReservationsLoading = () => useReservationsStore((state) => state.isLoading);
export const useReservationsActions = () => useReservationsStore((state) => state.actions);
