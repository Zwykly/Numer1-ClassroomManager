import { Select } from 'radix-ui';
import {ChevronDown} from 'lucide-react';
import { useSelectedClassroom, useSelectedTimelineActions, useSelectedTimelineFilters } from '../../stores/useSelectedTimelineStore';
import { clsx as cn } from "clsx";
import { boolean } from 'better-auth';
export function TimelineSelector() {

    return(
        <div className="flex pt-15 px-6 bg-white flex-col w-full">
            <ClassroomSelector />
            <FilterSelector />
        </div>
    )
} 

function ClassroomSelector() {
    const classrooms = ["Tvclassroom", "Hejka"];
    const selectedClassroom = useSelectedClassroom();
    const {setSelectedClassroom} = useSelectedTimelineActions();
    const disableRing = '!border-0 !outline-none !ring-0 !shadow-none focus:!outline-none focus-visible:!outline-none focus:!ring-0 focus-visible:!ring-0';
    return (
        <Select.Root value={selectedClassroom} onValueChange={setSelectedClassroom}>
            <Select.Trigger className={cn('inline-flex w-fit items-center gap-1 text-black font-bold text-4xl cursor-pointer',disableRing)}>
                <Select.Value asChild>
                    <span>{selectedClassroom || "Select a classroom"}</span>
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
                        {
                            classrooms.map((classroom) => {
                                return (
                                    <Select.Item 
                                        key={classroom}
                                        className={cn('text-2xl py-1 px-3 gap-2 flex items-center transition duration-200 ease-in-out text-darker-grey hover:text-white hover:bg-orange transition-100 cursor-pointer rounded',disableRing)} 
                                        value={classroom}
                                    >
                                        {classroom}
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

function FilterSelector() {

    const filters = ["All classes", "My classes"]
    const selectedTimelineFilters = useSelectedTimelineFilters();
    const { setSelectedTimelineFilters } = useSelectedTimelineActions();
    return (
        <div className='flex flex-row gap-5 mt-2'>
            {filters.map((filter) => {
                const isFilterSelected = selectedTimelineFilters.includes(filter);
                const filterClass = ['text-lg font-regular cursor-pointer hover:text-orange ',
                    isFilterSelected && 'text-orange',
                    !isFilterSelected && 'text-darker-grey',
                ].filter(Boolean).join(' ');

                return(
                    <span
                        key={filter}
                        onClick={() => clickFilter(filter, selectedTimelineFilters, setSelectedTimelineFilters)}
                        className={filterClass}
                    >
                        {filter}
                    </span>
                );
            })}
        </div>
    )
}

const clickFilter = (
    filter: string,
    selectedTimelineFilters: string[],
    setSelectedTimelineFilters: (filters: string[]) => void,
) => {
    if (selectedTimelineFilters.includes(filter))
    {
        setSelectedTimelineFilters(selectedTimelineFilters.filter((selectedFilter) => selectedFilter !== filter));
    } else {
        console.log("Usuwam" + filter)
        setSelectedTimelineFilters([...selectedTimelineFilters, filter]);
    }
}