import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/common/Button";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { StudentsTable } from "../components/StudentsTable";
import { StudentFormModal } from "../components/StudentFormModal";
import { StudentAssignGroupModal } from "../components/StudentAssignGroupModal";
import { StudentClassModal } from "../components/StudentClassModal";
import {
    useStudents,
    useStudentsLoading,
    useStudentsActions,
    type Student,
} from "@/stores/useStudentsStore";
import { useAuth } from "@/utils/AuthProvider";

export function ManageStudents() {
    const students = useStudents();
    const isLoading = useStudentsLoading();
    const { fetchStudents, createStudents, patchStudent, deleteStudent } = useStudentsActions();
    const { UserData } = useAuth();
    const isAdmin = UserData?.user?.userInfo?.role === "admin";

    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
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
        setEditingStudent(null);
        setFormOpen(true);
    };

    const openModify = (student: Student) => {
        setEditingStudent(student);
        setFormOpen(true);
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

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
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
                        className="mt-5 w-full max-w-sm rounded-xl border border-light-grey bg-white px-4 py-2 text-black placeholder:text-darker-grey/60 focus:border-orange focus:outline-none"
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

            <StudentFormModal
                open={formOpen}
                onOpenChange={setFormOpen}
                student={editingStudent}
                onSubmitBatch={createStudents}
                onSubmitEdit={patchStudent}
            />

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
            />
        </div>
    );
}
