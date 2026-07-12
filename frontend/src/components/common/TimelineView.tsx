import { DayTimeline } from "@/components/common/DayTimeline";
import { useSelectedDate, useSelectedDateRange } from "../../stores/useSelectedDateStore";
import { useCurrentTimeTicker } from "../../utils/CurrentTime";
import { startOfWeek, endOfWeek, eachDayOfInterval, isToday, format, isSameDay } from "date-fns";
import { useRef, useEffect } from "react";
import { Eclipse } from "lucide-react";
import eden from "../../lib/eden";
import { useClassroomReservations, useClassroomReservationsActions } from "../../stores/useClassroomReservationsStore";

function CurrentTimeLine () {
    const now = useCurrentTimeTicker(60000);
    const top = now.getHours() * 64 + (now.getMinutes() / 60) * 64;
    return(
        <div className="z-20 w-full border-t-3 border-orange absolute" style={{ top: `${top}px` }}>
            <div className="w-16 text-end pr-1 font-semibold text-orange">{format(now, "HH:mm")}</div>
        </div>
    );
}


export function TimelineView () {
        const numberOfDisplayedDays = useSelectedDateRange();
        const selectedDate = useSelectedDate();
        const hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
        const scrollContainerRef = useRef<HTMLDivElement>(null);
        const now = useCurrentTimeTicker(60000);


        const daysOfTheWeek = ["Sun","Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        let displayedDays: Date[];
        if (numberOfDisplayedDays===7)
        {
            const displayStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
            const displayEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
            displayedDays = eachDayOfInterval({start: displayStart, end: displayEnd})
        } else {
            const displayStart = selectedDate.getDate()-1;
            const displayEnd = selectedDate.getDate()+(numberOfDisplayedDays-2);
            displayedDays = eachDayOfInterval({start: displayStart, end: displayEnd})
        }

        // Get reservations for the days dispalyed
        const classroomReservations = useClassroomReservations();
        const { fetchClassroomReservations } = useClassroomReservationsActions();
        useEffect(() => {
            if (displayedDays[0]) {
                fetchClassroomReservations(displayedDays[0], numberOfDisplayedDays);
            }
        }, [fetchClassroomReservations, displayedDays[0], numberOfDisplayedDays]);

        // Scroll to current time on mount
        useEffect(() => {
            if (scrollContainerRef.current) {
                const top = now.getHours() * 64 + (now.getMinutes() / 60) * 64;
                // Scroll with some offset to center the current time better
                scrollContainerRef.current.scrollTop = top - 100;
            }
        }, []);
    return (
        <div className="flex flex-col h-full pt-8 bg-white w-full">
            {/*Header with day labels*/}
            <div className="flex flex-row shrink-0 my-2">
                <div className="w-16 flex shrink-0"></div>
                <div className="w-full h-full grid" style={{ gridTemplateColumns: `repeat(${numberOfDisplayedDays}, 1fr)` }}>
                    {
                        displayedDays.map((day) => {
                                const dayTextClassName = [ 
                                    isToday(day) && "rounded-xl px-2 py-1 bg-orange text-white font-bold",
                                    !isToday(day) && "font-semibold text-darker-grey"
                                    ].filter(Boolean).join('');
                            return(
                                <div key={day.toISOString()} className="text-center">
                                    <span className={dayTextClassName}>{daysOfTheWeek[day.getDay()]} {day.getDate()}</span>
                                </div>
                            )
                        })}
                </div>
            </div>
            {/*Body where the timeline resides*/}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto flex min-h-0 relative">
                <div className="flex w-full absolute z-0">
                    <div className="w-16 text-end font-semibold text-grey">
                        {hours.map(hour => {
                            return (
                                <div key={hour} className="h-16 border-t border-grey text-sm">
                                    <span className="mr-1">{hour+":00"}</span>
                                </div>
                            )
                        })}
                    </div>
                    <div
                        className="grid flex-1 w-full"
                        style={{ gridTemplateColumns: `repeat(${numberOfDisplayedDays}, minmax(0, 1fr))` }}
                    >
                        {
                            displayedDays.map((day) => {
                                const reservations = classroomReservations.filter(reservation => isSameDay(reservation.reservationTime, day))
                                return (

                                    <DayTimeline key={day.toISOString()} day={day} reservations={reservations} numberOfDisplayedDays={numberOfDisplayedDays} />
                                );
                            })}
                    </div>
                </div>
                {/* Linia aktualnego czasu*/}
                <CurrentTimeLine />
            </div>
        </div>
    )
}