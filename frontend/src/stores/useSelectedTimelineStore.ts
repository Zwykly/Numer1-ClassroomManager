import { create } from "zustand";

export type ClassFilter = "all" | "mine";

type SelectedTimelineState = {
    selectedClassroom: string;
    selectedClassFilter: ClassFilter;
    includeOnline: boolean;
    actions: {
        setSelectedClassroom: (classroom: string) => void;
        setSelectedClassFilter: (filter: ClassFilter) => void;
        setIncludeOnline: (includeOnline: boolean) => void;
    }
}

export const useSelectedTimelineStore = create<SelectedTimelineState>()((set) => ({
    selectedClassroom: "all",
    selectedClassFilter: "all",
    includeOnline: true,
    actions: {
        setSelectedClassroom: (classroom: string) => set({ selectedClassroom: classroom }),
        setSelectedClassFilter: (filter: ClassFilter) => set({ selectedClassFilter: filter }),
        setIncludeOnline: (includeOnline: boolean) => set({ includeOnline }),
    }
}));

export const useSelectedClassroom = () => useSelectedTimelineStore((state) => state.selectedClassroom);
export const useSelectedClassFilter = () => useSelectedTimelineStore((state) => state.selectedClassFilter);
export const useSelectedIncludeOnline = () => useSelectedTimelineStore((state) => state.includeOnline);

export const useSelectedTimelineActions = () => useSelectedTimelineStore((state) => state.actions);
