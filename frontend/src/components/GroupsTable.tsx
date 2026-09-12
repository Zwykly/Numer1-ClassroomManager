import { Fragment, useState } from "react";
import { Calendar, ChevronDown, ChevronRight, Pencil, Repeat, School, Trash2, Users } from "lucide-react";
import { clsx as cn } from "clsx";
import { format } from "date-fns";
import type { Group } from "@/stores/useGroupsStore";
import { buildGroupClasses, countGroupClasses, type GroupClassEntry } from "@/utils/groupClasses";
import { actionButtonStyles, actionColors } from "@/utils/actionColors";

type GroupsTableProps = {
    groups: Group[];
    isLoading: boolean;
    canDelete: boolean;
    onEdit: (group: Group) => void;
    onDelete: (group: Group) => void;
};

const classStatusStyles: Record<string, string> = {
    scheduled: "bg-blue-500/10 text-blue-700",
    cyclical: "bg-orange/10 text-orange",
    ongoing: "bg-emerald-500/10 text-emerald-700",
};

function formatClassTime(value: GroupClassEntry["firstTime"]) {
    try {
        return format(new Date(value), "dd MMM yyyy, HH:mm");
    } catch {
        return "-";
    }
}

export function GroupsTable({ groups, isLoading, canDelete, onEdit, onDelete }: GroupsTableProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (isLoading && groups.length === 0) {
        return <div className="py-16 text-center text-darker-grey">Loading groups...</div>;
    }

    if (!isLoading && groups.length === 0) {
        return <div className="py-16 text-center text-darker-grey">No groups found.</div>;
    }

    return (
        <>
            <div className="flex flex-col border-t border-light-grey md:hidden">
                {groups.map((group) => {
                    const isExpanded = expandedId === group.id;
                    const people = group.students?.length ?? 0;
                    const classes = buildGroupClasses(group.reservations);
                    const classCount = countGroupClasses(group.reservations);
                    const teachers = group.users ?? [];

                    return (
                        <div key={group.id} className="border-b border-light-grey">
                            <div
                                onClick={() => setExpandedId(isExpanded ? null : group.id)}
                                className="flex cursor-pointer flex-col gap-2 px-1 py-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span className={cn(actionButtonStyles, "inline-flex shrink-0 p-1.5", actionColors.expand)}>
                                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                        </span>
                                        <span className="truncate font-bold text-black">{group.name}</span>
                                    </div>
                                    <div className="flex shrink-0 flex-row gap-1">
                                        <button
                                            title="Edit group"
                                            className={cn(actionButtonStyles, actionColors.modify)}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onEdit(group);
                                            }}
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        {canDelete && (
                                            <button
                                                title="Delete group"
                                                className={cn(actionButtonStyles, actionColors.delete)}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    onDelete(group);
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {group.description && (
                                    <p className="pl-1 text-sm text-darker-grey">{group.description}</p>
                                )}
                                <div className="flex flex-row items-center gap-4 pl-1 text-sm text-darker-grey">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Users size={15} />
                                        {people}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <School size={15} />
                                        {classCount}
                                    </span>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="flex flex-col gap-5 px-1 pb-5 pl-10">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                                            Members ({people})
                                        </span>
                                        {people > 0 ? (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {group.students?.map((student) => (
                                                    <span
                                                        key={student.id}
                                                        className="inline-flex items-center rounded-full border border-light-grey bg-white px-3 py-1 text-xs font-medium text-black"
                                                    >
                                                        {student.firstName} {student.lastName}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="mt-2 text-sm text-darker-grey">No students assigned yet.</p>
                                        )}
                                    </div>

                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                                            Enrolled classes ({classCount})
                                        </span>
                                        {classes.length > 0 ? (
                                            <div className="mt-2 flex flex-col gap-1.5">
                                                {classes.map((entry) => (
                                                    <div
                                                        key={entry.key}
                                                        className="flex flex-col gap-2 rounded-xl border border-light-grey bg-white px-3 py-2"
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
                                                        <div className="flex flex-wrap items-center gap-2">
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
                                            <p className="mt-2 text-sm text-darker-grey">Not enrolled in any class.</p>
                                        )}
                                    </div>

                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                                            Teachers ({teachers.length})
                                        </span>
                                        {teachers.length > 0 ? (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {teachers.map((teacher) => (
                                                    <span
                                                        key={teacher.id}
                                                        className="inline-flex items-center rounded-full border border-light-grey bg-white px-3 py-1 text-xs font-medium text-black"
                                                    >
                                                        {teacher.firstName} {teacher.lastName}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="mt-2 text-sm text-darker-grey">No teachers assigned.</p>
                                        )}
                                    </div>
                                </div>
                            )}
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
                            <th className="px-4 py-3 font-bold">Description</th>
                            <th className="px-4 py-3 font-bold">People</th>
                            <th className="px-4 py-3 font-bold">Classes</th>
                            <th className="px-4 py-3 text-right font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.map((group) => {
                            const isExpanded = expandedId === group.id;
                            const people = group.students?.length ?? 0;
                            const classes = buildGroupClasses(group.reservations);
                            const classCount = countGroupClasses(group.reservations);
                            const teachers = group.users ?? [];

                            return (
                                <Fragment key={group.id}>
                                    <tr
                                        onClick={() => setExpandedId(isExpanded ? null : group.id)}
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
                                        <td className="px-4 py-4 font-bold text-black">{group.name}</td>
                                        <td
                                            className="max-w-[22rem] truncate px-4 py-4 text-darker-grey"
                                            title={group.description ?? undefined}
                                        >
                                            {group.description || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-darker-grey">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Users size={15} className="text-darker-grey" />
                                                {people}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-darker-grey">
                                            <span className="inline-flex items-center gap-1.5">
                                                <School size={15} className="text-darker-grey" />
                                                {classCount}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-row justify-end gap-1">
                                                <button
                                                    title="Edit group"
                                                    className={cn(actionButtonStyles, actionColors.modify)}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        onEdit(group);
                                                    }}
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                {canDelete && (
                                                    <button
                                                        title="Delete group"
                                                        className={cn(actionButtonStyles, actionColors.delete)}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            onDelete(group);
                                                        }}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>

                                    {isExpanded && (
                                        <tr className="border-b border-light-grey/70 bg-light-grey/30">
                                            <td />
                                            <td colSpan={5} className="px-4 pb-6 pt-2">
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                                    <div className="md:col-span-2 flex flex-col gap-5">
                                                        <div>
                                                            <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                                                                Members ({people})
                                                            </span>
                                                            {people > 0 ? (
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    {group.students?.map((student) => (
                                                                        <span
                                                                            key={student.id}
                                                                            className="inline-flex items-center rounded-full border border-light-grey bg-white px-3 py-1 text-xs font-medium text-black"
                                                                        >
                                                                            {student.firstName} {student.lastName}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="mt-2 text-sm text-darker-grey">No students assigned yet.</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                                                                Enrolled classes ({classCount})
                                                            </span>
                                                            {classes.length > 0 ? (
                                                                <div className="mt-2 flex flex-col gap-1.5">
                                                                    {classes.map((entry) => (
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
                                                                <p className="mt-2 text-sm text-darker-grey">Not enrolled in any class.</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-3">
                                                        <div>
                                                            <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                                                                Teachers ({teachers.length})
                                                            </span>
                                                            {teachers.length > 0 ? (
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    {teachers.map((teacher) => (
                                                                        <span
                                                                            key={teacher.id}
                                                                            className="inline-flex items-center rounded-full border border-light-grey bg-white px-3 py-1 text-xs font-medium text-black"
                                                                        >
                                                                            {teacher.firstName} {teacher.lastName}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="mt-2 text-sm text-darker-grey">No teachers assigned.</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                                                                Description
                                                            </span>
                                                            <p className="mt-1 text-sm text-darker-grey">
                                                                {group.description || "No description provided."}
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
