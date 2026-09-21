import { create } from "zustand/react";
import type { selectCompositeClassroomReservationSchema } from "../../../backend/app/src/models/composite";
import type {
    createClassroomReservationSchema,
    createRecurringReservationSchema,
    patchClassroomReservationSchema,
    checkConflictsSchema,
    conflictResultSchema,
} from "../../../backend/app/src/models/classroom_reservations";
import eden from "@/lib/eden";

export type Reservation = typeof selectCompositeClassroomReservationSchema.static;
export type NewReservation = typeof createClassroomReservationSchema.static;
export type NewRecurringReservation = typeof createRecurringReservationSchema.static;
export type ReservationPatch = typeof patchClassroomReservationSchema.static;
export type ConflictCheck = typeof checkConflictsSchema.static;
export type ConflictResult = typeof conflictResultSchema.static;

export type ReservationView = "all" | "recurring" | "upcoming" | "archived";

type ReservationsState = {
    reservations: Reservation[];
    isLoading: boolean;
    view: ReservationView;
    search: string;
    actions: {
        fetchReservations: (view?: ReservationView, search?: string) => Promise<void>;
        createReservation: (data: NewReservation) => Promise<void>;
        createRecurringReservation: (data: NewRecurringReservation) => Promise<void>;
        patchReservation: (id: string, data: ReservationPatch) => Promise<void>;
        patchFutureReservation: (id: string, data: ReservationPatch) => Promise<void>;
        deleteReservation: (id: string) => Promise<void>;
        checkConflicts: (input: ConflictCheck) => Promise<ConflictResult>;
        checkFutureConflicts: (id: string, data: ReservationPatch) => Promise<ConflictResult>;
    };
};

function throwIfError(error: unknown, fallback: string) {
    if (!error) return;
    const value = (error as { value?: unknown })?.value;
    throw new Error(typeof value === "string" && value.length > 0 ? value : fallback);
}

export const useReservationsStore = create<ReservationsState>()((set, get) => ({
    reservations: [],
    isLoading: false,
    view: "all",
    search: "",
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
                    view,
                    search: search ?? "",
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
            const response = await eden["classroom-reservations"].post(data);
            throwIfError(response.error, "Failed to create reservation");
            await get().actions.fetchReservations(get().view, get().search || undefined);
        },
        createRecurringReservation: async (data: NewRecurringReservation) => {
            const response = await eden["classroom-reservations"].recurring.post(data);
            throwIfError(response.error, "Failed to create recurring reservation");
            await get().actions.fetchReservations(get().view, get().search || undefined);
        },
        patchReservation: async (id: string, data: ReservationPatch) => {
            const response = await eden["classroom-reservations"]({ id }).patch(data);
            throwIfError(response.error, "Failed to update reservation");
            await get().actions.fetchReservations(get().view, get().search || undefined);
        },
        patchFutureReservation: async (id: string, data: ReservationPatch) => {
            const response = await eden["classroom-reservations"]({ id }).future.patch(data);
            throwIfError(response.error, "Failed to update future reservations");
            await get().actions.fetchReservations(get().view, get().search || undefined);
        },
        deleteReservation: async (id: string) => {
            const response = await eden["classroom-reservations"]({ id }).delete();
            throwIfError(response.error, "Failed to delete reservation");
            await get().actions.fetchReservations(get().view, get().search || undefined);
        },
        checkConflicts: async (input: ConflictCheck) => {
            const response = await eden["classroom-reservations"].conflicts.post(input);
            if (response.error || !response.data) {
                const value = (response.error as { value?: unknown })?.value;
                throw new Error(typeof value === "string" && value.length > 0 ? value : "Failed to check conflicts");
            }
            return response.data;
        },
        checkFutureConflicts: async (id: string, data: ReservationPatch) => {
            const response = await eden["classroom-reservations"]({ id })["future-conflicts"].post(data);
            if (response.error || !response.data) {
                const value = (response.error as { value?: unknown })?.value;
                throw new Error(typeof value === "string" && value.length > 0 ? value : "Failed to check conflicts");
            }
            return response.data;
        },
    },
}));

export const useReservations = () => useReservationsStore((state) => state.reservations);
export const useReservationsLoading = () => useReservationsStore((state) => state.isLoading);
export const useReservationsActions = () => useReservationsStore((state) => state.actions);
