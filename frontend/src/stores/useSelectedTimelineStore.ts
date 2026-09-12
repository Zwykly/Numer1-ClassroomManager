import { create } from "zustand";

export type ClassFilter = "all" | "mine";

type SelectedTimelineState = {
    selectedClassroom: string;
    selectedClassFilter: ClassFilter;
    actions: {
        setSelectedClassroom: (classroom: string) => void;
        setSelectedClassFilter: (filter: ClassFilter) => void;
    }
}

export const useSelectedTimelineStore = create<SelectedTimelineState>()((set) => ({
    selectedClassroom: "all",
    selectedClassFilter: "all",
    actions: {
        setSelectedClassroom: (classroom: string) => set({ selectedClassroom: classroom }),
        setSelectedClassFilter: (filter: ClassFilter) => set({ selectedClassFilter: filter }),
    }
}));

export const useSelectedClassroom = () => useSelectedTimelineStore((state) => state.selectedClassroom);
export const useSelectedClassFilter = () => useSelectedTimelineStore((state) => state.selectedClassFilter);

export const useSelectedTimelineActions = () => useSelectedTimelineStore((state) => state.actions);
