import { DayTimeline } from "@/components/common/DayTimeline";
import { useSelectedDate, useSelectedView } from "../../stores/useSelectedDateStore";
import { useCurrentTimeTicker } from "../../utils/CurrentTime";
import { isToday, format, isSameDay } from "date-fns";
import { useRef, useEffect } from "react";
import { useAuth } from "@/utils/AuthProvider";
import { getDisplayedDays, getFetchRange } from "../../utils/calendarRange";
import { useClassroomReservations, useClassroomReservationsActions } from "../../stores/useClassroomReservationsStore";
import { useSelectedClassFilter, useSelectedClassroom } from "../../stores/useSelectedTimelineStore";

const HOUR_HEIGHT = 64;

function CurrentTimeLine () {
    const now = useCurrentTimeTicker(60000);
    const top = now.getHours() * HOUR_HEIGHT + (now.getMinutes() / 60) * HOUR_HEIGHT;
    return(
        <div className="z-20 w-full border-t-3 border-orange absolute" style={{ top: `${top}px` }}>
            <div className="w-16 text-end pr-1 font-semibold text-orange">{format(now, "HH:mm")}</div>
        </div>
    );
}


export function TimelineView () {
        const view = useSelectedView();
        const selectedDate = useSelectedDate();
        const hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
        const scrollContainerRef = useRef<HTMLDivElement>(null);
        const now = useCurrentTimeTicker(60000);
        const { UserData } = useAuth();
        const currentUserId = UserData?.user?.userInfo?.id;
        const selectedClassroom = useSelectedClassroom();
        const classFilter = useSelectedClassFilter();

        const daysOfTheWeek = ["Sun","Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const displayedDays = getDisplayedDays(selectedDate, view);
        const { from, to } = getFetchRange(selectedDate, view);

        // Get reservations for the days displayed
        const classroomReservations = useClassroomReservations();
        const { fetchClassroomReservations } = useClassroomReservationsActions();
        useEffect(() => {
            fetchClassroomReservations(from, to, selectedClassroom === "all" ? undefined : selectedClassroom);
        }, [fetchClassroomReservations, from.getTime(), to.getTime(), selectedClassroom]);

        const visibleReservations = classroomReservations.filter((reservation) =>
            classFilter === "mine" ? reservation.teacherId === currentUserId : true,
        );

        // Scroll to current time on mount
        useEffect(() => {
            if (scrollContainerRef.current) {
                const top = now.getHours() * HOUR_HEIGHT + (now.getMinutes() / 60) * HOUR_HEIGHT;
                // Scroll with some offset to center the current time better
                scrollContainerRef.current.scrollTop = top - 100;
            }
        }, []);
    return (
        <div className="flex flex-col h-full pt-8 bg-white w-full">
            {/*Header with day labels*/}
            <div className="flex flex-row shrink-0 my-2">
                <div className="w-16 flex shrink-0"></div>
                <div className="w-full h-full grid" style={{ gridTemplateColumns: `repeat(${displayedDays.length}, 1fr)` }}>
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
                        style={{ gridTemplateColumns: `repeat(${displayedDays.length}, minmax(0, 1fr))` }}
                    >
                        {
                            displayedDays.map((day) => {
                                const reservations = visibleReservations.filter(reservation => isSameDay(reservation.reservationTime, day))
                                return (

                                    <DayTimeline key={day.toISOString()} day={day} reservations={reservations} />
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
