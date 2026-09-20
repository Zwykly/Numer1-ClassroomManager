import { useEffect, type ChangeEvent } from "react";
import { Select } from 'radix-ui';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx as cn } from "clsx";
import { addDays, format } from "date-fns";
import { useSelectedClassroom, useSelectedClassFilter, useSelectedIncludeOnline, useSelectedTimelineActions, type ClassFilter } from '../../stores/useSelectedTimelineStore';
import { useSelectedView, useSelectedDate, useSelectedDateActions } from '../../stores/useSelectedDateStore';
import { useClassrooms, useClassroomsActions } from '../../stores/useClassroomsStore';
import { useOnlineClassrooms, useOnlineClassroomsActions } from '../../stores/useOnlineClassroomsStore';
import { CALENDAR_VIEWS, MOBILE_CALENDAR_VIEWS } from '../../utils/calendarRange';
import { useIsMobile } from '@/utils/useMediaQuery';
import { useAuth } from '@/utils/AuthProvider';

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
        <div className="flex pt-4 px-4 pb-4 sm:pt-15 sm:px-6 sm:pb-0 bg-canvas flex-col w-full">
            <div className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2">
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
    const onlineClassrooms = useOnlineClassrooms();
    const { fetchOnlineClassrooms } = useOnlineClassroomsActions();
    const selectedClassroom = useSelectedClassroom();
    const { setSelectedClassroom } = useSelectedTimelineActions();

    useEffect(() => {
        fetchClassrooms();
    }, [fetchClassrooms]);

    useEffect(() => {
        fetchOnlineClassrooms();
    }, [fetchOnlineClassrooms]);

    const onlineClassroomLabel = (onlineClassroom: (typeof onlineClassrooms)[number]) => {
        const teacher = onlineClassroom.teacher;
        return teacher
            ? `${teacher.firstName} ${teacher.lastName} - online`
            : `${onlineClassroom.name} - online`;
    };

    const selectedOnlineId = selectedClassroom.startsWith("online:") ? selectedClassroom.slice("online:".length) : null;
    const selectedClassroomName = selectedClassroom === "all"
        ? "All classrooms"
        : selectedOnlineId
            ? (() => {
                const onlineClassroom = onlineClassrooms.find((item) => item.id === selectedOnlineId);
                return onlineClassroom ? onlineClassroomLabel(onlineClassroom) : "Online classroom";
            })()
            : classrooms.find((classroom) => classroom.id === selectedClassroom)?.name ?? "All classrooms";

    return (
        <Select.Root value={selectedClassroom} onValueChange={setSelectedClassroom}>
            <Select.Trigger className={cn('inline-flex min-w-0 max-w-full w-fit items-center gap-1 text-black font-bold text-2xl sm:text-4xl cursor-pointer', disableRing)}>
                <Select.Value asChild>
                    <span className="truncate">{selectedClassroomName}</span>
                </Select.Value>
                <Select.Icon className='flex flex-col justify-end h-full'>
                    <ChevronDown />
                </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content 
                    className='z-50 max-h-[min(60vh,var(--radix-select-content-available-height))] overflow-hidden bg-light-grey rounded-md shadow-lg select-none'
                    side="bottom"
                    align="start"
                    position="popper"
                    collisionPadding={8}
                >
                    <Select.Viewport className='max-h-[inherit] overflow-y-auto overscroll-contain'>
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
                        {
                            onlineClassrooms.map((onlineClassroom) => {
                                return (
                                    <Select.Item
                                        key={onlineClassroom.id}
                                        className={cn('text-lg sm:text-2xl py-1 px-3 gap-2 flex items-center transition duration-200 ease-in-out text-darker-grey hover:text-white hover:bg-orange transition-100 cursor-pointer rounded', disableRing)}
                                        value={`online:${onlineClassroom.id}`}
                                    >
                                        {onlineClassroomLabel(onlineClassroom)}
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
    const { setSelectedDate } = useSelectedDateActions();

    const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (!value) return;
        const [year, month, day] = value.split("-").map(Number);
        if (!year || !month || !day) return;
        setSelectedDate(new Date(year, month - 1, day));
    };

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
            <div className="relative flex-1">
                <div className="w-full rounded-lg border border-light-grey bg-white px-3 py-2 text-center text-sm font-bold text-black">
                    {format(selectedDate, "EEEE, d MMM")}
                </div>
                <input
                    type="date"
                    aria-label="Select a date"
                    value={format(selectedDate, "yyyy-MM-dd")}
                    onChange={handleDateChange}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                />
            </div>
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
    const selectedClassroom = useSelectedClassroom();
    const includeOnline = useSelectedIncludeOnline();
    const { setSelectedClassFilter, setIncludeOnline } = useSelectedTimelineActions();
    const { UserData } = useAuth();
    const isAdmin = UserData?.user?.userInfo?.role === "admin";

    return (
        <div className='flex flex-row flex-wrap items-center gap-5 mt-3'>
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

            {isAdmin && selectedClassroom === "all" && (
                <button
                    type="button"
                    onClick={() => setIncludeOnline(!includeOnline)}
                    title={includeOnline ? "Hide online classes" : "Show online classes"}
                    className={cn(
                        "rounded-full border px-3 py-1 text-sm font-bold transition",
                        includeOnline
                            ? "border-orange bg-orange/10 text-orange"
                            : "border-light-grey bg-white text-darker-grey hover:border-grey",
                    )}
                >
                    Online classes
                </button>
            )}
        </div>
    )
}
