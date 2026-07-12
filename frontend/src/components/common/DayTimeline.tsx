import type { ClassroomReservation } from "@/stores/useClassroomReservationsStore";
import { clsx as cn } from "clsx";
import {eachHourOfInterval, getHours, isToday} from "date-fns";

type DayTimelineData = {
    numberOfDisplayedDays: number,
    className?: string,
    day: Date,
    reservations: ClassroomReservation[],
}

export function DayTimeline (
    {
        className,
        numberOfDisplayedDays,
        day,
        reservations,
        ...props
    } : DayTimelineData ) {

    const hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
    return (
            <div className="flex relative flex-col border-l border-grey">
                {hours.map(hour => {
                    return (
                        <div key={hour} className="h-16 border-t border-grey">
                            
                        </div>
                    )
                })}
                {reservations.map((reservation) => {
                    const top = reservation.reservationTime.getHours() * 64 + (reservation.reservationTime.getMinutes() / 60) * 64;
                    return (
                        
                        <div className="z-20 h-20 w-full absolute bg-amber-400" style={{ top: `${top}px` }}>
                        </div>
                    )
                })}
            </div>
    )
}