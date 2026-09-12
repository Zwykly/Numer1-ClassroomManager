import { DayTimeline } from "@/components/common/DayTimeline";
import { MonthView } from "@/components/common/MonthView";
import { DayClassesModal } from "@/components/common/DayClassesModal";
import { ClassDetailsModal } from "@/components/common/ClassDetailsModal";
import { ReservationFormModal } from "@/components/ReservationFormModal";
import { useSelectedDate, useSelectedView } from "../../stores/useSelectedDateStore";
import { useCurrentTimeTicker } from "../../utils/CurrentTime";
import { isToday, format, isSameDay } from "date-fns";
import { useRef, useEffect, useState } from "react";
import { useAuth } from "@/utils/AuthProvider";
import { getDisplayedDays, getFetchRange, HOUR_HEIGHT } from "../../utils/calendarRange";
import { useClassroomReservations, useClassroomReservationsActions, type ClassroomReservation } from "../../stores/useClassroomReservationsStore";
import { useSelectedClassFilter, useSelectedClassroom } from "../../stores/useSelectedTimelineStore";
import { useReservationsActions, type Reservation, type ReservationPatch } from "../../stores/useReservationsStore";
import eden from "@/lib/eden";

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
        const isAdmin = UserData?.user?.userInfo?.role === "admin";
        const selectedClassroom = useSelectedClassroom();
        const classFilter = useSelectedClassFilter();
        const [selectedDay, setSelectedDay] = useState<Date | null>(null);
        const [dayModalOpen, setDayModalOpen] = useState(false);
        const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
        const [detailsOpen, setDetailsOpen] = useState(false);
        const [detailsLoading, setDetailsLoading] = useState(false);
        const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
        const [editOpen, setEditOpen] = useState(false);

        const daysOfTheWeek = ["Sun","Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const displayedDays = getDisplayedDays(selectedDate, view);
        const { from, to } = getFetchRange(selectedDate, view);

        // Get reservations for the days displayed
        const classroomReservations = useClassroomReservations();
        const { fetchClassroomReservations } = useClassroomReservationsActions();
        const { patchReservation } = useReservationsActions();
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

        const openDay = (day: Date) => {
            setSelectedDay(day);
            setDayModalOpen(true);
        };

        const openDetails = async (reservation: ClassroomReservation) => {
            setDayModalOpen(false);
            setSelectedReservation(null);
            setDetailsOpen(true);
            setDetailsLoading(true);
            try {
                const response = await eden["classroom-reservations"]({ id: reservation.id }).get();
                if (!response.error && response.data) {
                    setSelectedReservation(response.data as unknown as Reservation);
                }
            } catch (error) {
                console.error("Failed to load class:", error);
            } finally {
                setDetailsLoading(false);
            }
        };

        const handleEdit = (reservation: Reservation) => {
            setEditingReservation(reservation);
            setDetailsOpen(false);
            setEditOpen(true);
        };

        const handleUpdate = async (id: string, data: ReservationPatch) => {
            await patchReservation(id, data);
            await fetchClassroomReservations(from, to, selectedClassroom === "all" ? undefined : selectedClassroom);
        };

        const dayReservations = selectedDay
            ? visibleReservations.filter((reservation) => isSameDay(reservation.reservationTime, selectedDay))
            : [];

        const modals = (
            <>
                <ClassDetailsModal
                    open={detailsOpen}
                    onOpenChange={setDetailsOpen}
                    reservation={selectedReservation}
                    isLoading={detailsLoading}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    onEdit={handleEdit}
                />
                <ReservationFormModal
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    reservation={editingReservation}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    onCreate={async () => {}}
                    onCreateRecurring={async () => {}}
                    onUpdate={handleUpdate}
                />
            </>
        );

        if (view === "month") {
            return (
                <div className="flex h-full w-full flex-col overflow-y-auto bg-white px-6 pt-6">
                    <MonthView selectedDate={selectedDate} reservations={visibleReservations} onSelectDay={openDay} />
                    <DayClassesModal
                        open={dayModalOpen}
                        onOpenChange={setDayModalOpen}
                        day={selectedDay}
                        reservations={dayReservations}
                        currentUserId={currentUserId}
                        onSelectReservation={openDetails}
                    />
                    {modals}
                </div>
            );
        }

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

                                    <DayTimeline
                                        key={day.toISOString()}
                                        day={day}
                                        reservations={reservations}
                                        currentUserId={currentUserId}
                                        onSelectReservation={openDetails}
                                    />
                                );
                            })}
                    </div>
                </div>
                {/* Linia aktualnego czasu*/}
                <CurrentTimeLine />
            </div>
            {modals}
        </div>
    )
}
