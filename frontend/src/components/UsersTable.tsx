import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { clsx as cn } from "clsx";
import type { User } from "@/stores/useUsersStore";
import { userColor } from "@/utils/userColors";
import { actionButtonStyles, actionColors } from "@/utils/actionColors";

type UsersTableProps = {
    users: User[];
    isLoading: boolean;
    onModify: (user: User) => void;
    onDelete: (user: User) => void;
};

function roleStyles(role: string) {
    if (role === "admin") return "bg-orange/10 text-orange";
    if (role === "pending") return "bg-amber-500/10 text-amber-700";
    return "bg-light-grey text-darker-grey";
}

function AssociationPills({ label, items }: { label: string; items: { id: string; name: string }[] }) {
    return (
        <div>
            <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">
                {label} ({items.length})
            </span>
            {items.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                    {items.map((item) => (
                        <span
                            key={item.id}
                            className="inline-flex items-center rounded-full border border-light-grey bg-white px-3 py-1 text-xs font-medium text-black"
                        >
                            {item.name}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="mt-2 text-sm text-darker-grey">None assigned.</p>
            )}
        </div>
    );
}

export function UsersTable({
    users,
    isLoading,
    onModify,
    onDelete,
}: UsersTableProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

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

    const renderAssociations = (user: User) => (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <AssociationPills
                label="Groups"
                items={(user.groups ?? []).map((group) => ({ id: group.id, name: group.name }))}
            />
            <AssociationPills
                label="Students"
                items={(user.students ?? []).map((student) => ({
                    id: student.id,
                    name: `${student.firstName} ${student.lastName}`,
                }))}
            />
        </div>
    );

    return (
        <>
            <div className="flex flex-col border-t border-light-grey md:hidden">
                {users.map((user) => {
                    const isExpanded = expandedId === user.id;
                    return (
                        <div key={user.id} className="border-b border-light-grey">
                            <div
                                onClick={() => setExpandedId(isExpanded ? null : user.id)}
                                className="flex cursor-pointer flex-col gap-3 px-1 py-4"
                            >
                                <div className="flex flex-row items-center gap-3">
                                    <span
                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                        style={{ backgroundColor: userColor(user.color) }}
                                    />
                                    <div className="flex min-w-0 flex-col gap-1">
                                        <span className="truncate font-bold text-black">
                                            {user.firstName} {user.lastName}
                                        </span>
                                        <span className="truncate text-sm text-darker-grey">{user.email}</span>
                                    </div>
                                    <span className={cn(actionButtonStyles, "ml-auto shrink-0 p-1.5", actionColors.expand)}>
                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </span>
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
                            {isExpanded && (
                                <div className="px-1 pb-5">{renderAssociations(user)}</div>
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
                            <th className="px-4 py-3 font-bold">User</th>
                            <th className="px-4 py-3 font-bold">Role</th>
                            <th className="px-4 py-3 font-bold">Additional info</th>
                            <th className="px-4 py-3 text-right font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            const isExpanded = expandedId === user.id;
                            return (
                                <Fragment key={user.id}>
                                    <tr
                                        onClick={() => setExpandedId(isExpanded ? null : user.id)}
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
                                        <td className="px-4 py-4">
                                            <div className="flex flex-row items-center gap-3">
                                                <span
                                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                    style={{ backgroundColor: userColor(user.color) }}
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

                                    {isExpanded && (
                                        <tr className="border-b border-light-grey/70 bg-light-grey/30">
                                            <td />
                                            <td colSpan={4} className="px-4 pb-6 pt-2">
                                                {renderAssociations(user)}
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
