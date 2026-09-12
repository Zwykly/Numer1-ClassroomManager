import {
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    isToday,
    startOfMonth,
    startOfWeek,
} from "date-fns";
import { clsx as cn } from "clsx";
import type { ClassroomReservation } from "@/stores/useClassroomReservationsStore";

type MonthViewProps = {
    selectedDate: Date;
    reservations: ClassroomReservation[];
    onSelectDay: (day: Date) => void;
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function MonthView({ selectedDate, reservations, onSelectDay }: MonthViewProps) {
    const calendarStart = startOfWeek(startOfMonth(selectedDate), { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(endOfMonth(selectedDate), { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const weeks: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
        weeks.push(calendarDays.slice(i, i + 7));
    }

    const countByDay = new Map<string, number>();
    for (const reservation of reservations) {
        const key = format(reservation.reservationTime, "yyyy-MM-dd");
        countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
    }

    return (
        <div className="flex w-full flex-col gap-1">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-wide text-darker-grey">
                {WEEKDAYS.map((weekday) => (
                    <span key={weekday} className="py-2">{weekday}</span>
                ))}
            </div>
            {weeks.map((week) => (
                <div key={week[0]?.toISOString()} className="grid grid-cols-7 gap-1">
                    {week.map((day) => {
                        const count = countByDay.get(format(day, "yyyy-MM-dd")) ?? 0;
                        const inMonth = isSameMonth(day, selectedDate);
                        const selected = isSameDay(day, selectedDate);
                        const today = isToday(day);

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => onSelectDay(day)}
                                disabled={!inMonth}
                                className={cn(
                                    "flex min-h-[6.5rem] flex-col items-start gap-2 rounded-xl border border-transparent p-2 text-left transition",
                                    inMonth && "hover:border-light-grey hover:bg-light-grey/40",
                                    !inMonth && "cursor-default opacity-50",
                                )}
                            >
                                <span
                                    className={cn(
                                        "flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold",
                                        selected && "bg-orange text-white",
                                        !selected && inMonth && "text-light-black",
                                        !selected && !inMonth && "font-light text-darker-grey",
                                        today && !selected && "ring-2 ring-orange",
                                    )}
                                >
                                    {day.getDate()}
                                </span>
                                {count > 0 && (
                                    <span className="rounded-full bg-orange/10 px-2.5 py-1 text-xs font-bold text-orange">
                                        {count} {count === 1 ? "class" : "classes"}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
