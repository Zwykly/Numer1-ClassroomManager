import { Fragment, useState } from "react";
import { Calendar, ChevronDown, ChevronRight, Clock, Pencil, Repeat, Trash2, Users } from "lucide-react";
import { clsx as cn } from "clsx";
import { format } from "date-fns";
import { userColor } from "@/utils/userColors";
import { actionButtonStyles, actionColors } from "@/utils/actionColors";
import type { Reservation } from "@/stores/useReservationsStore";

type ReservationsTableProps = {
    reservations: Reservation[];
    isLoading: boolean;
    currentUserId?: string;
    isAdmin: boolean;
    groupRecurring?: boolean;
    onModify: (reservation: Reservation) => void;
    onDelete: (reservation: Reservation) => void;
};

export function isEditable(reservation: Reservation, isAdmin: boolean, currentUserId?: string) {
    if (reservation.status === "canceled" || reservation.status === "completed") return false;
    return isAdmin || (!!currentUserId && reservation.teacherId === currentUserId);
}

const statusStyles: Record<string, string> = {
    scheduled: "bg-blue-500/10 text-blue-700",
    cyclical: "bg-orange/10 text-orange",
    ongoing: "bg-emerald-500/10 text-emerald-700",
    completed: "bg-light-grey text-darker-grey",
    canceled: "bg-red-500/10 text-red-700",
};

function formatTime(value: string | Date) {
    try {
        return format(new Date(value), "dd MMM yyyy, HH:mm");
    } catch {
        return "-";
    }
}

function formatEnd(value: string | Date, durationMinutes?: number | null) {
    if (!durationMinutes) return "-";
    try {
        return format(new Date(new Date(value).getTime() + durationMinutes * 60_000), "HH:mm");
    } catch {
        return "-";
    }
}

type Attendee = { id: string; name: string; group?: string };

export function reservationAttendees(reservation: Reservation): Attendee[] {
    const map = new Map<string, Attendee>();

    for (const student of reservation.students ?? []) {
        map.set(student.id, { id: student.id, name: `${student.firstName} ${student.lastName}` });
    }

    for (const group of reservation.groups ?? []) {
        for (const student of (group as { students?: { id: string; firstName: string; lastName: string }[] }).students ?? []) {
            if (map.has(student.id)) continue;
            map.set(student.id, {
                id: student.id,
                name: `${student.firstName} ${student.lastName}`,
                group: group.name ?? undefined,
            });
        }
    }

    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export type CycleGroup = {
    cycleId: string;
    name: string | null;
    roomName: string;
    teacher?: Reservation["teacher"];
    firstTime: Date;
    lastTime: Date;
    occurrences: Reservation[];
    attendeeCount: number;
};

export function buildCycleGroups(reservations: Reservation[]): CycleGroup[] {
    const map = new Map<string, Reservation[]>();

    for (const reservation of reservations) {
        const key = reservation.cycleId ?? reservation.id;
        const list = map.get(key) ?? [];
        list.push(reservation);
        map.set(key, list);
    }

    return [...map.entries()]
        .map(([cycleId, list]) => {
            const occurrences = [...list].sort(
                (a, b) => new Date(a.reservationTime).getTime() - new Date(b.reservationTime).getTime(),
            );
            const first = occurrences[0]!;
            const last = occurrences[occurrences.length - 1]!;
            const attendees = new Set<string>();
            for (const occurrence of occurrences) {
                for (const attendee of reservationAttendees(occurrence)) attendees.add(attendee.id);
            }

            return {
                cycleId,
                name: first.name,
                roomName: first.classroom?.name || first.onlineClassroom?.name || "No room assigned",
                teacher: first.teacher,
                firstTime: new Date(first.reservationTime),
                lastTime: new Date(last.reservationTime),
                occurrences,
                attendeeCount: attendees.size,
            };
        })
        .sort((a, b) => a.firstTime.getTime() - b.firstTime.getTime());
}

type Entry =
    | { kind: "group"; key: string; time: number; group: CycleGroup }
    | { kind: "reservation"; key: string; time: number; reservation: Reservation };

function buildEntries(reservations: Reservation[], groupRecurring: boolean): Entry[] {
    if (!groupRecurring) {
        return reservations.map((reservation) => ({
            kind: "reservation" as const,
            key: reservation.id,
            time: new Date(reservation.reservationTime).getTime(),
            reservation,
        }));
    }

    const groups = buildCycleGroups(reservations.filter((reservation) => reservation.cycleId));
    const oneOffs = reservations.filter((reservation) => !reservation.cycleId);

    return [
        ...groups.map((group) => ({
            kind: "group" as const,
            key: `cycle-${group.cycleId}`,
            time: group.firstTime.getTime(),
            group,
        })),
        ...oneOffs.map((reservation) => ({
            kind: "reservation" as const,
            key: reservation.id,
            time: new Date(reservation.reservationTime).getTime(),
            reservation,
        })),
    ].sort((a, b) => a.time - b.time);
}

export function ReservationsTable({
    reservations,
    isLoading,
    currentUserId,
    isAdmin,
    groupRecurring = false,
    onModify,
    onDelete,
}: ReservationsTableProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (isLoading && reservations.length === 0) {
        return <div className="py-16 text-center text-darker-grey">Loading classes...</div>;
    }

    if (!isLoading && reservations.length === 0) {
        return <div className="py-16 text-center text-darker-grey">No classes found.</div>;
    }

    const entries = buildEntries(reservations, groupRecurring);

    const mobileList = (
        <div className="flex flex-col border-t border-light-grey md:hidden">
            {entries.map((entry) => {
                const isExpanded = expandedId === entry.key;

                if (entry.kind === "group") {
                    const { group } = entry;
                    return (
                        <div key={entry.key} className="border-b border-light-grey">
                            <div
                                onClick={() => setExpandedId(isExpanded ? null : entry.key)}
                                className="flex cursor-pointer flex-col gap-2 px-1 py-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 flex-col gap-1">
                                        <span className="flex items-center gap-2">
                                            <span
                                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                style={{ backgroundColor: userColor(group.teacher?.color) }}
                                            />
                                            <span className="truncate font-bold text-black">{group.name || "Untitled class"}</span>
                                        </span>
                                        <span className="text-xs text-darker-grey">{group.roomName}</span>
                                    </div>
                                    <span className={cn(actionButtonStyles, "shrink-0 p-1.5", actionColors.expand)}>
                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-darker-grey">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        {format(group.firstTime, "dd MMM")} – {format(group.lastTime, "dd MMM")}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Users size={14} />
                                        {group.attendeeCount}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/10 px-3 py-1 font-bold text-orange">
                                        <Repeat size={12} />
                                        Recurring
                                    </span>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="flex flex-col gap-2 px-1 pb-5 pl-4">
                                    {group.occurrences.map((occurrence) => {
                                        const canEdit = isEditable(occurrence, isAdmin, currentUserId);
                                        const people = reservationAttendees(occurrence).length;
                                        return (
                                            <div
                                                key={occurrence.id}
                                                className="flex flex-col gap-2 rounded-xl border border-light-grey bg-white px-3 py-2"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-black">
                                                        <Clock size={14} className="text-darker-grey" />
                                                        {formatTime(occurrence.reservationTime)}
                                                    </span>
                                                    <span className={cn("rounded-full px-3 py-1 text-xs font-bold capitalize", statusStyles[occurrence.status] ?? "bg-light-grey text-darker-grey")}>
                                                        {occurrence.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs text-darker-grey">
                                                        Ends {formatEnd(occurrence.reservationTime, occurrence.durationMinutes)} · {people} people
                                                    </span>
                                                    <div className="flex flex-row gap-1">
                                                        <button
                                                            title={canEdit ? "Modify" : "This class can no longer be edited"}
                                                            className={cn(actionButtonStyles, actionColors.modify)}
                                                            onClick={() => onModify(occurrence)}
                                                            disabled={!canEdit}
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            title={canEdit ? "Delete" : "This class can no longer be edited"}
                                                            className={cn(actionButtonStyles, actionColors.delete)}
                                                            onClick={() => onDelete(occurrence)}
                                                            disabled={!canEdit}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                }

                const { reservation } = entry;
                const attendees = reservationAttendees(reservation);
                const canEdit = isEditable(reservation, isAdmin, currentUserId);

                return (
                    <div key={entry.key} className="border-b border-light-grey">
                        <div
                            onClick={() => setExpandedId(isExpanded ? null : entry.key)}
                            className="flex cursor-pointer flex-col gap-2 px-1 py-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 flex-col gap-1">
                                    <span className="flex items-center gap-2">
                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: userColor(reservation.teacher?.color) }}
                                        />
                                        <span className="truncate font-bold text-black">{reservation.name || "Untitled class"}</span>
                                    </span>
                                    <span className="text-xs text-darker-grey">
                                        {reservation.classroom?.name || reservation.onlineClassroom?.name || "No room assigned"}
                                    </span>
                                </div>
                                <span className={cn(actionButtonStyles, "shrink-0 p-1.5", actionColors.expand)}>
                                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-darker-grey">
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock size={14} />
                                    {formatTime(reservation.reservationTime)}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Users size={14} />
                                    {attendees.length}
                                </span>
                                {reservation.cycleId || reservation.status === "cyclical" ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/10 px-3 py-1 font-bold text-orange">
                                        <Repeat size={12} />
                                        Recurring
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-light-grey px-3 py-1 font-bold text-darker-grey">
                                        One-off
                                    </span>
                                )}
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="flex flex-col gap-3 px-1 pb-5 pl-4">
                                <div className="flex flex-row items-center justify-between gap-2">
                                    <span className={cn("w-fit rounded-full px-3 py-1 text-xs font-bold capitalize", statusStyles[reservation.status] ?? "bg-light-grey text-darker-grey")}>
                                        {reservation.status}
                                    </span>
                                    <div className="flex flex-row gap-1">
                                        <button
                                            title={canEdit ? "Modify" : "This class can no longer be edited"}
                                            className={cn(actionButtonStyles, actionColors.modify)}
                                            onClick={() => onModify(reservation)}
                                            disabled={!canEdit}
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            title={canEdit ? "Delete" : "This class can no longer be edited"}
                                            className={cn(actionButtonStyles, actionColors.delete)}
                                            onClick={() => onDelete(reservation)}
                                            disabled={!canEdit}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 text-sm text-darker-grey">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Clock size={15} className="text-darker-grey" />
                                        {formatTime(reservation.reservationTime)} – {formatEnd(reservation.reservationTime, reservation.durationMinutes)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Calendar size={15} className="text-darker-grey" />
                                        Created {formatTime(reservation.createdOn)}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                                        Attending ({attendees.length})
                                    </span>
                                    {attendees.length > 0 ? (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {attendees.map((attendee) => (
                                                <span
                                                    key={attendee.id}
                                                    title={attendee.group ? `Group: ${attendee.group}` : undefined}
                                                    className="inline-flex items-center gap-1.5 rounded-full border border-light-grey bg-white px-3 py-1 text-xs font-medium text-black"
                                                >
                                                    {attendee.name}
                                                    {attendee.group && (
                                                        <span className="text-darker-grey">· {attendee.group}</span>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm text-darker-grey">No students assigned yet.</p>
                                    )}
                                </div>

                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                                        Additional info
                                    </span>
                                    <p className="mt-1 text-sm text-darker-grey">
                                        {reservation.additionalInfo || "No additional information."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <>
        {mobileList}
        <div className="hidden overflow-hidden rounded-2xl border border-light-grey bg-white md:block">
            <table className="w-full border-collapse text-left text-sm">
                <thead>
                    <tr className="border-b border-light-grey bg-light-grey/50 text-xs uppercase tracking-wide text-darker-grey">
                        <th className="w-10 px-2 py-3 font-bold" />
                        <th className="px-4 py-3 font-bold">Name</th>
                        <th className="px-4 py-3 font-bold">Teacher</th>
                        <th className="px-4 py-3 font-bold">Time</th>
                        <th className="px-4 py-3 font-bold">Ends</th>
                        <th className="px-4 py-3 font-bold">Recurring</th>
                        <th className="px-4 py-3 font-bold">People</th>
                        <th className="px-4 py-3 text-right font-bold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                {entries.map((entry) => {
                    const isExpanded = expandedId === entry.key;

                    if (entry.kind === "group") {
                        const { group } = entry;
                        return (
                            <Fragment key={entry.key}>
                                <tr
                                    className={cn(
                                        "border-b border-light-grey/70 transition hover:bg-light-grey/40",
                                        isExpanded && "bg-light-grey/30",
                                    )}
                                >
                                    <td className="px-2 py-4">
                                        <button
                                            title={isExpanded ? "Collapse" : "Expand"}
                                            onClick={() => setExpandedId(isExpanded ? null : entry.key)}
                                            className={cn(actionButtonStyles, "p-1.5", actionColors.expand)}
                                        >
                                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                        </button>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                    style={{ backgroundColor: userColor(group.teacher?.color) }}
                                                    title={group.teacher ? `${group.teacher.firstName} ${group.teacher.lastName}` : undefined}
                                                />
                                                <span className="font-bold text-black">{group.name || "Untitled class"}</span>
                                            </span>
                                            <span className="text-xs text-darker-grey">{group.roomName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-darker-grey">
                                        {group.teacher
                                            ? `${group.teacher.firstName} ${group.teacher.lastName}`
                                            : "-"}
                                    </td>
                                    <td className="px-4 py-4 text-darker-grey">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Calendar size={15} className="text-darker-grey" />
                                            {format(group.firstTime, "dd MMM yyyy")} – {format(group.lastTime, "dd MMM yyyy")}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-darker-grey">-</td>
                                    <td className="px-4 py-4">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/10 px-3 py-1 text-xs font-bold text-orange">
                                            <Repeat size={13} />
                                            Recurring
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-darker-grey">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Users size={15} className="text-darker-grey" />
                                            {group.attendeeCount}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4" />
                                </tr>

                                {isExpanded && (
                                    <tr className="border-b border-light-grey/70 bg-light-grey/30">
                                        <td />
                                        <td colSpan={7} className="px-4 pb-6 pt-2">
                                            <div className="overflow-hidden rounded-xl border border-light-grey bg-white">
                                                <table className="w-full border-collapse text-left text-sm">
                                                    <thead>
                                                        <tr className="border-b border-light-grey bg-light-grey/50 text-xs uppercase tracking-wide text-darker-grey">
                                                            <th className="px-4 py-2 font-bold">Date & time</th>
                                                            <th className="px-4 py-2 font-bold">Ends</th>
                                                            <th className="px-4 py-2 font-bold">Status</th>
                                                            <th className="px-4 py-2 font-bold">People</th>
                                                            <th className="px-4 py-2 text-right font-bold">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {group.occurrences.map((occurrence) => {
                                                            const canEdit = isEditable(occurrence, isAdmin, currentUserId);
                                                            const people = reservationAttendees(occurrence).length;
                                                            return (
                                                                <tr key={occurrence.id} className="border-b border-light-grey/70 transition last:border-0 hover:bg-light-grey/40">
                                                                    <td className="px-4 py-3 font-medium text-black">
                                                                        <span className="inline-flex items-center gap-1.5">
                                                                            <Clock size={14} className="text-darker-grey" />
                                                                            {formatTime(occurrence.reservationTime)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-darker-grey">
                                                                        {formatEnd(occurrence.reservationTime, occurrence.durationMinutes)}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <span className={cn("rounded-full px-3 py-1 text-xs font-bold capitalize", statusStyles[occurrence.status] ?? "bg-light-grey text-darker-grey")}>
                                                                            {occurrence.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-darker-grey">{people}</td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex flex-row justify-end gap-1">
                                                                            <button
                                                                                title={canEdit ? "Modify" : "This class can no longer be edited"}
                                                                                className={cn(actionButtonStyles, actionColors.modify)}
                                                                                onClick={() => onModify(occurrence)}
                                                                                disabled={!canEdit}
                                                                            >
                                                                                <Pencil size={16} />
                                                                            </button>
                                                                            <button
                                                                                title={canEdit ? "Delete" : "This class can no longer be edited"}
                                                                                className={cn(actionButtonStyles, actionColors.delete)}
                                                                                onClick={() => onDelete(occurrence)}
                                                                                disabled={!canEdit}
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        );
                    }

                    const { reservation } = entry;
                    const attendees = reservationAttendees(reservation);
                    const canEdit = isEditable(reservation, isAdmin, currentUserId);

                    return (
                        <Fragment key={entry.key}>
                            <tr
                                className={cn(
                                    "border-b border-light-grey/70 transition hover:bg-light-grey/40",
                                    isExpanded && "bg-light-grey/30",
                                )}
                            >
                                <td className="px-2 py-4">
                                    <button
                                        title={isExpanded ? "Collapse" : "Expand"}
                                        onClick={() => setExpandedId(isExpanded ? null : entry.key)}
                                        className={cn(actionButtonStyles, "p-1.5", actionColors.expand)}
                                    >
                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </button>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col">
                                        <span className="flex items-center gap-2">
                                            <span
                                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                style={{ backgroundColor: userColor(reservation.teacher?.color) }}
                                                title={reservation.teacher ? `${reservation.teacher.firstName} ${reservation.teacher.lastName}` : undefined}
                                            />
                                            <span className="font-bold text-black">
                                                {reservation.name || "Untitled class"}
                                            </span>
                                        </span>
                                        <span className="text-xs text-darker-grey">
                                            {reservation.classroom?.name || reservation.onlineClassroom?.name || "No room assigned"}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-darker-grey">
                                    {reservation.teacher
                                        ? `${reservation.teacher.firstName} ${reservation.teacher.lastName}`
                                        : "-"}
                                </td>
                                <td className="px-4 py-4 text-darker-grey">
                                    {formatTime(reservation.reservationTime)}
                                </td>
                                <td className="px-4 py-4 text-darker-grey">
                                    {formatEnd(reservation.reservationTime, reservation.durationMinutes)}
                                </td>
                                <td className="px-4 py-4">
                                    {reservation.cycleId || reservation.status === "cyclical" ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/10 px-3 py-1 text-xs font-bold text-orange">
                                            <Repeat size={13} />
                                            Recurring
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-light-grey px-3 py-1 text-xs font-bold text-darker-grey">
                                            One-off
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-4 text-darker-grey">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Users size={15} className="text-darker-grey" />
                                        {attendees.length}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-row justify-end gap-1">
                                        <button
                                            title={canEdit ? "Modify" : "This class can no longer be edited"}
                                            className={cn(actionButtonStyles, actionColors.modify)}
                                            onClick={() => onModify(reservation)}
                                            disabled={!canEdit}
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            title={canEdit ? "Delete" : "This class can no longer be edited"}
                                            className={cn(actionButtonStyles, actionColors.delete)}
                                            onClick={() => onDelete(reservation)}
                                            disabled={!canEdit}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>

                            {isExpanded && (
                                <tr className="border-b border-light-grey/70 bg-light-grey/30">
                                    <td />
                                    <td colSpan={7} className="px-4 pb-6 pt-2">
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                            <div className="md:col-span-2">
                                                <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                                                    Attending ({attendees.length})
                                                </span>
                                                {attendees.length > 0 ? (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {attendees.map((attendee) => (
                                                            <span
                                                                key={attendee.id}
                                                                title={attendee.group ? `Group: ${attendee.group}` : undefined}
                                                                className="inline-flex items-center gap-1.5 rounded-full border border-light-grey bg-white px-3 py-1 text-xs font-medium text-black"
                                                            >
                                                                {attendee.name}
                                                                {attendee.group && (
                                                                    <span className="text-darker-grey">· {attendee.group}</span>
                                                                )}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="mt-2 text-sm text-darker-grey">No students assigned yet.</p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <span className={cn("w-fit rounded-full px-3 py-1 text-xs font-bold capitalize", statusStyles[reservation.status] ?? "bg-light-grey text-darker-grey")}>
                                                    {reservation.status}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 text-sm text-darker-grey">
                                                    <Clock size={15} className="text-darker-grey" />
                                                    {formatTime(reservation.reservationTime)}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 text-sm text-darker-grey">
                                                    <Calendar size={15} className="text-darker-grey" />
                                                    Created {formatTime(reservation.createdOn)}
                                                </span>
                                                <div className="mt-1">
                                                    <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                                                        Additional info
                                                    </span>
                                                    <p className="mt-1 text-sm text-darker-grey">
                                                        {reservation.additionalInfo || "No additional information."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    );
                })}
            </tbody>
            </table>
        </div>
        </>
    );
}
