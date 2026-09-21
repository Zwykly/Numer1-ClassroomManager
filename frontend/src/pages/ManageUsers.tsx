import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/common/Button";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { UsersTable } from "../components/UsersTable";
import { UserCredentialsModal } from "../components/UserCredentialsModal";
import {
    useUsers,
    useUsersLoading,
    useUsersActions,
    type User,
} from "@/stores/useUsersStore";
import { useActionModalActions } from "@/stores/useActionModalStore";

export function ManageUsers() {
    const users = useUsers();
    const isLoading = useUsersLoading();
    const { fetchUsers, deleteUser, resetUserPassword } = useUsersActions();
    const { openUser } = useActionModalActions();

    const [search, setSearch] = useState("");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [credentialsOpen, setCredentialsOpen] = useState(false);
    const [credentials, setCredentials] = useState<{
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    } | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchUsers(search.trim() || undefined);
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const adminCount = users.filter((user) => user.role === "admin").length;
    const teacherCount = users.filter((user) => user.role === "teacher").length;
    const pendingCount = users.filter((user) => user.role === "pending").length;

    const openAdd = () => {
        openUser();
    };

    const openModify = (user: User) => {
        openUser(user);
    };

    const openDelete = (user: User) => {
        setSelectedUser(user);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;
        await deleteUser(selectedUser.id);
        setDeleteOpen(false);
    };

    const handleResetPassword = async (user: User) => {
        const password = await resetUserPassword(user.id);
        if (!password) return;
        setCredentials({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password,
        });
        setCredentialsOpen(true);
    };

    return (
        <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto overscroll-contain bg-canvas">
            <div className="flex flex-col px-4 pt-8 pb-10 sm:px-6 lg:px-8 lg:pt-15">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange">
                                Administration
                            </span>
                            <h1 className="mt-1 text-black font-bold text-3xl sm:text-4xl">Users</h1>
                            <p className="mt-2 max-w-xl text-sm text-darker-grey">
                                Manage every account on the platform — create new users, adjust roles and remove access.
                            </p>
                        </div>
                        <Button variant="primary" className="w-full gap-2 sm:w-auto" onClick={openAdd}>
                            <Plus size={20} />
                            Add user
                        </Button>
                    </div>

                    <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full max-w-sm rounded-xl border border-grey bg-white px-4 py-2 text-black placeholder:text-darker-grey focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
                        />
                        <div className="flex flex-row items-center gap-6">
                            <Stat label="Total" value={users.length} />
                            <div className="h-9 w-px bg-light-grey" />
                            <Stat label="Admins" value={adminCount} accent />
                            <div className="h-9 w-px bg-light-grey" />
                            <Stat label="Teachers" value={teacherCount} />
                            <div className="h-9 w-px bg-light-grey" />
                            <Stat label="Pending" value={pendingCount} />
                        </div>
                    </div>

                    <div className="mt-6">
                        <UsersTable
                            users={users}
                            isLoading={isLoading}
                            onModify={openModify}
                            onDelete={openDelete}
                            onResetPassword={handleResetPassword}
                        />
                    </div>
                </div>

            <ConfirmModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete user"
                message={
                    selectedUser
                        ? `Are you sure you want to delete ${selectedUser.firstName} ${selectedUser.lastName}? Their account and access will be removed. This cannot be undone.`
                        : "Are you sure you want to delete this user?"
                }
                confirmLabel="Delete"
                isDestructive
                onConfirm={confirmDelete}
            />

            <UserCredentialsModal
                open={credentialsOpen}
                onOpenChange={setCredentialsOpen}
                credentials={credentials}
                title="Password reset"
                description="Share this new password with the user. It is only shown once."
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
