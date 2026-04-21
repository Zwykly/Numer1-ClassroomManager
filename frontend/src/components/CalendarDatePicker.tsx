import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    startOfWeek,
    endOfWeek,
    eachWeekOfInterval,
    isSameMonth,
    isSameWeek,
    isSameDay,
    add,
} from 'date-fns';
import { clsx as cn } from "clsx";
import { se } from 'date-fns/locale';
import { useSelectedDate, useSelectedDateActions } from '../stores/useSelectedDateStore';
import { MonthPicker } from './common/MonthPicker';
import { MonthPickerPopover } from './common/MonthPickerPopover';

type CalendarDatePickerProps = {
    className?: string;
}

// Component that creates the calendar date picker.
export function CalendarDatePicker(
    {
        ...props
    }: CalendarDatePickerProps) {

    const selectedDate = useSelectedDate();
    const { setSelectedDate } = useSelectedDateActions();
    
    // Function that changes the selected day state in store.
    const changeSelectedDay = (newSelectedDate: Date) => {
        setSelectedDate(newSelectedDate);
    }

    const month = selectedDate?.toLocaleString('default', { month: 'long' });
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Mapping days to weeks for easier parsing to table
    const weeks: Date[][] = [];

    for (let i = 0; i < calendarDays.length; i += 7) {
        weeks.push(calendarDays.slice(i, i + 7));
    }

    let dayCounter = 0;

    return (

        <div className={cn("w-full h-auto bg-gray-200 flex flex-col items-center justify-between", props.className)}>
            <div className='w-full h-full flex flex-row items-start justify-between'>
                <MonthPickerPopover />
            </div>
            <div className='w-full h-full flex flex-col items-start justify-between'>
                <div className='grid grid-cols-7 gap-1 w-full h-auto text-center text-darker-grey font-bold px-2 py-0.5'>
                    <a>Mo</a>
                    <a>Tu</a>
                    <a>We</a>
                    <a>Th</a>
                    <a>Fr</a>
                    <a>Sa</a>
                    <a>Su</a>
                </div>
                {weeks.map((week) => {
                    let className = `grid grid-cols-7 gap-1 w-full h-auto text-center px-2 py-0.5`;
                    let additionalClass = ``;
                    if (isSameWeek(week[0], selectedDate, { weekStartsOn: 1 })) {
                        additionalClass = `bg-grey rounded-sm`;
                    }
                    return (
                        <div className={cn(className,additionalClass)}>
                        {week.map((day) => {
                            let className = ``;

                            if (!isSameMonth(day, selectedDate)) {
                                className = `text-darker-grey font-light duration-300 hover:bg-orange/30 rounded-sm`;
                            } else if (isSameDay(day, selectedDate)) {
                                className += `bg-orange text-white rounded-sm font-semibold`;
                                console.log(day);
                            } else {
                                className += `text-light-black font-semibold duration-300 hover:bg-orange/30 rounded-sm`;
                            }

                            return (
                                <button key={(dayCounter++).toString()} onClick={() => changeSelectedDay(day)} className={className}>
                                    {day.getDate()}
                                </button>
                            );
                        })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 