import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { clsx as cn } from "clsx";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import type { NewStudent, Student, StudentPatch } from "@/stores/useStudentsStore";

type StudentFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student?: Student | null;
    onSubmitBatch: (students: NewStudent[]) => Promise<void>;
    onSubmitEdit: (id: string, data: StudentPatch) => Promise<void>;
};

type Draft = {
    key: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    additionalInfo: string;
};

type EditForm = Omit<Draft, "key">;

const STUDENT_COLORS = [
    "hsl(19,97%,51%)",
    "hsl(205,75%,52%)",
    "hsl(150,50%,42%)",
    "hsl(280,52%,58%)",
    "hsl(45,90%,50%)",
    "hsl(340,72%,58%)",
    "hsl(180,48%,42%)",
];

const emptyForm: EditForm = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    additionalInfo: "",
};

const createDraft = (): Draft => ({
    key: crypto.randomUUID(),
    ...emptyForm,
});

export function StudentFormModal({
    open,
    onOpenChange,
    student,
    onSubmitBatch,
    onSubmitEdit,
}: StudentFormModalProps) {
    const isEdit = Boolean(student);
    const [drafts, setDrafts] = useState<Draft[]>([createDraft()]);
    const [selectedKey, setSelectedKey] = useState<string>("");
    const [editForm, setEditForm] = useState<EditForm>(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (student) {
            setEditForm({
                firstName: student.firstName ?? "",
                lastName: student.lastName ?? "",
                phoneNumber: student.phoneNumber ?? "",
                email: student.email ?? "",
                additionalInfo: student.additionalInfo ?? "",
            });
        } else {
            const draft = createDraft();
            setDrafts([draft]);
            setSelectedKey(draft.key);
        }
    }, [open, student]);

    const selectedDraft = drafts.find((draft) => draft.key === selectedKey) ?? drafts[0];
    const selectedIndex = selectedDraft ? drafts.indexOf(selectedDraft) : 0;
    const activeColor = STUDENT_COLORS[selectedIndex % STUDENT_COLORS.length];

    const updateDraft = (key: string, field: keyof EditForm, value: string) => {
        setDrafts((current) =>
            current.map((draft) => (draft.key === key ? { ...draft, [field]: value } : draft)),
        );
    };

    const addDraft = () => {
        const draft = createDraft();
        setDrafts((current) => [...current, draft]);
        setSelectedKey(draft.key);
    };

    const removeDraft = (key: string) => {
        if (drafts.length <= 1) return;
        const next = drafts.filter((draft) => draft.key !== key);
        if (key === selectedKey) {
            setSelectedKey(next[next.length - 1]!.key);
        }
        setDrafts(next);
    };

    const canSubmitAdd =
        drafts.length > 0 &&
        drafts.every((draft) => draft.firstName.trim() && draft.lastName.trim()) &&
        !isSubmitting;

    const handleSubmit = async () => {
        if (isEdit && student) {
            const payload: StudentPatch = {
                firstName: editForm.firstName.trim(),
                lastName: editForm.lastName.trim(),
                phoneNumber: editForm.phoneNumber.trim() || null,
                email: editForm.email.trim() || null,
                additionalInfo: editForm.additionalInfo.trim() || null,
            };
            setIsSubmitting(true);
            try {
                await onSubmitEdit(student.id, payload);
                onOpenChange(false);
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        if (!canSubmitAdd) return;
        const payload: NewStudent[] = drafts.map((draft) => ({
            firstName: draft.firstName.trim(),
            lastName: draft.lastName.trim(),
            phoneNumber: draft.phoneNumber.trim() || null,
            email: draft.email.trim() || null,
            additionalInfo: draft.additionalInfo.trim() || null,
        }));
        setIsSubmitting(true);
        try {
            await onSubmitBatch(payload);
            onOpenChange(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? "Modify student" : "Add students"}
            description={
                isEdit
                    ? "Update the details of this student."
                    : "Fill in the details of each student. Add more students to create a batch."
            }
            className={isEdit ? "max-w-xl" : "max-w-4xl"}
        >
            {isEdit ? (
                <div className="flex flex-col gap-3">
                    <div className="h-1 w-full rounded-full" style={{ backgroundColor: STUDENT_COLORS[0] }} />
                    <StudentFields value={editForm} onChange={(field, value) => setEditForm((current) => ({ ...current, [field]: value }))} />
                    <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button variant="secondary" className="w-full border border-grey sm:w-auto" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button
                            variant="primary"
                            className="w-full sm:w-auto"
                            onClick={handleSubmit}
                            disabled={!editForm.firstName.trim() || !editForm.lastName.trim() || isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save changes"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-5 sm:flex-row">
                    <div className="flex flex-1 flex-col">
                        <div className="h-1 w-full rounded-full" style={{ backgroundColor: activeColor }} />
                        <div className="mt-3">
                            {selectedDraft && (
                                <StudentFields
                                    value={selectedDraft}
                                    onChange={(field, value) => updateDraft(selectedDraft.key, field, value)}
                                />
                            )}
                        </div>
                        <div className="mt-auto flex flex-col-reverse gap-2 pt-6 sm:flex-row sm:justify-end">
                            <Button variant="secondary" className="w-full border border-grey sm:w-auto" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button variant="primary" className="w-full sm:w-auto" onClick={handleSubmit} disabled={!canSubmitAdd}>
                                {isSubmitting ? "Adding..." : `Add ${drafts.length > 1 ? `${drafts.length} students` : "student"}`}
                            </Button>
                        </div>
                    </div>

                    <div className="flex w-full flex-col rounded-xl bg-light-black p-3 sm:w-64">
                        <span className="px-1 text-xs font-bold uppercase tracking-wide text-white/60">
                            Students ({drafts.length})
                        </span>
                        <div className="mt-2 flex flex-1 flex-col gap-1.5 overflow-y-auto">
                            {drafts.map((draft, index) => {
                                const isSelected = draft.key === selectedDraft?.key;
                                const color = STUDENT_COLORS[index % STUDENT_COLORS.length];
                                return (
                                    <div
                                        key={draft.key}
                                        onClick={() => setSelectedKey(draft.key)}
                                        className={cn(
                                            "group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 transition",
                                            isSelected ? "bg-dark-grey/40" : "bg-dark-grey/10 hover:bg-dark-grey/20",
                                        )}
                                    >
                                        <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
                                        <span className={cn("flex-1 truncate text-sm", isSelected ? "text-white" : "text-white/80")}>
                                            {draft.firstName || draft.lastName
                                                ? `${draft.firstName} ${draft.lastName}`.trim()
                                                : "New student"}
                                        </span>
                                        {drafts.length > 1 && (
                                            <button
                                                className="text-white/40 opacity-0 transition hover:text-orange group-hover:opacity-100"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    removeDraft(draft.key);
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            onClick={addDraft}
                            title="Add another student"
                            className="mt-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-white/80 transition hover:border-orange hover:text-orange"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

type StudentFieldsProps = {
    value: EditForm;
    onChange: (field: keyof EditForm, value: string) => void;
};

function StudentFields({ value, onChange }: StudentFieldsProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
                <Field
                    label="First name"
                    value={value.firstName}
                    onChange={(v) => onChange("firstName", v)}
                    placeholder="eg. Ewa"
                />
                <Field
                    label="Last name"
                    value={value.lastName}
                    onChange={(v) => onChange("lastName", v)}
                    placeholder="eg. Nowacka"
                />
            </div>
            <Field
                label="Phone number"
                value={value.phoneNumber}
                onChange={(v) => onChange("phoneNumber", v)}
                placeholder="eg. 123 456 789"
            />
            <Field
                label="Email"
                value={value.email}
                onChange={(v) => onChange("email", v)}
                placeholder="eg. ewa.nowacka@gmail.com"
            />
            <div className="flex flex-col">
                <span className="text-sm font-bold text-black">Additional info</span>
                <textarea
                    value={value.additionalInfo}
                    onChange={(event) => onChange("additionalInfo", event.target.value)}
                    placeholder="Notes, accessibility needs, etc."
                    rows={2}
                    className="mt-1 w-full resize-none rounded-xl border border-grey bg-white px-3 py-2 text-black placeholder:text-darker-grey focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
                />
            </div>
        </div>
    );
}

type FieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

function Field({ label, value, onChange, placeholder }: FieldProps) {
    return (
        <label className="flex flex-1 flex-col">
            <span className="text-sm font-bold text-black">{label}</span>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="mt-1 w-full rounded-xl border border-grey bg-white px-3 py-2 text-black placeholder:text-darker-grey focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
            />
        </label>
    );
}
