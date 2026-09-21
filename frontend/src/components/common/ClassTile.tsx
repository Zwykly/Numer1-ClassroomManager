import { format } from "date-fns";
import { clsx as cn } from "clsx";
import { CheckCircle2, Lock, Repeat, Video, XCircle } from "lucide-react";
import { userColor, userTint } from "@/utils/userColors";
import { classroomColor, classroomTint } from "@/utils/classroomColors";
import type { ClassroomReservation } from "@/stores/useClassroomReservationsStore";

type ClassTileProps = {
    reservation: ClassroomReservation;
    isOwn?: boolean;
    isAdmin?: boolean;
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

export function ClassTile({ reservation, isOwn, isAdmin, className, onClick }: ClassTileProps) {
    const isOngoing = reservation.status === "ongoing";
    const isCompleted = reservation.status === "completed";
    const isCanceled = reservation.status === "canceled";
    const isTerminal = isCompleted || isCanceled;

    const isOnline = Boolean(reservation.onlineClassroomId);
    const teacherAccent = userColor(reservation.teacher?.color);
    const teacherBackground = userTint(reservation.teacher?.color);
    const roomAccent = classroomColor(reservation.classroom?.color, reservation.classroom?.id);
    const roomBackground = classroomTint(reservation.classroom?.color, reservation.classroom?.id);

    if (reservation.restricted) {
        // Another teacher's class: keep the slot's room visible but grey it out
        // and hide every other detail.
        const roomName = isOnline
            ? "Online classroom"
            : reservation.classroom?.name ?? "Reserved slot";

        const accent = isCanceled ? "hsl(0,72%,55%)" : isCompleted ? "hsl(0,0%,62%)" : "hsl(0,0%,55%)";
        const background = isCanceled
            ? "hsl(0,70%,97%)"
            : isOnline
                ? "hsl(0,0%,95%)"
                : roomBackground;

        return (
            <button
                type="button"
                onClick={onClick}
                className={cn(
                    "relative flex h-full w-full flex-col justify-start overflow-hidden rounded-xl border border-black/5 px-3 py-1.5 text-left transition hover:brightness-[0.97]",
                    isOnline && "border-2 border-dashed",
                    onClick && "cursor-pointer",
                    isCanceled && "opacity-80",
                    isOngoing && "ring-2 ring-emerald-500/70",
                    className,
                )}
                style={isOnline ? { backgroundColor: background, borderColor: accent } : { backgroundColor: background }}
            >
                {!isOnline && (
                    <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: accent }} />
                )}
                <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-sm font-bold leading-tight text-darker-grey">
                        <Lock size={12} className="shrink-0" />
                        <span className="truncate">{roomName}</span>
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
                <span className="mt-0.5 truncate text-xs capitalize leading-tight text-darker-grey">
                    Reserved · {reservation.status}
                </span>
            </button>
        );
    }

    // Physical rooms are colour-coded by the room, online classes follow the
    // teacher. Administrators keep the teacher colour on the side rail.
    const accent = isCanceled
        ? "hsl(0,72%,55%)"
        : isCompleted
            ? "hsl(0,0%,62%)"
            : isOnline
                ? teacherAccent
                : isAdmin
                    ? teacherAccent
                    : reservation.classroom
                        ? roomAccent
                        : isOwn
                            ? "hsl(19,97%,51%)"
                            : teacherAccent;

    const background = isCanceled
        ? "hsl(0,70%,97%)"
        : isCompleted
            ? "hsl(0,0%,94%)"
            : isOnline
                ? teacherBackground
                : reservation.classroom
                    ? roomBackground
                    : isOwn
                        ? "hsl(19,97%,95%)"
                        : teacherBackground;

    const onlineSurface = isOnline && !isTerminal;
    const subtitle = classSubtitle(reservation);

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "relative flex h-full w-full flex-col justify-start overflow-hidden rounded-xl px-3 py-1.5 text-left transition hover:brightness-[0.97]",
                isOnline ? "border-2 border-dashed" : "border border-black/5",
                onClick && "cursor-pointer",
                isCanceled && "opacity-80",
                isOngoing && "ring-2 ring-emerald-500/70",
                className,
            )}
            style={isOnline
                ? { backgroundColor: onlineSurface ? "hsl(0,0%,95%)" : background, borderColor: accent }
                : { backgroundColor: background }}
        >
            {!isOnline && (
                <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: accent }} />
            )}
            <div className="flex items-start justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5">
                    {isOnline && (
                        <span
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: accent }}
                            title="Online class"
                        >
                            <Video size={10} className="text-white" />
                        </span>
                    )}
                    <span
                        className={cn(
                            "truncate text-sm font-bold leading-tight",
                            isTerminal ? "text-darker-grey" : "text-light-black",
                            isCanceled && "line-through",
                        )}
                    >
                        {classTitle(reservation)}
                    </span>
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
