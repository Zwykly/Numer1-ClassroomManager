import { DayTimeline } from "@/components/common/DayTimeline";
import { MonthView } from "@/components/common/MonthView";
import { DayClassesModal } from "@/components/common/DayClassesModal";
import { ClassDetailsModal } from "@/components/common/ClassDetailsModal";
import { MobileTimeline } from "@/components/common/MobileTimeline";
import { CurrentTimeLine } from "@/components/common/CurrentTimeLine";
import { ReservationFormModal } from "@/components/ReservationFormModal";
import { useSelectedDate, useSelectedView } from "../../stores/useSelectedDateStore";
import { useCurrentTimeTicker } from "../../utils/CurrentTime";
import { isToday, isSameDay } from "date-fns";
import { useRef, useEffect, useState } from "react";
import { useAuth } from "@/utils/AuthProvider";
import { getDisplayedDays, getFetchRange, HOUR_HEIGHT, TIMELINE_HOURS, minutesFromTimelineStart } from "../../utils/calendarRange";
import { useIsMobile } from "@/utils/useMediaQuery";
import { useClassroomReservations, useClassroomReservationsActions, type ClassroomReservation } from "../../stores/useClassroomReservationsStore";
import { useSelectedClassFilter, useSelectedClassroom } from "../../stores/useSelectedTimelineStore";
import { useReservationsActions, type Reservation, type ReservationPatch } from "../../stores/useReservationsStore";
import eden from "@/lib/eden";


export function TimelineView () {
        const view = useSelectedView();
        const selectedDate = useSelectedDate();
        const isMobile = useIsMobile();
        const hours = TIMELINE_HOURS;
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
                const top = (minutesFromTimelineStart(now) / 60) * HOUR_HEIGHT;
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

        const handleCancel = async (reservation: Reservation) => {
            await patchReservation(reservation.id, { status: "canceled" });
            await fetchClassroomReservations(from, to, selectedClassroom === "all" ? undefined : selectedClassroom);
            setDetailsOpen(false);
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
                    onCancel={handleCancel}
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
                <div className="flex h-full w-full flex-col overflow-y-auto bg-canvas px-4 pt-4 sm:px-6 sm:pt-6">
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

        if (isMobile) {
            return (
                <div className="flex min-h-0 flex-1 flex-col bg-canvas w-full">
                    <MobileTimeline
                        days={displayedDays}
                        reservations={visibleReservations}
                        currentUserId={currentUserId}
                        onSelectReservation={openDetails}
                        columnWidth={
                            view === "day"
                                ? "calc(100vw - 4rem)"
                                : "calc((100vw - 4rem) / 3)"
                        }
                    />
                    {modals}
                </div>
            );
        }

    return (
        <div className="flex min-h-0 flex-1 flex-col pt-8 bg-canvas w-full">
            {/*Body where the timeline resides*/}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto min-h-0 relative">
                {/*Header with day labels - inside the scroll container so it shares the grid width*/}
                <div className="sticky top-0 z-30 flex flex-row bg-canvas pb-2">
                    <div className="w-16 flex shrink-0"></div>
                    <div className="w-full grid" style={{ gridTemplateColumns: `repeat(${displayedDays.length}, 1fr)` }}>
                        {
                            displayedDays.map((day) => {
                                    const dayTextClassName = [ 
                                        isToday(day) && "rounded-xl px-2 py-1 bg-orange text-white font-bold",
                                        !isToday(day) && "font-semibold text-darker-grey"
                                        ].filter(Boolean).join('');
                                return(
                                    <div key={day.toISOString()} className="py-1 text-center">
                                        <span className={dayTextClassName}>{daysOfTheWeek[day.getDay()]} {day.getDate()}</span>
                                    </div>
                                )
                            })}
                    </div>
                </div>
                {/*Timeline grid*/}
                <div className="relative flex w-full">
                    <div className="w-16 text-end font-semibold text-darker-grey">
                        {hours.map(hour => {
                            return (
                                <div key={hour} className="h-16 border-t border-grid text-sm">
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
                    {/* Linia aktualnego czasu*/}
                    <CurrentTimeLine />
                </div>
            </div>
            {modals}
        </div>
    )
}
