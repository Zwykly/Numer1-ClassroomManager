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

export const HOUR_HEIGHT = 64;

export const TIMELINE_START_HOUR = 6;
export const TIMELINE_END_HOUR = 24;

export const TIMELINE_HOURS = Array.from(
    { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR },
    (_, index) => TIMELINE_START_HOUR + index,
);

export function minutesFromTimelineStart(date: Date): number {
    return date.getHours() * 60 + date.getMinutes() - TIMELINE_START_HOUR * 60;
}

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
