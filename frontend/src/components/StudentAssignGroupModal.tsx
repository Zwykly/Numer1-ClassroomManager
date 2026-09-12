import { useEffect, useState } from "react";
import { clsx as cn } from "clsx";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import { useGroups, useGroupsActions } from "@/stores/useGroupsStore";
import type { Student } from "@/stores/useStudentsStore";
import eden from "@/lib/eden";

type StudentAssignGroupModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: Student | null;
};

export function StudentAssignGroupModal({
    open,
    onOpenChange,
    student,
}: StudentAssignGroupModalProps) {
    const groups = useGroups();
    const { fetchGroups } = useGroupsActions();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        setSelectedId(null);
        fetchGroups();
    }, [open]);

    const handleAssign = async () => {
        if (!student || !selectedId) return;
        setIsSubmitting(true);
        try {
            await eden["group-students"].post({
                groupId: selectedId,
                studentId: student.id,
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to add student to group:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title="Add to group"
            description={
                student
                    ? `Select a group for ${student.firstName} ${student.lastName}.`
                    : "Select a group."
            }
            className="max-w-xl"
        >
            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
                {groups.length === 0 && (
                    <div className="py-10 text-center text-darker-grey">
                        No groups available yet.
                    </div>
                )}
                {groups.map((group) => {
                    const isSelected = group.id === selectedId;
                    return (
                        <button
                            key={group.id}
                            onClick={() => setSelectedId(group.id)}
                            className={cn(
                                "flex flex-col rounded-xl border px-4 py-3 text-left transition",
                                isSelected
                                    ? "border-orange bg-orange/10"
                                    : "border-light-grey hover:border-grey hover:bg-light-grey/50",
                            )}
                        >
                            <span className="font-bold text-black">{group.name}</span>
                            {group.description && (
                                <span className="text-sm text-darker-grey">{group.description}</span>
                            )}
                        </button>
                    );
                })}
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" className="w-full border border-grey sm:w-auto" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button variant="primary" className="w-full sm:w-auto" onClick={handleAssign} disabled={!selectedId || isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add to group"}
                </Button>
            </div>
        </Modal>
    );
}
