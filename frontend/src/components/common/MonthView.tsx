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
        <div className="w-full overflow-hidden rounded-2xl border border-light-grey bg-white">
            <div className="grid grid-cols-7 border-b border-light-grey">
                {WEEKDAYS.map((weekday) => (
                    <span
                        key={weekday}
                        className="border-r border-light-grey py-2.5 text-center text-xs font-bold uppercase tracking-wide text-darker-grey last:border-r-0"
                    >
                        {weekday}
                    </span>
                ))}
            </div>
            {weeks.map((week, weekIndex) => (
                <div
                    key={week[0]?.toISOString()}
                    className={cn(
                        "grid grid-cols-7",
                        weekIndex < weeks.length - 1 && "border-b border-light-grey",
                    )}
                >
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
                                    "relative flex min-h-[4.5rem] flex-col items-start gap-1 overflow-hidden border-r border-light-grey p-1.5 text-left transition last:border-r-0 sm:min-h-[7rem] sm:gap-2 sm:p-3",
                                    inMonth && "hover:bg-light-grey/60",
                                    !inMonth && "cursor-default bg-light-grey/40",
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
                                    <span className="max-w-full truncate rounded-full bg-orange/10 px-2 py-0.5 text-[10px] font-bold text-orange sm:px-2.5 sm:py-1 sm:text-xs">
                                        {count}
                                        <span className="hidden sm:inline"> {count === 1 ? "class" : "classes"}</span>
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
