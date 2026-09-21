import { create } from "zustand/react";
import type { Reservation } from "./useReservationsStore";
import type { Student } from "./useStudentsStore";
import type { User } from "./useUsersStore";
import type { Group } from "./useGroupsStore";
import type { Classroom } from "./useClassroomsStore";

export type ActionModal = "reservation" | "student" | "user" | "group" | "classroom";

type ActionModalState = {
    activeModal: ActionModal | null;
    reservation: Reservation | null;
    student: Student | null;
    user: User | null;
    group: Group | null;
    classroom: Classroom | null;
    actions: {
        openReservation: (reservation?: Reservation | null) => void;
        openStudent: (student?: Student | null) => void;
        openUser: (user?: User | null) => void;
        openGroup: (group?: Group | null) => void;
        openClassroom: (classroom?: Classroom | null) => void;
        close: () => void;
    };
};

export const useActionModalStore = create<ActionModalState>()((set) => ({
    activeModal: null,
    reservation: null,
    student: null,
    user: null,
    group: null,
    classroom: null,
    actions: {
        openReservation: (reservation = null) => set({ activeModal: "reservation", reservation }),
        openStudent: (student = null) => set({ activeModal: "student", student }),
        openUser: (user = null) => set({ activeModal: "user", user }),
        openGroup: (group = null) => set({ activeModal: "group", group }),
        openClassroom: (classroom = null) => set({ activeModal: "classroom", classroom }),
        close: () => set({ activeModal: null, reservation: null, student: null, user: null, group: null, classroom: null }),
    },
}));

export const useActiveActionModal = () => useActionModalStore((state) => state.activeModal);
export const useReservationModalData = () => useActionModalStore((state) => state.reservation);
export const useStudentModalData = () => useActionModalStore((state) => state.student);
export const useUserModalData = () => useActionModalStore((state) => state.user);
export const useGroupModalData = () => useActionModalStore((state) => state.group);
export const useClassroomModalData = () => useActionModalStore((state) => state.classroom);
export const useActionModalActions = () => useActionModalStore((state) => state.actions);
