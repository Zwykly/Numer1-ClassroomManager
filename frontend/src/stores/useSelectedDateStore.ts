import { startOfDay } from "date-fns";
import { create } from "zustand";
import type { CalendarView } from "../utils/calendarRange";

type SelectedDateState = {
    selectedDate: Date;
    selectedView: CalendarView;
    actions: {
        setSelectedDate: (date: Date) => void;
        setSelectedView: (view: CalendarView) => void;
        setDateToToday: () => void;
    }
}

export const useSelectedDateStore = create<SelectedDateState>()((set) => ({
    selectedDate: new Date(),
    selectedView: "week",
    actions: {
        setSelectedDate: (date: Date) => set({ selectedDate: date }),
        setSelectedView: (view: CalendarView) => set({ selectedView: view }),
        setDateToToday: () => set({ selectedDate: startOfDay(new Date()) }),
    }
}));

export const useSelectedDate = () => useSelectedDateStore((state) => state.selectedDate);
export const useSelectedView = () => useSelectedDateStore((state) => state.selectedView);

export const useSelectedDateActions = () => useSelectedDateStore((state) => state.actions);
