import { set, startOfDay } from "date-fns";
import { use } from "react";
import { create } from "zustand";

type SelectedTimelineState = {
    selectedClassroom: string;
    selectedUser: string;
    selectedTimelineFilters: string[];
    actions: {
        setSelectedClassroom: (classroom: string) => void;
        setSelectedUser: (user: string) => void;
        setSelectedTimelineFilters: (filters: string[]) => void;
    }
}

export const useSelectedTimelineStore = create<SelectedTimelineState>()((set) => ({
    selectedClassroom: "Hejka",
    selectedUser: "",
    selectedTimelineFilters: [],
    actions: {
        setSelectedClassroom: (classroom: string) => set({ selectedClassroom: classroom }),
        setSelectedUser: (user: string) => set({ selectedUser: user }),
        setSelectedTimelineFilters: (filters: string[]) => set({ selectedTimelineFilters: filters }),
    }
}));

export const useSelectedClassroom = () => useSelectedTimelineStore((state) => state.selectedClassroom);
export const useSelectedUser = () => useSelectedTimelineStore((state) => state.selectedUser);
export const useSelectedTimelineFilters = () => useSelectedTimelineStore((state) => state.selectedTimelineFilters);

export const useSelectedTimelineActions = () => useSelectedTimelineStore((state) => state.actions);