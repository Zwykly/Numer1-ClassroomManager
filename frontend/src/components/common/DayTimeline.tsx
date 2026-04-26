import { clsx as cn } from "clsx";
import {eachHourOfInterval, getHours, isToday} from "date-fns";

type DayTimelineData = {
    numberOfDisplayedDays: number,
    className?: string,
    day: Date,
}

export function DayTimeline (
    {
        className,
        numberOfDisplayedDays,
        day,
        ...props
    } : DayTimelineData ) {

    const hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
    return (
            <div className="flex relative flex-col border-l-1 border-grey">
                {hours.map(hour => {
                    return (
                        <div className="h-16 border-t-1 border-grey">
                            
                        </div>
                    )
                })}
            </div>
    )
}