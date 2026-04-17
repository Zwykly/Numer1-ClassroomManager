import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    startOfWeek,
    endOfWeek,
    eachWeekOfInterval,
} from 'date-fns';
import {clsx as cn} from "clsx"; 

type CalendarDatePickerProps = {
    selectedDate: Date;
    className?: string;
}


// Component that creates the calendar date picker.
export function CalendarDatePicker(
    {
       selectedDate, 
       ...props
    } : CalendarDatePickerProps)
    {
        const month = selectedDate?.toLocaleString('default', { month: 'long' });
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
        
        // Mapping days to weeks for easier parsing to table
        const weeks: Date[][] = [];

        for(let i = 0; i<calendarDays.length; i+=7)
        {
            weeks.push(calendarDays.slice(i, i+7));
        }
    return (

        <div className={cn("w-full h-auto bg-gray-200 flex flex-col items-center justify-between", props.className)}>
            <div className='w-full h-full flex flex-row items-start justify-between'>
                <h1>{month} {selectedDate?.getFullYear()}</h1>
            </div>
            <div className='w-full h-full flex flex-row items-start justify-between'>
                <table className='w-full h-full text-center'>
                    <thead>
                        <tr>
                            <th>Mo</th>
                            <th>Tu</th>
                            <th>We</th>
                            <th>Th</th>
                            <th>Fr</th>
                            <th>Sa</th>
                            <th>Su</th>
                        </tr>
                    </thead>
                    {weeks.map((week) => {
                        return (
                            <tr>
                                {week.map((day)=> {
                                    return (
                                        <td>{day.getDate()}</td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </table>
            </div>
        </div>
    );
} 