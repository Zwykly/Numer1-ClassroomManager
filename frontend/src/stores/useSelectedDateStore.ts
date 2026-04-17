import { startOfDay } from "date-fns";
import { use } from "react";
import { create } from "zustand";

type SelectedDateState = {
    selectedDate: Date;
    actions: {
        setSelectedDate: (date: Date) => void;
        setDateToToday: () => void;
    }
}

export const useSelectedDateStore = create<SelectedDateState>()((set) => ({
    selectedDate: new Date(),
    actions: {
        setSelectedDate: (date: Date) => set({ selectedDate: date }),
        setDateToToday: () => set({ selectedDate: startOfDay(new Date()) }),
    }
}));

export const useSelectedDate = () => useSelectedDateStore((state) => state.selectedDate);

export const useSelectedDateActions = () => useSelectedDateStore((state) => state.actions);