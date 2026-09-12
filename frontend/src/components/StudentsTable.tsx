import { School, UsersRound, Pencil, Trash2 } from "lucide-react";
import { clsx as cn } from "clsx";
import type { Student } from "@/stores/useStudentsStore";

type StudentsTableProps = {
    students: Student[];
    isLoading: boolean;
    canManage: boolean;
    onAddToClass: (student: Student) => void;
    onAddToGroup: (student: Student) => void;
    onModify: (student: Student) => void;
    onDelete: (student: Student) => void;
};

const actionButtonStyles = "rounded-lg p-2 text-darker-grey transition hover:bg-orange/10 hover:text-orange";

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

    return (
        <div className="overflow-hidden rounded-2xl border border-light-grey">
            <table className="w-full border-collapse text-left text-sm">
                <thead>
                    <tr className="border-b border-light-grey text-xs uppercase tracking-wide text-darker-grey">
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
                            <td className="px-4 py-3 font-bold text-black">
                                {student.firstName} {student.lastName}
                            </td>
                            <td className="px-4 py-3 text-black/70">{student.phoneNumber || "-"}</td>
                            <td className="px-4 py-3 text-black/70">{student.email || "-"}</td>
                            <td className="max-w-[16rem] truncate px-4 py-3 text-black/70" title={student.additionalInfo ?? undefined}>
                                {student.additionalInfo || "-"}
                            </td>
                            {canManage && (
                                <td className="px-4 py-3">
                                    <div className="flex flex-row justify-end gap-1">
                                        <button
                                            title="Add to class"
                                            className={cn(actionButtonStyles)}
                                            onClick={() => onAddToClass(student)}
                                        >
                                            <School size={18} />
                                        </button>
                                        <button
                                            title="Add to group"
                                            className={cn(actionButtonStyles)}
                                            onClick={() => onAddToGroup(student)}
                                        >
                                            <UsersRound size={18} />
                                        </button>
                                        <button
                                            title="Modify"
                                            className={cn(actionButtonStyles)}
                                            onClick={() => onModify(student)}
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            title="Delete"
                                            className={cn(actionButtonStyles, "hover:bg-orange/10 hover:text-orange")}
                                            onClick={() => onDelete(student)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
