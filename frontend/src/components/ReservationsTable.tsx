import { Fragment, useState } from "react";
import { Calendar, ChevronDown, ChevronRight, Clock, Pencil, Repeat, Trash2, Users } from "lucide-react";
import { clsx as cn } from "clsx";
import { format } from "date-fns";
import type { Reservation } from "@/stores/useReservationsStore";

type ReservationsTableProps = {
    reservations: Reservation[];
    isLoading: boolean;
    currentUserId?: string;
    isAdmin: boolean;
    onModify: (reservation: Reservation) => void;
    onDelete: (reservation: Reservation) => void;
};

const actionButtonStyles = "rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-30";

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

export function ReservationsTable({
    reservations,
    isLoading,
    currentUserId,
    isAdmin,
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

    return (
        <table className="w-full border-collapse text-left text-sm">
            <thead>
                <tr className="border-y border-light-grey text-xs uppercase tracking-wide text-darker-grey">
                    <th className="w-10 py-3 pl-2 pr-2 font-bold" />
                    <th className="px-4 py-3 font-bold">Name</th>
                    <th className="px-4 py-3 font-bold">Teacher</th>
                    <th className="px-4 py-3 font-bold">Time</th>
                    <th className="px-4 py-3 font-bold">Recurring</th>
                    <th className="px-4 py-3 font-bold">People</th>
                    <th className="py-3 pl-4 text-right font-bold">Actions</th>
                </tr>
            </thead>
            <tbody>
                {reservations.map((reservation) => {
                    const isExpanded = expandedId === reservation.id;
                    const attendees = reservationAttendees(reservation);
                    const canEdit = isEditable(reservation, isAdmin, currentUserId);

                    return (
                        <Fragment key={reservation.id}>
                            <tr
                                key={reservation.id}
                                className={cn(
                                    "border-b border-light-grey/70 transition hover:bg-light-grey/30",
                                    isExpanded && "bg-light-grey/30",
                                )}
                            >
                                <td className="py-4 pl-2 pr-2">
                                    <button
                                        title={isExpanded ? "Collapse" : "Expand"}
                                        onClick={() => setExpandedId(isExpanded ? null : reservation.id)}
                                        className="rounded-lg p-1.5 text-darker-grey transition hover:bg-orange/10 hover:text-orange"
                                    >
                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </button>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-black">
                                            {reservation.name || "Untitled class"}
                                        </span>
                                        <span className="text-xs text-darker-grey">
                                            {reservation.classroom?.name || reservation.onlineClassroom?.name || "No room assigned"}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-black/70">
                                    {reservation.teacher
                                        ? `${reservation.teacher.firstName} ${reservation.teacher.lastName}`
                                        : "-"}
                                </td>
                                <td className="px-4 py-4 text-black/70">
                                    {formatTime(reservation.reservationTime)}
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
                                <td className="px-4 py-4 text-black/70">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Users size={15} className="text-darker-grey" />
                                        {attendees.length}
                                    </span>
                                </td>
                                <td className="py-4 pl-4">
                                    <div className="flex flex-row justify-end gap-1">
                                        <button
                                            title={canEdit ? "Modify" : "This class can no longer be edited"}
                                            className={cn(actionButtonStyles, "text-darker-grey hover:bg-orange/10 hover:text-orange")}
                                            onClick={() => onModify(reservation)}
                                            disabled={!canEdit}
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            title={canEdit ? "Delete" : "This class can no longer be edited"}
                                            className={cn(actionButtonStyles, "text-darker-grey hover:bg-orange/10 hover:text-orange")}
                                            onClick={() => onDelete(reservation)}
                                            disabled={!canEdit}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>

                            {isExpanded && (
                                <tr key={`${reservation.id}-details`} className="border-b border-light-grey/70 bg-light-grey/20">
                                    <td />
                                    <td colSpan={6} className="px-4 pb-6 pt-2">
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
                                                <span className="inline-flex items-center gap-1.5 text-sm text-black/70">
                                                    <Clock size={15} className="text-darker-grey" />
                                                    {formatTime(reservation.reservationTime)}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 text-sm text-black/70">
                                                    <Calendar size={15} className="text-darker-grey" />
                                                    Created {formatTime(reservation.createdOn)}
                                                </span>
                                                <div className="mt-1">
                                                    <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                                                        Additional info
                                                    </span>
                                                    <p className="mt-1 text-sm text-black/70">
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
    );
}
