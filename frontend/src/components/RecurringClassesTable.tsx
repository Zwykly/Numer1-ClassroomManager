import { Fragment, useState } from "react";
import { Calendar, ChevronDown, ChevronRight, Clock, Pencil, Repeat, Trash2, Users } from "lucide-react";
import { clsx as cn } from "clsx";
import { format } from "date-fns";
import { isEditable, reservationAttendees } from "./ReservationsTable";
import type { Reservation } from "@/stores/useReservationsStore";

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

type RecurringClassesTableProps = {
    groups: CycleGroup[];
    isLoading: boolean;
    currentUserId?: string;
    isAdmin: boolean;
    onModify: (reservation: Reservation) => void;
    onDelete: (reservation: Reservation) => void;
};

const actionButtonStyles = "rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-30";

const actionColors = {
    expand: "text-darker-grey hover:bg-orange/10 hover:text-orange",
    modify: "text-amber-600 hover:bg-amber-500/10 hover:text-amber-700",
    delete: "text-red-600 hover:bg-red-500/10 hover:text-red-700",
};

const statusStyles: Record<string, string> = {
    scheduled: "bg-blue-500/10 text-blue-700",
    cyclical: "bg-orange/10 text-orange",
    ongoing: "bg-emerald-500/10 text-emerald-700",
    completed: "bg-light-grey text-darker-grey",
    canceled: "bg-red-500/10 text-red-700",
};

function formatDateTime(value: string | Date) {
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

export function RecurringClassesTable({
    groups,
    isLoading,
    currentUserId,
    isAdmin,
    onModify,
    onDelete,
}: RecurringClassesTableProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (isLoading && groups.length === 0) {
        return <div className="py-16 text-center text-darker-grey">Loading classes...</div>;
    }

    if (!isLoading && groups.length === 0) {
        return <div className="py-16 text-center text-darker-grey">No recurring classes found.</div>;
    }

    return (
        <table className="w-full border-collapse text-left text-sm">
            <thead>
                <tr className="border-y border-light-grey text-xs uppercase tracking-wide text-darker-grey">
                    <th className="w-10 py-3 pl-2 pr-2 font-bold" />
                    <th className="px-4 py-3 font-bold">Name</th>
                    <th className="px-4 py-3 font-bold">Teacher</th>
                    <th className="px-4 py-3 font-bold">Span</th>
                    <th className="px-4 py-3 font-bold">Classes</th>
                    <th className="px-4 py-3 font-bold">People</th>
                    <th className="px-4 py-3 font-bold">Schedule</th>
                </tr>
            </thead>
            <tbody>
                {groups.map((group) => {
                    const isExpanded = expandedId === group.cycleId;

                    return (
                        <Fragment key={group.cycleId}>
                            <tr
                                className={cn(
                                    "border-b border-light-grey/70 transition hover:bg-light-grey/30",
                                    isExpanded && "bg-light-grey/30",
                                )}
                            >
                                <td className="py-4 pl-2 pr-2">
                                    <button
                                        title={isExpanded ? "Collapse" : "Expand"}
                                        onClick={() => setExpandedId(isExpanded ? null : group.cycleId)}
                                        className={cn(actionButtonStyles, "p-1.5", actionColors.expand)}
                                    >
                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </button>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-black">{group.name || "Untitled class"}</span>
                                        <span className="text-xs text-darker-grey">{group.roomName}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-black/70">
                                    {group.teacher
                                        ? `${group.teacher.firstName} ${group.teacher.lastName}`
                                        : "-"}
                                </td>
                                <td className="px-4 py-4 text-black/70">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Calendar size={15} className="text-darker-grey" />
                                        {format(group.firstTime, "dd MMM yyyy")} – {format(group.lastTime, "dd MMM yyyy")}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-black/70">{group.occurrences.length}</td>
                                <td className="px-4 py-4 text-black/70">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Users size={15} className="text-darker-grey" />
                                        {group.attendeeCount}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/10 px-3 py-1 text-xs font-bold text-orange">
                                        <Repeat size={13} />
                                        Recurring
                                    </span>
                                </td>
                            </tr>

                            {isExpanded && (
                                <tr className="border-b border-light-grey/70 bg-light-grey/20">
                                    <td />
                                    <td colSpan={6} className="px-4 pb-6 pt-2">
                                        <div className="overflow-hidden rounded-xl border border-light-grey bg-white">
                                            <table className="w-full border-collapse text-left text-sm">
                                                <thead>
                                                    <tr className="border-b border-light-grey text-xs uppercase tracking-wide text-darker-grey">
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
                                                            <tr key={occurrence.id} className="border-b border-light-grey/60 last:border-0">
                                                                <td className="px-4 py-3 font-medium text-black">
                                                                    <span className="inline-flex items-center gap-1.5">
                                                                        <Clock size={14} className="text-darker-grey" />
                                                                        {formatDateTime(occurrence.reservationTime)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-black/70">
                                                                    {formatEnd(occurrence.reservationTime, occurrence.durationMinutes)}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className={cn("rounded-full px-3 py-1 text-xs font-bold capitalize", statusStyles[occurrence.status] ?? "bg-light-grey text-darker-grey")}>
                                                                        {occurrence.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-black/70">{people}</td>
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
                })}
            </tbody>
        </table>
    );
}
