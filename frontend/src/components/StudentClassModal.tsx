import { School } from "lucide-react";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import type { Student } from "@/stores/useStudentsStore";

type StudentClassModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: Student | null;
};

export function StudentClassModal({
    open,
    onOpenChange,
    student,
}: StudentClassModalProps) {
    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title="Add to class"
            className="max-w-md"
        >
            {/*
             * TODO: Assign the student to a scheduled class or to a recurring class in the future.
             * The form will let the admin pick an existing reservation (scheduled class) or a
             * reservation cycle (recurring class) and create the matching relation.
             */}
            <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 text-orange">
                    <School size={28} />
                </div>
                <p className="text-black/70">
                    {student
                        ? `Adding ${student.firstName} ${student.lastName} to a class isn't available yet.`
                        : "Adding a student to a class isn't available yet."}
                </p>
                <p className="text-sm text-darker-grey">
                    This will let you assign a student to a scheduled class or a recurring class in a future update.
                </p>
            </div>
            <div className="mt-2 flex justify-end">
                <Button variant="secondary" className="border border-grey" onClick={() => onOpenChange(false)}>Close</Button>
            </div>
        </Modal>
    );
}
