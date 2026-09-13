import { Pencil, Trash2 } from "lucide-react";
import { clsx as cn } from "clsx";
import type { User } from "@/stores/useUsersStore";
import { teacherColor } from "@/utils/teacherColors";
import { actionButtonStyles, actionColors } from "@/utils/actionColors";

type UsersTableProps = {
    users: User[];
    isLoading: boolean;
    onModify: (user: User) => void;
    onDelete: (user: User) => void;
};

function roleStyles(role: string) {
    return role === "admin"
        ? "bg-orange/10 text-orange"
        : "bg-light-grey text-darker-grey";
}

export function UsersTable({
    users,
    isLoading,
    onModify,
    onDelete,
}: UsersTableProps) {
    if (isLoading && users.length === 0) {
        return <div className="py-16 text-center text-darker-grey">Loading users...</div>;
    }

    if (!isLoading && users.length === 0) {
        return <div className="py-16 text-center text-darker-grey">No users found.</div>;
    }

    const renderActions = (user: User) => (
        <>
            <button
                title="Modify"
                className={cn(actionButtonStyles, actionColors.modify)}
                onClick={() => onModify(user)}
            >
                <Pencil size={18} />
            </button>
            <button
                title="Delete"
                className={cn(actionButtonStyles, actionColors.delete)}
                onClick={() => onDelete(user)}
            >
                <Trash2 size={18} />
            </button>
        </>
    );

    return (
        <>
            <div className="flex flex-col border-t border-light-grey md:hidden">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="flex flex-col gap-3 border-b border-light-grey px-1 py-4"
                    >
                        <div className="flex flex-row items-center gap-3">
                            <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: teacherColor(user.id) }}
                            />
                            <div className="flex min-w-0 flex-col gap-1">
                                <span className="truncate font-bold text-black">
                                    {user.firstName} {user.lastName}
                                </span>
                                <span className="truncate text-sm text-darker-grey">{user.email}</span>
                            </div>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-3">
                            <span className={cn("w-fit rounded-full px-3 py-1 text-xs font-bold capitalize", roleStyles(user.role ?? "teacher"))}>
                                {user.role ?? "teacher"}
                            </span>
                            <div className="flex flex-row gap-1">{renderActions(user)}</div>
                        </div>
                        {user.additionalInfo && (
                            <span className="text-sm text-darker-grey">{user.additionalInfo}</span>
                        )}
                    </div>
                ))}
            </div>

            <div className="hidden overflow-hidden rounded-2xl border border-light-grey bg-white md:block">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-light-grey bg-light-grey/50 text-xs uppercase tracking-wide text-darker-grey">
                            <th className="px-4 py-3 font-bold">User</th>
                            <th className="px-4 py-3 font-bold">Role</th>
                            <th className="px-4 py-3 font-bold">Additional info</th>
                            <th className="px-4 py-3 text-right font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="border-b border-light-grey/70 transition last:border-0 hover:bg-light-grey/40"
                            >
                                <td className="px-4 py-4">
                                    <div className="flex flex-row items-center gap-3">
                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: teacherColor(user.id) }}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-black">
                                                {user.firstName} {user.lastName}
                                            </span>
                                            <span className="text-darker-grey">{user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className={cn("rounded-full px-3 py-1 text-xs font-bold capitalize", roleStyles(user.role ?? "teacher"))}>
                                        {user.role ?? "teacher"}
                                    </span>
                                </td>
                                <td className="max-w-[18rem] truncate px-4 py-4 text-darker-grey" title={user.additionalInfo ?? undefined}>
                                    {user.additionalInfo || "-"}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-row justify-end gap-1">
                                        {renderActions(user)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
