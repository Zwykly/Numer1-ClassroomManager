import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/common/Button";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { GroupsTable } from "../components/GroupsTable";
import {
    useGroups,
    useGroupsLoading,
    useGroupsActions,
    type Group,
} from "@/stores/useGroupsStore";
import { useActionModalActions } from "@/stores/useActionModalStore";
import { useAuth } from "@/utils/AuthProvider";

export function ManageGroups() {
    const groups = useGroups();
    const isLoading = useGroupsLoading();
    const { fetchGroups, deleteGroup } = useGroupsActions();
    const { openGroup } = useActionModalActions();
    const { UserData } = useAuth();
    const isAdmin = UserData?.user?.userInfo?.role === "admin";

    const [search, setSearch] = useState("");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchGroups(search.trim() || undefined);
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const openAdd = () => {
        openGroup();
    };

    const openModify = (group: Group) => {
        openGroup(group);
    };

    const openDelete = (group: Group) => {
        setSelectedGroup(group);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedGroup) return;
        await deleteGroup(selectedGroup.id);
        setDeleteOpen(false);
    };

    return (
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-canvas">
            <div className="flex flex-col h-full overflow-hidden px-4 pt-8 sm:px-6 lg:px-8 lg:pt-15">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange">
                            Organization
                        </span>
                        <h1 className="mt-1 text-black font-bold text-3xl sm:text-4xl">Groups</h1>
                        <p className="mt-2 max-w-xl text-sm text-darker-grey">
                            Organize students into groups and keep track of the classes they attend.
                        </p>
                    </div>
                    <Button variant="primary" className="w-full gap-2 sm:w-auto" onClick={openAdd}>
                        <Plus size={20} />
                        New group
                    </Button>
                </div>

                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by group name..."
                    className="mt-8 w-full max-w-sm rounded-xl border border-grey bg-white px-4 py-2 text-black placeholder:text-darker-grey focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
                />

                <div className="mt-6 flex-1 overflow-y-auto pb-10">
                    <GroupsTable
                        groups={groups}
                        isLoading={isLoading}
                        canDelete={isAdmin}
                        onEdit={openModify}
                        onDelete={openDelete}
                    />
                </div>
            </div>

            <ConfirmModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete group"
                message={
                    selectedGroup
                        ? `Are you sure you want to delete "${selectedGroup.name}"? This cannot be undone.`
                        : "Are you sure you want to delete this group?"
                }
                confirmLabel="Delete"
                isDestructive
                onConfirm={confirmDelete}
            />
        </div>
    );
}
