import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { clsx as cn } from "clsx";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import { CLASSROOM_COLORS } from "@/utils/classroomColors";
import type { Classroom, ClassroomPatch, NewClassroom } from "@/stores/useClassroomsStore";

type ClassroomFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classroom?: Classroom | null;
    onCreate: (data: NewClassroom) => Promise<void>;
    onUpdate: (id: string, data: ClassroomPatch) => Promise<void>;
};

export const CLASSROOM_STATUSES = ["active", "maintenance", "inactive"] as const;
export type ClassroomStatus = (typeof CLASSROOM_STATUSES)[number];

type Form = {
    name: string;
    maxNumberOfPeople: string;
    status: ClassroomStatus;
    additionalInfo: string;
    color: string;
};

const emptyForm: Form = {
    name: "",
    maxNumberOfPeople: "",
    status: "active",
    additionalInfo: "",
    color: "",
};

const inputClass =
    "mt-1 w-full rounded-xl border border-grey bg-white px-3 py-2 text-black placeholder:text-darker-grey focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30";

export function ClassroomFormModal({
    open,
    onOpenChange,
    classroom,
    onCreate,
    onUpdate,
}: ClassroomFormModalProps) {
    const isEdit = Boolean(classroom);
    const [form, setForm] = useState<Form>(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        if (classroom) {
            setForm({
                name: classroom.name ?? "",
                maxNumberOfPeople: String(classroom.maxNumberOfPeople ?? ""),
                status: (CLASSROOM_STATUSES as readonly string[]).includes(classroom.status)
                    ? (classroom.status as ClassroomStatus)
                    : "active",
                additionalInfo: classroom.additionalInfo ?? "",
                color: classroom.color ?? "",
            });
        } else {
            setForm(emptyForm);
        }
        setError(null);
    }, [open, classroom]);

    const setField = (field: keyof Form, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const capacity = Number.parseInt(form.maxNumberOfPeople, 10);
    const isValid =
        form.name.trim().length > 0 &&
        Number.isFinite(capacity) &&
        capacity > 0 &&
        !isSubmitting;

    const handleSubmit = async () => {
        if (!isValid) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const payload: NewClassroom = {
                name: form.name.trim(),
                maxNumberOfPeople: capacity,
                status: form.status,
                additionalInfo: form.additionalInfo.trim() || null,
                color: form.color.trim() || null,
            };

            if (isEdit && classroom) {
                await onUpdate(classroom.id, payload as ClassroomPatch);
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
            title={isEdit ? "Edit classroom" : "Add classroom"}
            description={
                isEdit
                    ? "Update this physical room's details and availability."
                    : "Register a physical room that can be reserved for classes."
            }
            className="max-w-xl"
        >
            <div className="flex flex-col gap-3">
                <div className="h-1 w-full rounded-full bg-orange" />

                <label className="flex flex-col">
                    <span className="text-sm font-bold text-black">Classroom name</span>
                    <input
                        value={form.name}
                        onChange={(event) => setField("name", event.target.value)}
                        placeholder="eg. Room 101"
                        className={inputClass}
                    />
                </label>

                <label className="flex flex-col">
                    <span className="text-sm font-bold text-black">Capacity</span>
                    <input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={form.maxNumberOfPeople}
                        onChange={(event) => setField("maxNumberOfPeople", event.target.value)}
                        placeholder="Maximum number of people"
                        className={inputClass}
                    />
                </label>

                <div className="flex flex-col">
                    <span className="text-sm font-bold text-black">Status</span>
                    <div className="mt-1 flex flex-row flex-wrap gap-2">
                        {CLASSROOM_STATUSES.map((status) => {
                            const isSelected = form.status === status;
                            return (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setField("status", status)}
                                    className={cn(
                                        "flex-1 rounded-xl border px-4 py-2 text-sm font-bold capitalize transition",
                                        isSelected
                                            ? "border-orange bg-orange/10 text-orange"
                                            : "border-grey bg-white text-darker-grey hover:border-dark-grey",
                                    )}
                                >
                                    {status}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-sm font-bold text-black">Color</span>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        {CLASSROOM_COLORS.map((swatch) => {
                            const isSelected = form.color.toLowerCase() === swatch;
                            return (
                                <button
                                    key={swatch}
                                    type="button"
                                    title={swatch}
                                    onClick={() => setField("color", swatch)}
                                    className={cn(
                                        "h-8 w-8 rounded-full border-2 transition",
                                        isSelected ? "border-black" : "border-transparent hover:border-grey",
                                    )}
                                    style={{ backgroundColor: swatch }}
                                />
                            );
                        })}
                        <label
                            title="Custom color"
                            className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-grey text-darker-grey transition hover:border-orange hover:text-orange"
                        >
                            <Plus size={16} />
                            <input
                                type="color"
                                value={form.color || "#e07a5f"}
                                onChange={(event) => setField("color", event.target.value)}
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />
                        </label>
                        {form.color && (
                            <button
                                type="button"
                                onClick={() => setField("color", "")}
                                className="text-xs font-bold text-darker-grey transition hover:text-orange"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-sm font-bold text-black">Additional info</span>
                    <textarea
                        value={form.additionalInfo}
                        onChange={(event) => setField("additionalInfo", event.target.value)}
                        placeholder="Equipment, location, notes, etc."
                        rows={3}
                        className={cn(inputClass, "resize-none")}
                    />
                </div>

                {error && (
                    <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700">
                        {error}
                    </p>
                )}

                <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" className="w-full border border-grey sm:w-auto" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" className="w-full sm:w-auto" onClick={handleSubmit} disabled={!isValid}>
                        {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create classroom"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
