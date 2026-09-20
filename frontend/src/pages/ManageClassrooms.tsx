import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/common/Button";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { ClassroomsTable } from "../components/ClassroomsTable";
import {
    useClassrooms,
    useClassroomsLoading,
    useClassroomsActions,
    type Classroom,
} from "@/stores/useClassroomsStore";
import { useActionModalActions } from "@/stores/useActionModalStore";
import { useAuth } from "@/utils/AuthProvider";

export function ManageClassrooms() {
    const classrooms = useClassrooms();
    const isLoading = useClassroomsLoading();
    const { fetchClassrooms, deleteClassroom } = useClassroomsActions();
    const { openClassroom } = useActionModalActions();
    const { UserData } = useAuth();
    const isAdmin = UserData?.user?.userInfo?.role === "admin";

    const [search, setSearch] = useState("");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchClassrooms(search.trim() || undefined);
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const activeCount = classrooms.filter((classroom) => classroom.status === "active").length;
    const maintenanceCount = classrooms.filter((classroom) => classroom.status === "maintenance").length;

    const openAdd = () => {
        openClassroom();
    };

    const openModify = (classroom: Classroom) => {
        openClassroom(classroom);
    };

    const openDelete = (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedClassroom) return;
        try {
            await deleteClassroom(selectedClassroom.id);
            setDeleteOpen(false);
        } catch (error) {
            console.error("Failed to delete classroom:", error);
        }
    };

    return (
        <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto overscroll-contain bg-canvas">
            <div className="flex flex-col px-4 pt-8 pb-10 sm:px-6 lg:px-8 lg:pt-15">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange">
                            Facilities
                        </span>
                        <h1 className="mt-1 text-black font-bold text-3xl sm:text-4xl">Classrooms</h1>
                        <p className="mt-2 max-w-xl text-sm text-darker-grey">
                            Manage the physical rooms available across the school and keep an eye on how they are used.
                        </p>
                    </div>
                    <Button variant="primary" className="w-full gap-2 sm:w-auto" onClick={openAdd}>
                        <Plus size={20} />
                        Add classroom
                    </Button>
                </div>

                <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by classroom name..."
                        className="w-full max-w-sm rounded-xl border border-grey bg-white px-4 py-2 text-black placeholder:text-darker-grey focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
                    />
                    <div className="flex flex-row items-center gap-6">
                        <Stat label="Total" value={classrooms.length} />
                        <div className="h-9 w-px bg-light-grey" />
                        <Stat label="Active" value={activeCount} accent />
                        <div className="h-9 w-px bg-light-grey" />
                        <Stat label="Maintenance" value={maintenanceCount} />
                    </div>
                </div>

                <div className="mt-6">
                    <ClassroomsTable
                        classrooms={classrooms}
                        isLoading={isLoading}
                        canManage={isAdmin}
                        onEdit={openModify}
                        onDelete={openDelete}
                    />
                </div>
            </div>

            <ConfirmModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete classroom"
                message={
                    selectedClassroom
                        ? `Are you sure you want to delete "${selectedClassroom.name}"? This cannot be undone.`
                        : "Are you sure you want to delete this classroom?"
                }
                confirmLabel="Delete"
                isDestructive
                onConfirm={confirmDelete}
            />
        </div>
    );
}

type StatProps = {
    label: string;
    value: number;
    accent?: boolean;
};

function Stat({ label, value, accent }: StatProps) {
    return (
        <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">{label}</span>
            <span className={accent ? "text-2xl font-bold text-orange" : "text-2xl font-bold text-black"}>
                {value}
            </span>
        </div>
    );
}
