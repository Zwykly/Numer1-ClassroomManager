import { startOfDay } from "date-fns";
import { use } from "react";
import { create } from "zustand";

type SelectedDateState = {
    selectedDate: Date;
    selectedDateRange: number;
    actions: {
        setSelectedDate: (date: Date) => void;
        setSelectedDateRange: (range: number) => void;
        setDateToToday: () => void;
    }
}

export const useSelectedDateStore = create<SelectedDateState>()((set) => ({
    selectedDate: new Date(),
    selectedDateRange: 7,
    actions: {
        setSelectedDate: (date: Date) => set({ selectedDate: date }),
        setSelectedDateRange: (range: number) => set({ selectedDateRange: range }),
        setDateToToday: () => set({ selectedDate: startOfDay(new Date()) }),
    }
}));

export const useSelectedDate = () => useSelectedDateStore((state) => state.selectedDate);
export const useSelectedDateRange = () => useSelectedDateStore((state) => state.selectedDateRange);

export const useSelectedDateActions = () => useSelectedDateStore((state) => state.actions);