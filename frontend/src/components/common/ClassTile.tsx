import { format } from "date-fns";
import { clsx as cn } from "clsx";
import { CheckCircle2, Repeat, XCircle } from "lucide-react";
import { teacherColor, teacherTint } from "@/utils/teacherColors";
import type { ClassroomReservation } from "@/stores/useClassroomReservationsStore";

type ClassTileProps = {
    reservation: ClassroomReservation;
    isOwn?: boolean;
    className?: string;
    onClick?: () => void;
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

export function ClassTile({ reservation, isOwn, className, onClick }: ClassTileProps) {
    const isOngoing = reservation.status === "ongoing";
    const isCompleted = reservation.status === "completed";
    const isCanceled = reservation.status === "canceled";
    const isTerminal = isCompleted || isCanceled;

    const ownAccent = "hsl(19,97%,51%)";
    const ownBackground = "hsl(19,97%,95%)";

    const accent = isCanceled
        ? "hsl(0,72%,55%)"
        : isCompleted
            ? "hsl(0,0%,62%)"
            : isOwn ? ownAccent : teacherColor(reservation.teacherId);

    const background = isCanceled
        ? "hsl(0,70%,97%)"
        : isCompleted
            ? "hsl(0,0%,94%)"
            : isOwn ? ownBackground : teacherTint(reservation.teacherId);

    const subtitle = classSubtitle(reservation);

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "relative flex h-full w-full flex-col justify-center overflow-hidden rounded-xl border border-black/5 px-3 py-1.5 text-left transition hover:brightness-[0.97]",
                onClick && "cursor-pointer",
                isCanceled && "opacity-80",
                isOngoing && "ring-2 ring-emerald-500/70",
                className,
            )}
            style={{ backgroundColor: background }}
        >
            <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: accent }} />
            <div className="flex items-start justify-between gap-2">
                <span
                    className={cn(
                        "truncate text-sm font-bold leading-tight",
                        isTerminal ? "text-darker-grey" : "text-light-black",
                        isCanceled && "line-through",
                    )}
                >
                    {classTitle(reservation)}
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-darker-grey">
                    {isOngoing && (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" title="Ongoing" />
                    )}
                    {isCompleted && <CheckCircle2 size={11} className="text-darker-grey" />}
                    {isCanceled && <XCircle size={11} className="text-red-500" />}
                    {reservation.cycleId && <Repeat size={10} />}
                    {format(reservation.reservationTime, "HH:mm")}
                </span>
            </div>
            {subtitle && (
                <span className="mt-0.5 truncate text-xs leading-tight text-darker-grey">{subtitle}</span>
            )}
        </button>
    );
}
