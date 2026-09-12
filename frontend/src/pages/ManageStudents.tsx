import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../components/common/Button";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { StudentsTable } from "../components/StudentsTable";
import { StudentAssignGroupModal } from "../components/StudentAssignGroupModal";
import { StudentClassModal } from "../components/StudentClassModal";
import {
    useStudents,
    useStudentsLoading,
    useStudentsActions,
    type Student,
} from "@/stores/useStudentsStore";
import { useActionModalActions } from "@/stores/useActionModalStore";
import { useAuth } from "@/utils/AuthProvider";
import { upcomingStudentClasses } from "@/utils/studentImpact";

export function ManageStudents() {
    const students = useStudents();
    const isLoading = useStudentsLoading();
    const { fetchStudents, deleteStudent } = useStudentsActions();
    const { openStudent } = useActionModalActions();
    const { UserData } = useAuth();
    const isAdmin = UserData?.user?.userInfo?.role === "admin";

    const [search, setSearch] = useState("");
    const [groupOpen, setGroupOpen] = useState(false);
    const [classOpen, setClassOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchStudents(search.trim() || undefined);
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const openAdd = () => {
        openStudent();
    };

    const openModify = (student: Student) => {
        openStudent(student);
    };

    const openGroup = (student: Student) => {
        setSelectedStudent(student);
        setGroupOpen(true);
    };

    const openClass = (student: Student) => {
        setSelectedStudent(student);
        setClassOpen(true);
    };

    const openDelete = (student: Student) => {
        setSelectedStudent(student);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedStudent) return;
        await deleteStudent(selectedStudent.id);
        setDeleteOpen(false);
    };

    const affectedGroups = selectedStudent?.groups ?? [];
    const upcomingClasses = upcomingStudentClasses(selectedStudent?.reservations);

    return (
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-canvas">
            <div className="pt-15 px-8 flex flex-col h-full overflow-hidden">
                    <div className="flex flex-row items-center justify-between">
                        <h1 className="text-black font-bold text-4xl">Students</h1>
                        {isAdmin && (
                            <Button variant="primary" className="gap-2" onClick={openAdd}>
                                <Plus size={20} />
                                Add a student
                            </Button>
                        )}
                    </div>

                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by first or last name..."
                        className="mt-5 w-full max-w-sm rounded-xl border border-grey bg-white px-4 py-2 text-black placeholder:text-darker-grey focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
                    />

                    <div className="mt-5 flex-1 overflow-y-auto pb-10">
                        <StudentsTable
                            students={students}
                            isLoading={isLoading}
                            canManage={isAdmin}
                            onAddToClass={openClass}
                            onAddToGroup={openGroup}
                            onModify={openModify}
                            onDelete={openDelete}
                        />
                    </div>
                </div>

            <StudentAssignGroupModal
                open={groupOpen}
                onOpenChange={setGroupOpen}
                student={selectedStudent}
            />

            <StudentClassModal
                open={classOpen}
                onOpenChange={setClassOpen}
                student={selectedStudent}
            />

            <ConfirmModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete student"
                message={
                    selectedStudent
                        ? `Are you sure you want to delete ${selectedStudent.firstName} ${selectedStudent.lastName}? This cannot be undone.`
                        : "Are you sure you want to delete this student?"
                }
                confirmLabel="Delete"
                isDestructive
                onConfirm={confirmDelete}
            >
                {selectedStudent && (
                    <div className="mt-4 flex flex-col gap-4">
                        {affectedGroups.length > 0 && (
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                                    Groups ({affectedGroups.length})
                                </span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {affectedGroups.map((group) => (
                                        <span
                                            key={group.id}
                                            className="inline-flex items-center rounded-full border border-light-grey bg-white px-3 py-1 text-xs font-medium text-black"
                                        >
                                            {group.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {upcomingClasses.length > 0 && (
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                                    Upcoming classes ({upcomingClasses.length})
                                </span>
                                <div className="mt-2 flex flex-col gap-1.5">
                                    {upcomingClasses.map((entry) => (
                                        <div
                                            key={entry.key}
                                            className="flex flex-row items-center justify-between gap-3 rounded-xl border border-light-grey bg-white px-3 py-2"
                                        >
                                            <div className="flex min-w-0 flex-col">
                                                <span className="truncate font-bold text-black">
                                                    {entry.name || "Untitled class"}
                                                </span>
                                                <span className="text-xs text-darker-grey">
                                                    {entry.recurring ? "Next: " : ""}
                                                    {format(new Date(entry.nextTime), "dd MMM yyyy, HH:mm")}
                                                </span>
                                            </div>
                                            {entry.recurring && (
                                                <span className="shrink-0 rounded-full bg-orange/10 px-3 py-1 text-xs font-bold text-orange">
                                                    {entry.occurrences} upcoming
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-darker-grey">
                            Their attendance in archived classes will also be removed.
                        </p>
                    </div>
                )}
            </ConfirmModal>
        </div>
    );
}
