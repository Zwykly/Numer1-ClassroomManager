import { useEffect, useState } from "react";
import { Search, Users, X } from "lucide-react";
import { clsx as cn } from "clsx";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import type { Group, GroupPatch, NewGroup } from "@/stores/useGroupsStore";
import eden from "@/lib/eden";

type GroupFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    group?: Group | null;
    onCreate: (data: NewGroup) => Promise<void>;
    onUpdate: (id: string, data: GroupPatch) => Promise<void>;
};

type Member = {
    id: string;
    firstName: string;
    lastName: string;
};

const inputClass =
    "mt-1 w-full rounded-xl border border-grey bg-white px-3 py-2 text-black placeholder:text-darker-grey focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30";

export function GroupFormModal({ open, onOpenChange, group, onCreate, onUpdate }: GroupFormModalProps) {
    const isEdit = Boolean(group);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [members, setMembers] = useState<Member[]>([]);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<Member[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setName(group?.name ?? "");
        setDescription(group?.description ?? "");
        setMembers(
            (group?.students ?? []).map((student) => ({
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
            })),
        );
        setSearch("");
        setResults([]);
        setError(null);
    }, [open, group]);

    useEffect(() => {
        if (!open) return;

        const query = search.trim();
        const timeout = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await eden.students.get({
                    query: {
                        limit: 50,
                        ...(query ? { search: query } : {}),
                    },
                });
                setResults(response.data?.data ?? []);
            } catch (err) {
                console.error("Failed to search students:", err);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 250);

        return () => clearTimeout(timeout);
    }, [open, search]);

    const memberIds = new Set(members.map((member) => member.id));
    const candidates = results.filter((student) => !memberIds.has(student.id));

    const addMember = (student: Member) => {
        setMembers((current) =>
            current.some((member) => member.id === student.id) ? current : [...current, student],
        );
        setSearch("");
    };

    const removeMember = (id: string) => {
        setMembers((current) => current.filter((member) => member.id !== id));
    };

    const canSubmit = name.trim().length > 0 && !isSubmitting;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const payload = {
                name: name.trim(),
                description: description.trim() || null,
                studentIds: members.map((member) => member.id),
            };

            if (isEdit && group) {
                await onUpdate(group.id, payload);
            } else {
                await onCreate(payload);
            }
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? "Edit group" : "Create group"}
            description={
                isEdit
                    ? "Update the group details and manage its students."
                    : "Name the group and add the students that belong to it."
            }
            className="max-w-4xl"
        >
            <div className="flex flex-col gap-4">
                <div className="h-1 w-full rounded-full bg-orange" />

                <div className="flex flex-row gap-5">
                    <div className="flex flex-1 flex-col gap-3">
                        <label className="flex flex-col">
                            <span className="text-sm font-bold text-black">Group name</span>
                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="eg. Algebra basics - Monday"
                                className={inputClass}
                            />
                        </label>

                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-black">Description</span>
                            <textarea
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="What is this group for?"
                                rows={5}
                                className={cn(inputClass, "resize-none")}
                            />
                        </div>

                        {error && (
                            <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="flex w-80 flex-col rounded-xl border border-light-grey p-3">
                        <span className="px-1 text-xs font-bold uppercase tracking-wide text-darker-grey">
                            Students ({members.length})
                        </span>

                        <div className="mt-2 flex max-h-36 flex-col gap-1.5 overflow-y-auto">
                            {members.length === 0 && (
                                <span className="py-4 text-center text-sm text-darker-grey">
                                    No students added yet.
                                </span>
                            )}
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center gap-2 rounded-lg bg-light-grey/60 px-2 py-1.5"
                                >
                                    <Users size={15} className="shrink-0 text-darker-grey" />
                                    <span className="flex-1 truncate text-sm text-black">
                                        {member.firstName} {member.lastName}
                                    </span>
                                    <button
                                        type="button"
                                        title="Remove from group"
                                        onClick={() => removeMember(member.id)}
                                        className="text-darker-grey transition hover:text-orange"
                                    >
                                        <X size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 flex items-center gap-2 rounded-xl border border-grey bg-white px-3 py-2 focus-within:border-orange">
                            <Search size={16} className="text-darker-grey" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search students by name..."
                                className="w-full bg-transparent text-black placeholder:text-darker-grey focus:outline-none"
                            />
                        </div>

                        <div className="mt-2 flex max-h-40 flex-col gap-1.5 overflow-y-auto">
                            {isSearching && (
                                <span className="py-3 text-center text-sm text-darker-grey">Searching...</span>
                            )}
                            {!isSearching && candidates.length === 0 && (
                                <span className="py-3 text-center text-sm text-darker-grey">
                                    {search.trim() ? "No matching students." : "Type a name to search."}
                                </span>
                            )}
                            {!isSearching &&
                                candidates.map((student) => (
                                    <button
                                        key={student.id}
                                        type="button"
                                        onClick={() => addMember(student)}
                                        className="flex items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm text-black/80 transition hover:bg-orange/10 hover:text-orange"
                                    >
                                        <span className="truncate">
                                            {student.firstName} {student.lastName}
                                        </span>
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>

                <div className="mt-1 flex justify-end gap-2">
                    <Button variant="secondary" className="border border-grey" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
                        {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create group"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
