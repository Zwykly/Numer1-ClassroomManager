import {
    addDays,
    eachDayOfInterval,
    endOfDay,
    endOfMonth,
    endOfWeek,
    format,
    startOfDay,
    startOfMonth,
    startOfWeek,
} from "date-fns";

export type CalendarView = "month" | "week" | "fiveDays";

export const CALENDAR_VIEWS: { value: CalendarView; label: string }[] = [
    { value: "month", label: "Month" },
    { value: "week", label: "7 days" },
    { value: "fiveDays", label: "5 days" },
];

export function dayKey(date: Date): string {
    return format(date, "yyyy-MM-dd");
}

export function getDisplayedDays(selectedDate: Date, view: CalendarView): Date[] {
    if (view === "month") {
        return eachDayOfInterval({ start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) });
    }

    if (view === "week") {
        return eachDayOfInterval({
            start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
            end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
        });
    }

    return eachDayOfInterval({ start: addDays(selectedDate, -2), end: addDays(selectedDate, 2) });
}

export function getFetchRange(selectedDate: Date, view: CalendarView): { from: Date; to: Date } {
    const days = getDisplayedDays(selectedDate, view);
    return {
        from: startOfDay(days[0]!),
        to: endOfDay(days[days.length - 1]!),
    };
}
