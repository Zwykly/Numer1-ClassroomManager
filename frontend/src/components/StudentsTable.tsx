import { School, UsersRound, Pencil, Trash2 } from "lucide-react";
import { clsx as cn } from "clsx";
import type { Student } from "@/stores/useStudentsStore";
import { actionButtonStyles, actionColors } from "@/utils/actionColors";

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
                onClick={() => onAddToClass(student)}
            >
                <School size={18} />
            </button>
            <button
                title="Add to group"
                className={cn(actionButtonStyles, actionColors.group)}
                onClick={() => onAddToGroup(student)}
            >
                <UsersRound size={18} />
            </button>
            <button
                title="Modify"
                className={cn(actionButtonStyles, actionColors.modify)}
                onClick={() => onModify(student)}
            >
                <Pencil size={18} />
            </button>
            <button
                title="Delete"
                className={cn(actionButtonStyles, actionColors.delete)}
                onClick={() => onDelete(student)}
            >
                <Trash2 size={18} />
            </button>
        </>
    );

    return (
        <>
            <div className="flex flex-col border-t border-light-grey md:hidden">
                {students.map((student) => (
                    <div
                        key={student.id}
                        className="flex flex-col gap-3 border-b border-light-grey px-1 py-4"
                    >
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-black">
                                {student.firstName} {student.lastName}
                            </span>
                            {student.phoneNumber && (
                                <span className="text-sm text-darker-grey">{student.phoneNumber}</span>
                            )}
                            {student.email && (
                                <span className="text-sm text-darker-grey">{student.email}</span>
                            )}
                            {student.additionalInfo && (
                                <span className="text-sm text-darker-grey">{student.additionalInfo}</span>
                            )}
                        </div>
                        {canManage && (
                            <div className="flex flex-row gap-1">{renderActions(student)}</div>
                        )}
                    </div>
                ))}
            </div>

            <div className="hidden overflow-hidden rounded-2xl border border-light-grey bg-white md:block">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-light-grey bg-light-grey/50 text-xs uppercase tracking-wide text-darker-grey">
                            <th className="px-4 py-3 font-bold">Name</th>
                            <th className="px-4 py-3 font-bold">Phone</th>
                            <th className="px-4 py-3 font-bold">Email</th>
                            <th className="px-4 py-3 font-bold">Additional info</th>
                            {canManage && <th className="px-4 py-3 text-right font-bold">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr
                                key={student.id}
                                className="border-b border-light-grey/70 transition last:border-0 hover:bg-light-grey/40"
                            >
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
                                        <div className="flex flex-row justify-end gap-1">
                                            {renderActions(student)}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
