import { create } from "zustand/react";
import type { Reservation } from "./useReservationsStore";
import type { Student } from "./useStudentsStore";
import type { User } from "./useUsersStore";

export type ActionModal = "reservation" | "student" | "user";

type ActionModalState = {
    activeModal: ActionModal | null;
    reservation: Reservation | null;
    student: Student | null;
    user: User | null;
    actions: {
        openReservation: (reservation?: Reservation | null) => void;
        openStudent: (student?: Student | null) => void;
        openUser: (user?: User | null) => void;
        close: () => void;
    };
};

export const useActionModalStore = create<ActionModalState>()((set) => ({
    activeModal: null,
    reservation: null,
    student: null,
    user: null,
    actions: {
        openReservation: (reservation = null) => set({ activeModal: "reservation", reservation }),
        openStudent: (student = null) => set({ activeModal: "student", student }),
        openUser: (user = null) => set({ activeModal: "user", user }),
        close: () => set({ activeModal: null, reservation: null, student: null, user: null }),
    },
}));

export const useActiveActionModal = () => useActionModalStore((state) => state.activeModal);
export const useReservationModalData = () => useActionModalStore((state) => state.reservation);
export const useStudentModalData = () => useActionModalStore((state) => state.student);
export const useUserModalData = () => useActionModalStore((state) => state.user);
export const useActionModalActions = () => useActionModalStore((state) => state.actions);
