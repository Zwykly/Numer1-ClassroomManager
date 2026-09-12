import {
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    isSameDay,
    isSameMonth,
    startOfMonth,
    startOfWeek,
} from 'date-fns';
import { clsx as cn } from "clsx";
import { useSelectedDate, useSelectedDateActions, useSelectedView } from '../stores/useSelectedDateStore';
import { dayKey, getDisplayedDays } from '../utils/calendarRange';
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
    const selectedView = useSelectedView();
    const { setSelectedDate } = useSelectedDateActions();
    const today = new Date();
    // Function that changes the selected day state in store.
    const changeSelectedDay = (newSelectedDate: Date) => {
        setSelectedDate(newSelectedDate);
    }

    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Days currently shown in the timeline view, used to highlight the grey band.
    const displayedDays = new Set(getDisplayedDays(selectedDate, selectedView).map(dayKey));

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
            <div className='w-full h-full flex flex-col items-start justify-between px-2'>
                <div className='grid grid-cols-7 w-full h-auto text-center text-darker-grey font-bold py-0.5'>
                    <a>Mo</a>
                    <a>Tu</a>
                    <a>We</a>
                    <a>Th</a>
                    <a>Fr</a>
                    <a>Sa</a>
                    <a>Su</a>
                </div>
                {weeks.map((week) => {
                    // Contiguous range of columns that belong to the currently displayed days.
                    const displayedColumns = week
                        .map((day, index) => (displayedDays.has(dayKey(day)) ? index : -1))
                        .filter((index) => index !== -1);
                    const bandStart = displayedColumns[0];
                    const bandEnd = displayedColumns[displayedColumns.length - 1];

                    return (
                        <div key={week[0]?.toISOString()} className="relative grid grid-cols-7 w-full h-auto text-center py-0.5">
                            {bandStart !== undefined && bandEnd !== undefined && (
                                <div
                                    className="pointer-events-none absolute top-0.5 bottom-0.5 rounded-sm bg-grey"
                                    style={{
                                        left: `${(bandStart / 7) * 100}%`,
                                        width: `${((bandEnd - bandStart + 1) / 7) * 100}%`,
                                    }}
                                />
                            )}
                            {week.map((day) => {
                                let className = ['relative z-10 duration-300 hover:bg-orange/30 rounded-sm',
                                    !isSameMonth(day, selectedDate) && 'text-darker-grey font-light duration-300 hover:bg-orange/30 rounded-sm',
                                    isSameMonth(day, selectedDate) && 'text-light-black font-bold',
                                    isSameDay(day, selectedDate) && 'bg-orange text-white rounded-sm font-semibold',
                                    isSameDay(day, today) && 'ring-2 ring-orange rounded-sm',
                                ].filter(Boolean).join(' ');

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
