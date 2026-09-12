import { useEffect } from "react";
import { Select } from 'radix-ui';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx as cn } from "clsx";
import { addDays, format } from "date-fns";
import { useSelectedClassroom, useSelectedClassFilter, useSelectedTimelineActions, type ClassFilter } from '../../stores/useSelectedTimelineStore';
import { useSelectedView, useSelectedDate, useSelectedDateActions } from '../../stores/useSelectedDateStore';
import { useClassrooms, useClassroomsActions } from '../../stores/useClassroomsStore';
import { CALENDAR_VIEWS, MOBILE_CALENDAR_VIEWS } from '../../utils/calendarRange';
import { useIsMobile } from '@/utils/useMediaQuery';

const disableRing = '!border-0 !outline-none !ring-0 !shadow-none focus:!outline-none focus-visible:!outline-none focus:!ring-0 focus-visible:!ring-0';

export function TimelineSelector() {
    const isMobile = useIsMobile();
    const selectedView = useSelectedView();
    const { setSelectedView } = useSelectedDateActions();

    useEffect(() => {
        if (isMobile) {
            if (!MOBILE_CALENDAR_VIEWS.some((view) => view.value === selectedView)) {
                setSelectedView("threeDays");
            }
        } else if (!CALENDAR_VIEWS.some((view) => view.value === selectedView)) {
            setSelectedView("week");
        }
    }, [isMobile, selectedView, setSelectedView]);

    return(
        <div className="flex pt-4 px-4 sm:pt-15 sm:px-6 bg-canvas flex-col w-full">
            <div className="flex flex-row items-center justify-between gap-4">
                <ClassroomSelector />
                <ViewSelector />
            </div>
            <MobileDateNav />
            <FilterSelector />
        </div>
    )
} 

function ClassroomSelector() {
    const classrooms = useClassrooms();
    const { fetchClassrooms } = useClassroomsActions();
    const selectedClassroom = useSelectedClassroom();
    const { setSelectedClassroom } = useSelectedTimelineActions();

    useEffect(() => {
        fetchClassrooms();
    }, [fetchClassrooms]);

    const selectedClassroomName = selectedClassroom === "all"
        ? "All classrooms"
        : classrooms.find((classroom) => classroom.id === selectedClassroom)?.name ?? "All classrooms";

    return (
        <Select.Root value={selectedClassroom} onValueChange={setSelectedClassroom}>
            <Select.Trigger className={cn('inline-flex w-fit items-center gap-1 text-black font-bold text-2xl sm:text-4xl cursor-pointer', disableRing)}>
                <Select.Value asChild>
                    <span>{selectedClassroomName}</span>
                </Select.Value>
                <Select.Icon className='flex flex-col justify-end h-full'>
                    <ChevronDown />
                </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content 
                    className='z-50 bg-light-grey rounded-md shadow-lg select-none'
                    side="bottom"
                    align="start"
                    position="popper"
                >
                    <Select.Viewport>
                        <Select.Item 
                            className={cn('text-lg sm:text-2xl py-1 px-3 gap-2 flex items-center transition duration-200 ease-in-out text-darker-grey hover:text-white hover:bg-orange transition-100 cursor-pointer rounded', disableRing)} 
                            value="all"
                        >
                            All classrooms
                        </Select.Item>
                        {
                            classrooms.map((classroom) => {
                                return (
                                    <Select.Item 
                                        key={classroom.id}
                                        className={cn('text-lg sm:text-2xl py-1 px-3 gap-2 flex items-center transition duration-200 ease-in-out text-darker-grey hover:text-white hover:bg-orange transition-100 cursor-pointer rounded', disableRing)} 
                                        value={classroom.id}
                                    >
                                        {classroom.name}
                                    </Select.Item>
                                );
                            })
                        }
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    )
}

function ViewSelector() {
    const isMobile = useIsMobile();
    const selectedView = useSelectedView();
    const { setSelectedView } = useSelectedDateActions();
    const views = isMobile ? MOBILE_CALENDAR_VIEWS : CALENDAR_VIEWS;

    return (
        <div className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-light-grey p-1">
            {views.map((view) => {
                const isSelected = selectedView === view.value;
                return (
                    <button
                        key={view.value}
                        onClick={() => setSelectedView(view.value)}
                        className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-bold transition sm:px-4 sm:text-sm",
                            isSelected ? "bg-orange text-white" : "text-darker-grey hover:text-black",
                        )}
                    >
                        {view.label}
                    </button>
                );
            })}
        </div>
    );
}

function MobileDateNav() {
    const selectedDate = useSelectedDate();
    const { setSelectedDate, setDateToToday } = useSelectedDateActions();

    return (
        <div className="mt-3 flex items-center justify-between gap-2 lg:hidden">
            <button
                type="button"
                aria-label="Previous day"
                onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                className="rounded-lg border border-light-grey bg-white p-2 text-darker-grey transition hover:border-grey hover:text-black"
            >
                <ChevronLeft size={18} />
            </button>
            <button
                type="button"
                onClick={setDateToToday}
                className="flex-1 rounded-lg border border-light-grey bg-white px-3 py-2 text-sm font-bold text-black transition hover:border-grey"
            >
                {format(selectedDate, "EEEE, d MMM")}
            </button>
            <button
                type="button"
                aria-label="Next day"
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                className="rounded-lg border border-light-grey bg-white p-2 text-darker-grey transition hover:border-grey hover:text-black"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}

function FilterSelector() {
    const filters: { value: ClassFilter; label: string }[] = [
        { value: "all", label: "All classes" },
        { value: "mine", label: "My classes" },
    ];
    const selectedClassFilter = useSelectedClassFilter();
    const { setSelectedClassFilter } = useSelectedTimelineActions();

    return (
        <div className='flex flex-row gap-5 mt-2'>
            {filters.map((filter) => {
                const isFilterSelected = selectedClassFilter === filter.value;
                const filterClass = ['text-lg font-regular cursor-pointer hover:text-orange ',
                    isFilterSelected && 'text-orange',
                    !isFilterSelected && 'text-darker-grey',
                ].filter(Boolean).join(' ');

                return(
                    <span
                        key={filter.value}
                        onClick={() => setSelectedClassFilter(filter.value)}
                        className={filterClass}
                    >
                        {filter.label}
                    </span>
                );
            })}
        </div>
    )
}
