import { Fragment, useState } from "react";
import { Building2, Calendar, ChevronDown, ChevronRight, Pencil, Repeat, Trash2, Users } from "lucide-react";
import { clsx as cn } from "clsx";
import { format } from "date-fns";
import type { Classroom } from "@/stores/useClassroomsStore";
import { buildClassroomClasses, countClassroomClasses, upcomingClassroomClasses, type ClassroomClassEntry } from "@/utils/classroomClasses";
import { actionButtonStyles, actionColors } from "@/utils/actionColors";

type ClassroomsTableProps = {
    classrooms: Classroom[];
    isLoading: boolean;
    canManage: boolean;
    onEdit: (classroom: Classroom) => void;
    onDelete: (classroom: Classroom) => void;
};

const statusStyles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-700",
    maintenance: "bg-amber-500/10 text-amber-700",
    inactive: "bg-light-grey text-darker-grey",
};

const classStatusStyles: Record<string, string> = {
    scheduled: "bg-blue-500/10 text-blue-700",
    cyclical: "bg-orange/10 text-orange",
    ongoing: "bg-emerald-500/10 text-emerald-700",
};

function formatClassTime(value: ClassroomClassEntry["firstTime"]) {
    try {
        return format(new Date(value), "dd MMM yyyy, HH:mm");
    } catch {
        return "-";
    }
}

function StatusPill({ status }: { status: string }) {
    return (
        <span
            className={cn(
                "w-fit rounded-full px-3 py-1 text-xs font-bold capitalize",
                statusStyles[status] ?? "bg-light-grey text-darker-grey",
            )}
        >
            {status}
        </span>
    );
}

export function ClassroomsTable({ classrooms, isLoading, canManage, onEdit, onDelete }: ClassroomsTableProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (isLoading && classrooms.length === 0) {
        return <div className="py-16 text-center text-darker-grey">Loading classrooms...</div>;
    }

    if (!isLoading && classrooms.length === 0) {
        return <div className="py-16 text-center text-darker-grey">No classrooms found.</div>;
    }

    const renderActions = (classroom: Classroom) => (
        <div className="flex flex-row gap-1">
            <button
                title="Edit classroom"
                className={cn(actionButtonStyles, actionColors.modify)}
                onClick={(event) => {
                    event.stopPropagation();
                    onEdit(classroom);
                }}
            >
                <Pencil size={18} />
            </button>
            {canManage && (
                <button
                    title="Delete classroom"
                    className={cn(actionButtonStyles, actionColors.delete)}
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete(classroom);
                    }}
                >
                    <Trash2 size={18} />
                </button>
            )}
        </div>
    );

    const renderDetails = (classroom: Classroom) => {
        const classes = buildClassroomClasses(classroom.reservations);
        const upcoming = upcomingClassroomClasses(classroom.reservations);

        return (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="flex flex-col gap-5 md:col-span-2">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                            Upcoming classes ({upcoming.length})
                        </span>
                        {upcoming.length > 0 ? (
                            <div className="mt-2 flex flex-col gap-1.5">
                                {upcoming.map((entry) => (
                                    <div
                                        key={entry.key}
                                        className="flex flex-row items-center justify-between gap-3 rounded-xl border border-light-grey bg-white px-3 py-2"
                                    >
                                        <div className="flex min-w-0 flex-col">
                                            <span className="truncate font-bold text-black">
                                                {entry.name || "Untitled class"}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 text-xs text-darker-grey">
                                                <Calendar size={13} />
                                                {formatClassTime(entry.firstTime)}
                                            </span>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            {entry.recurring ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/10 px-3 py-1 text-xs font-bold text-orange">
                                                    <Repeat size={12} />
                                                    {entry.occurrences} in series
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-light-grey px-3 py-1 text-xs font-bold text-darker-grey">
                                                    One-off
                                                </span>
                                            )}
                                            <span
                                                className={cn(
                                                    "rounded-full px-3 py-1 text-xs font-bold capitalize",
                                                    classStatusStyles[entry.status] ?? "bg-light-grey text-darker-grey",
                                                )}
                                            >
                                                {entry.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-darker-grey">No upcoming classes booked.</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">Capacity</span>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-black">
                            <Users size={15} className="text-darker-grey" />
                            {classroom.maxNumberOfPeople} people
                        </p>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">Status</span>
                        <div className="mt-2">
                            <StatusPill status={classroom.status} />
                        </div>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                            Total classes
                        </span>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-black">
                            <Building2 size={15} className="text-darker-grey" />
                            {classes.length}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                            Additional info
                        </span>
                        <p className="mt-1 text-sm text-darker-grey">
                            {classroom.additionalInfo || "No additional info provided."}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="flex flex-col border-t border-light-grey md:hidden">
                {classrooms.map((classroom) => {
                    const isExpanded = expandedId === classroom.id;
                    const classCount = countClassroomClasses(classroom.reservations);

                    return (
                        <div key={classroom.id} className="border-b border-light-grey">
                            <div
                                onClick={() => setExpandedId(isExpanded ? null : classroom.id)}
                                className="flex cursor-pointer flex-col gap-3 px-1 py-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span className={cn(actionButtonStyles, "inline-flex shrink-0 p-1.5", actionColors.expand)}>
                                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                        </span>
                                        <span className="truncate font-bold text-black">{classroom.name}</span>
                                    </div>
                                    {canManage && renderActions(classroom)}
                                </div>
                                <div className="flex flex-row flex-wrap items-center gap-3 pl-1">
                                    <StatusPill status={classroom.status} />
                                    <span className="inline-flex items-center gap-1.5 text-sm text-darker-grey">
                                        <Users size={15} />
                                        {classroom.maxNumberOfPeople}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-sm text-darker-grey">
                                        <Calendar size={15} />
                                        {classCount}
                                    </span>
                                </div>
                                {classroom.additionalInfo && (
                                    <p className="pl-1 text-sm text-darker-grey">{classroom.additionalInfo}</p>
                                )}
                            </div>

                            {isExpanded && <div className="px-1 pb-5 pl-10">{renderDetails(classroom)}</div>}
                        </div>
                    );
                })}
            </div>

            <div className="hidden overflow-hidden rounded-2xl border border-light-grey bg-white md:block">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-light-grey bg-light-grey/50 text-xs uppercase tracking-wide text-darker-grey">
                            <th className="w-10 px-2 py-3 font-bold" />
                            <th className="px-4 py-3 font-bold">Name</th>
                            <th className="px-4 py-3 font-bold">Capacity</th>
                            <th className="px-4 py-3 font-bold">Status</th>
                            <th className="px-4 py-3 font-bold">Classes</th>
                            <th className="px-4 py-3 text-right font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classrooms.map((classroom) => {
                            const isExpanded = expandedId === classroom.id;
                            const classCount = countClassroomClasses(classroom.reservations);

                            return (
                                <Fragment key={classroom.id}>
                                    <tr
                                        onClick={() => setExpandedId(isExpanded ? null : classroom.id)}
                                        className={cn(
                                            "cursor-pointer border-b border-light-grey/70 transition hover:bg-light-grey/40",
                                            isExpanded && "bg-light-grey/30",
                                        )}
                                    >
                                        <td className="px-2 py-4">
                                            <span
                                                title={isExpanded ? "Collapse" : "Expand"}
                                                className={cn(actionButtonStyles, "inline-flex p-1.5", actionColors.expand)}
                                            >
                                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 font-bold text-black">{classroom.name}</td>
                                        <td className="px-4 py-4 text-darker-grey">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Users size={15} className="text-darker-grey" />
                                                {classroom.maxNumberOfPeople}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusPill status={classroom.status} />
                                        </td>
                                        <td className="px-4 py-4 text-darker-grey">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Calendar size={15} className="text-darker-grey" />
                                                {classCount}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-row justify-end">{renderActions(classroom)}</div>
                                        </td>
                                    </tr>

                                    {isExpanded && (
                                        <tr className="border-b border-light-grey/70 bg-light-grey/30">
                                            <td />
                                            <td colSpan={5} className="px-4 pb-6 pt-2">
                                                {renderDetails(classroom)}
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
