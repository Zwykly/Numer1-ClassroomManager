import { useEffect, useRef, useState } from "react";
import { isSameDay, isToday } from "date-fns";
import { HOUR_HEIGHT, TIMELINE_HOURS, minutesFromTimelineStart, type CalendarView } from "@/utils/calendarRange";
import { DayTimeline } from "./DayTimeline";
import { CurrentTimeLine } from "./CurrentTimeLine";
import type { ClassroomReservation } from "@/stores/useClassroomReservationsStore";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TIME_GUTTER = "4rem";

type MobileTimelineProps = {
    days: Date[];
    reservations: ClassroomReservation[];
    currentUserId?: string;
    onSelectReservation: (reservation: ClassroomReservation) => void;
    view: CalendarView;
};

export function MobileTimeline({
    days,
    reservations,
    currentUserId,
    onSelectReservation,
    view,
}: MobileTimelineProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const didInitScroll = useRef(false);
    const [containerWidth, setContainerWidth] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth : 0,
    );

    useEffect(() => {
        if (didInitScroll.current || !scrollContainerRef.current) return;
        const top = (minutesFromTimelineStart(new Date()) / 60) * HOUR_HEIGHT;
        scrollContainerRef.current.scrollTop = Math.max(top - 100, 0);
        didInitScroll.current = true;
    }, []);

    useEffect(() => {
        const element = scrollContainerRef.current;
        if (!element) return;
        const update = () => setContainerWidth(element.clientWidth);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    // Size columns from the actual scroll container instead of `100vw`, which
    // includes scrollbars and unsafe areas on iOS and can overflow.
    const columnWidth = view === "day"
        ? `calc(${containerWidth}px - ${TIME_GUTTER})`
        : `calc((${containerWidth}px - ${TIME_GUTTER}) / 3)`;

    return (
        <div ref={scrollContainerRef} className="relative min-h-0 flex-1 overflow-auto overscroll-contain bg-canvas">
            <div className="sticky top-0 z-40 flex w-max min-w-full flex-row bg-canvas pb-2">
                <div className="sticky left-0 z-50 w-16 shrink-0 bg-canvas" />
                {days.map((day) => {
                    const dayTextClassName = [
                        isToday(day) && "rounded-xl px-2 py-1 bg-orange text-white font-bold",
                        !isToday(day) && "font-semibold text-darker-grey",
                    ].filter(Boolean).join(" ");

                    return (
                        <div
                            key={day.toISOString()}
                            className="shrink-0 py-1 text-center"
                            style={{ width: columnWidth }}
                        >
                            <span className={dayTextClassName}>
                                {DAYS_OF_WEEK[day.getDay()]} {day.getDate()}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="relative flex w-max min-w-full">
                <div className="sticky left-0 z-30 w-16 shrink-0 bg-canvas text-end font-semibold text-darker-grey">
                    {TIMELINE_HOURS.map((hour) => (
                        <div key={hour} className="h-16 border-t border-grid text-sm">
                            <span className="mr-1">{hour + ":00"}</span>
                        </div>
                    ))}
                </div>

                {days.map((day) => {
                    const dayReservations = reservations.filter((reservation) =>
                        isSameDay(reservation.reservationTime, day),
                    );
                    return (
                        <div key={day.toISOString()} className="shrink-0" style={{ width: columnWidth }}>
                            <DayTimeline
                                day={day}
                                reservations={dayReservations}
                                currentUserId={currentUserId}
                                onSelectReservation={onSelectReservation}
                            />
                        </div>
                    );
                })}

                <CurrentTimeLine />
            </div>
        </div>
    );
}
