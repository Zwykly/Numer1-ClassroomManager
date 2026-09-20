import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { clsx as cn } from "clsx";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";

type StudentOption = {
    id: string;
    firstName: string;
    lastName: string;
};

type RemoveStudentsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teacherName: string;
    students: StudentOption[];
    onRemove: (selectedIds: string[]) => void;
    onKeep: () => void;
};

export function RemoveStudentsModal({
    open,
    onOpenChange,
    teacherName,
    students,
    onRemove,
    onKeep,
}: RemoveStudentsModalProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!open) return;
        setSelected(new Set(students.map((student) => student.id)));
    }, [open, students]);

    const allSelected = students.length > 0 && selected.size === students.length;

    const toggle = (id: string) => {
        setSelected((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        setSelected(allSelected ? new Set() : new Set(students.map((student) => student.id)));
    };

    return (
        <Modal
            open={open}
            onOpenChange={(next) => {
                if (!next) onKeep();
                onOpenChange(next);
            }}
            title="Remove students too?"
            description={`The group will be removed from ${teacherName}. Do you want to remove these students from ${teacherName} as well?`}
            className="max-w-lg"
        >
            <div className="flex flex-col gap-3">
                <div className="flex max-h-72 flex-col gap-1 overflow-y-auto overscroll-contain rounded-xl border border-light-grey p-2">
                    {students.map((student) => {
                        const isSelected = selected.has(student.id);
                        return (
                            <button
                                key={student.id}
                                type="button"
                                onClick={() => toggle(student.id)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition",
                                    isSelected ? "bg-orange/10" : "hover:bg-light-grey/60",
                                )}
                            >
                                <span
                                    className={cn(
                                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                                        isSelected
                                            ? "border-orange bg-orange text-white"
                                            : "border-grey bg-white",
                                    )}
                                >
                                    {isSelected && <Check size={13} />}
                                </span>
                                <span
                                    className={cn(
                                        "truncate font-medium",
                                        isSelected ? "text-orange line-through" : "text-black",
                                    )}
                                >
                                    {student.firstName} {student.lastName}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={toggleAll}
                    className="flex w-fit items-center gap-3 rounded-lg px-1 py-1 text-sm font-bold text-darker-grey transition hover:text-black"
                >
                    <span
                        className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-md border transition",
                            allSelected
                                ? "border-orange bg-orange text-white"
                                : "border-grey bg-white",
                        )}
                    >
                        {allSelected && <Check size={13} />}
                    </span>
                    {allSelected ? "Unselect all" : "Select all"}
                </button>

                <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                        variant="secondary"
                        className="w-full border border-grey sm:w-auto"
                        onClick={() => {
                            onKeep();
                            onOpenChange(false);
                        }}
                    >
                        Don't remove
                    </Button>
                    <Button
                        variant="primary"
                        className="w-full sm:w-auto"
                        onClick={() => {
                            onRemove([...selected]);
                            onOpenChange(false);
                        }}
                    >
                        Remove
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
