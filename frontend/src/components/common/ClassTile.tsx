import { format } from "date-fns";
import { clsx as cn } from "clsx";
import { Repeat } from "lucide-react";
import { teacherColor, teacherTint } from "@/utils/teacherColors";
import type { ClassroomReservation } from "@/stores/useClassroomReservationsStore";

type ClassTileProps = {
    reservation: ClassroomReservation;
    isOwn?: boolean;
    className?: string;
};

export function classTitle(reservation: ClassroomReservation) {
    return reservation.name || "Untitled class";
}

export function classSubtitle(reservation: ClassroomReservation) {
    const groupNames = (reservation.groups ?? []).map((group) => group.name).filter(Boolean);
    if (groupNames.length > 0) return groupNames.join(", ");

    if (reservation.teacher) {
        return `${reservation.teacher.firstName} ${reservation.teacher.lastName}`;
    }

    return reservation.classroom?.name ?? reservation.onlineClassroom?.name ?? "";
}

export function ClassTile({ reservation, isOwn, className }: ClassTileProps) {
    const accent = isOwn ? "hsl(19,97%,51%)" : teacherColor(reservation.teacherId);
    const background = isOwn ? "hsl(19,97%,95%)" : teacherTint(reservation.teacherId);
    const subtitle = classSubtitle(reservation);
    const isCanceled = reservation.status === "canceled";

    return (
        <div
            className={cn(
                "relative flex h-full w-full flex-col justify-center overflow-hidden rounded-xl border border-black/5 px-3 py-1.5 text-left transition hover:brightness-[0.97]",
                isCanceled && "opacity-60",
                className,
            )}
            style={{ backgroundColor: background }}
        >
            <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: accent }} />
            <div className="flex items-start justify-between gap-2">
                <span className={cn("truncate text-sm font-bold leading-tight text-light-black", isCanceled && "line-through")}>
                    {classTitle(reservation)}
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-darker-grey">
                    {reservation.cycleId && <Repeat size={10} />}
                    {format(reservation.reservationTime, "HH:mm")}
                </span>
            </div>
            {subtitle && (
                <span className="mt-0.5 truncate text-xs leading-tight text-darker-grey">{subtitle}</span>
            )}
        </div>
    );
}
