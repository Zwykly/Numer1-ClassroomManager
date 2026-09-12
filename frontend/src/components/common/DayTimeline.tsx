import type { ClassroomReservation } from "@/stores/useClassroomReservationsStore";
import { clsx as cn } from "clsx";
import { HOUR_HEIGHT, TIMELINE_HOURS, minutesFromTimelineStart } from "@/utils/calendarRange";
import { ClassTile } from "./ClassTile";

type DayTimelineData = {
    className?: string;
    day: Date;
    reservations: ClassroomReservation[];
    currentUserId?: string;
    onSelectReservation?: (reservation: ClassroomReservation) => void;
}

const HOURS = TIMELINE_HOURS;

type Positioned = {
    reservation: ClassroomReservation;
    left: number;
    width: number;
};

export function layoutReservations(reservations: ClassroomReservation[]): Positioned[] {
    const items = reservations
        .map((reservation) => {
            const minutes = reservation.reservationTime.getHours() * 60 + reservation.reservationTime.getMinutes();
            const duration = reservation.durationMinutes && reservation.durationMinutes > 0 ? reservation.durationMinutes : 60;
            return { reservation, start: minutes, end: minutes + duration };
        })
        .sort((a, b) => a.start - b.start || a.end - b.end);

    const positioned: Positioned[] = [];
    let clusterStart = 0;

    while (clusterStart < items.length) {
        let clusterEnd = clusterStart;
        let clusterMaxEnd = items[clusterStart]!.end;

        while (clusterEnd + 1 < items.length && items[clusterEnd + 1]!.start < clusterMaxEnd) {
            clusterEnd += 1;
            clusterMaxEnd = Math.max(clusterMaxEnd, items[clusterEnd]!.end);
        }

        const cluster = items.slice(clusterStart, clusterEnd + 1);
        const laneEnds: number[] = [];
        const laneOf = new Map<number, number>();

        cluster.forEach((item, index) => {
            let lane = laneEnds.findIndex((end) => end <= item.start);
            if (lane === -1) {
                lane = laneEnds.length;
                laneEnds.push(item.end);
            } else {
                laneEnds[lane] = item.end;
            }
            laneOf.set(index, lane);
        });

        const laneCount = laneEnds.length;
        cluster.forEach((item, index) => {
            const lane = laneOf.get(index) ?? 0;
            positioned.push({
                reservation: item.reservation,
                left: (lane / laneCount) * 100,
                width: (1 / laneCount) * 100,
            });
        });

        clusterStart = clusterEnd + 1;
    }

    return positioned;
}

export function DayTimeline (
    {
        className,
        day,
        reservations,
        currentUserId,
        onSelectReservation,
        ...props
    } : DayTimelineData ) {

    const positioned = layoutReservations(reservations);

    return (
        <div className={cn("relative flex flex-col overflow-hidden border-l border-grid", className)}>
            {HOURS.map(hour => {
                return (
                    <div key={hour} className="h-16 border-t border-grid" />
                )
            })}
            {positioned.map(({ reservation, left, width }) => {
                const duration = reservation.durationMinutes && reservation.durationMinutes > 0 ? reservation.durationMinutes : 60;
                const top = (minutesFromTimelineStart(reservation.reservationTime) / 60) * HOUR_HEIGHT;
                const height = Math.max((duration / 60) * HOUR_HEIGHT, 26);

                return (
                    <div
                        key={reservation.id}
                        className="absolute z-20"
                        style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            left: `calc(${left}% + 2px)`,
                            width: `calc(${width}% - 6px)`,
                        }}
                    >
                        <ClassTile
                            reservation={reservation}
                            isOwn={reservation.teacherId === currentUserId}
                            onClick={onSelectReservation ? () => onSelectReservation(reservation) : undefined}
                        />
                    </div>
                );
            })}
        </div>
    )
}
