import { Fragment, useState } from "react";
import { Calendar, ChevronDown, ChevronRight, School, UsersRound, Pencil, Trash2 } from "lucide-react";
import { clsx as cn } from "clsx";
import type { Student } from "@/stores/useStudentsStore";
import { actionButtonStyles, actionColors } from "@/utils/actionColors";
import { StudentDetails } from "./StudentDetails";

type StudentsTableProps = {
    students: Student[];
    isLoading: boolean;
    canManage: boolean;
    onAddToClass: (student: Student) => void;
    onAddToGroup: (student: Student) => void;
    onModify: (student: Student) => void;
    onDelete: (student: Student) => void;
};

export function StudentsTable({
    students,
    isLoading,
    canManage,
    onAddToClass,
    onAddToGroup,
    onModify,
    onDelete,
}: StudentsTableProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (isLoading && students.length === 0) {
        return <div className="py-16 text-center text-darker-grey">Loading students...</div>;
    }

    if (!isLoading && students.length === 0) {
        return <div className="py-16 text-center text-darker-grey">No students found.</div>;
    }

    const renderActions = (student: Student) => (
        <>
            <button
                title="Add to class"
                className={cn(actionButtonStyles, actionColors.class)}
                onClick={(event) => {
                    event.stopPropagation();
                    onAddToClass(student);
                }}
            >
                <School size={18} />
            </button>
            <button
                title="Add to group"
                className={cn(actionButtonStyles, actionColors.group)}
                onClick={(event) => {
                    event.stopPropagation();
                    onAddToGroup(student);
                }}
            >
                <UsersRound size={18} />
            </button>
            <button
                title="Modify"
                className={cn(actionButtonStyles, actionColors.modify)}
                onClick={(event) => {
                    event.stopPropagation();
                    onModify(student);
                }}
            >
                <Pencil size={18} />
            </button>
            <button
                title="Delete"
                className={cn(actionButtonStyles, actionColors.delete)}
                onClick={(event) => {
                    event.stopPropagation();
                    onDelete(student);
                }}
            >
                <Trash2 size={18} />
            </button>
        </>
    );

    const columnCount = 5 + (canManage ? 2 : 0);

    return (
        <>
            <div className="flex flex-col border-t border-light-grey md:hidden">
                {students.map((student) => {
                    const isExpanded = expandedId === student.id;

                    return (
                        <div key={student.id} className="border-b border-light-grey">
                            <div
                                onClick={() => setExpandedId(isExpanded ? null : student.id)}
                                className="flex cursor-pointer flex-col gap-3 px-1 py-4"
                            >
                                <div className="flex flex-row items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span className={cn(actionButtonStyles, "inline-flex shrink-0 p-1.5", actionColors.expand)}>
                                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                        </span>
                                        <div className="flex min-w-0 flex-col gap-1">
                                            <span className="truncate font-bold text-black">
                                                {student.firstName} {student.lastName}
                                            </span>
                                            {student.phoneNumber && (
                                                <span className="text-sm text-darker-grey">{student.phoneNumber}</span>
                                            )}
                                            {student.email && (
                                                <span className="text-sm text-darker-grey">{student.email}</span>
                                            )}
                                        </div>
                                    </div>
                                    {canManage && (
                                        <div className="flex shrink-0 flex-row gap-1">{renderActions(student)}</div>
                                    )}
                                </div>
                                <div className="flex flex-row flex-wrap items-center gap-4 pl-1 text-sm text-darker-grey">
                                    <span className="inline-flex items-center gap-1.5">
                                        <UsersRound size={15} />
                                        {student.groups?.length ?? 0}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Calendar size={15} />
                                        {student.reservations?.length ?? 0}
                                    </span>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="px-1 pb-5 pl-10">
                                    <StudentDetails student={student} isAdmin={canManage} />
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
                            <th className="px-4 py-3 font-bold">Phone</th>
                            <th className="px-4 py-3 font-bold">Email</th>
                            <th className="px-4 py-3 font-bold">Additional info</th>
                            {canManage && <th className="px-4 py-3 font-bold">Teachers</th>}
                            {canManage && <th className="px-4 py-3 text-right font-bold">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => {
                            const isExpanded = expandedId === student.id;

                            return (
                                <Fragment key={student.id}>
                                    <tr
                                        onClick={() => setExpandedId(isExpanded ? null : student.id)}
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
                                        <td className="px-4 py-4 font-bold text-black">
                                            {student.firstName} {student.lastName}
                                        </td>
                                        <td className="px-4 py-4 text-darker-grey">{student.phoneNumber || "-"}</td>
                                        <td className="px-4 py-4 text-darker-grey">{student.email || "-"}</td>
                                        <td className="max-w-[16rem] truncate px-4 py-4 text-darker-grey" title={student.additionalInfo ?? undefined}>
                                            {student.additionalInfo || "-"}
                                        </td>
                                        {canManage && (
                                            <td className="px-4 py-4">
                                                {(student.teachers?.length ?? 0) > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {student.teachers?.map((teacher) => (
                                                            <span
                                                                key={teacher.id}
                                                                className="inline-flex items-center rounded-full border border-light-grey bg-white px-2.5 py-0.5 text-xs font-medium text-black"
                                                            >
                                                                {teacher.firstName} {teacher.lastName}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-darker-grey">-</span>
                                                )}
                                            </td>
                                        )}
                                        {canManage && (
                                            <td className="px-4 py-4">
                                                <div className="flex flex-row justify-end gap-1">
                                                    {renderActions(student)}
                                                </div>
                                            </td>
                                        )}
                                    </tr>

                                    {isExpanded && (
                                        <tr className="border-b border-light-grey/70 bg-light-grey/30">
                                            <td />
                                            <td colSpan={columnCount - 1} className="px-4 pb-6 pt-2">
                                                <StudentDetails student={student} isAdmin={canManage} />
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
