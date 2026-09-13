import { useEffect, useState } from "react";
import { clsx as cn } from "clsx";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import type { NewUserAccount, User, UserPatch } from "@/stores/useUsersStore";

type UserFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: User | null;
    onCreate: (data: NewUserAccount) => Promise<string | null>;
    onUpdate: (id: string, data: UserPatch) => Promise<void>;
};

type Form = {
    firstName: string;
    lastName: string;
    email: string;
    role: "admin" | "teacher";
    additionalInfo: string;
    password: string;
};

const emptyForm: Form = {
    firstName: "",
    lastName: "",
    email: "",
    role: "teacher",
    additionalInfo: "",
    password: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function UserFormModal({
    open,
    onOpenChange,
    user,
    onCreate,
    onUpdate,
}: UserFormModalProps) {
    const isEdit = Boolean(user);
    const [form, setForm] = useState<Form>(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (user) {
            setForm({
                firstName: user.firstName ?? "",
                lastName: user.lastName ?? "",
                email: user.email ?? "",
                role: user.role === "admin" ? "admin" : "teacher",
                additionalInfo: user.additionalInfo ?? "",
                password: "",
            });
        } else {
            setForm(emptyForm);
        }
    }, [open, user]);

    const setField = (field: keyof Form, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const isValid =
        form.firstName.trim().length > 0 &&
        form.lastName.trim().length > 0 &&
        emailPattern.test(form.email.trim()) &&
        (isEdit || form.password.trim().length === 0 || form.password.trim().length >= 8) &&
        !isSubmitting;

    const handleSubmit = async () => {
        if (!isValid) return;
        setIsSubmitting(true);
        try {
            if (isEdit && user) {
                const payload: UserPatch = {
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    email: form.email.trim(),
                    role: form.role,
                    additionalInfo: form.additionalInfo.trim() || null,
                };
                await onUpdate(user.id, payload);
                onOpenChange(false);
            } else {
                const payload: NewUserAccount = {
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    email: form.email.trim(),
                    role: form.role,
                    additionalInfo: form.additionalInfo.trim() || null,
                    ...(form.password.trim() ? { password: form.password.trim() } : {}),
                };
                const password = await onCreate(payload);
                if (password) {
                    onOpenChange(false);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? "Modify user" : "Add user"}
            description={
                isEdit
                    ? "Update this account's details and access level."
                    : "Create a new account. A sample password will be generated and shown once the account is ready."
            }
            className="max-w-xl"
        >
            <div className="flex flex-col gap-3">
                <div className="h-1 w-full rounded-full bg-orange" />

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Field
                        label="First name"
                        value={form.firstName}
                        onChange={(value) => setField("firstName", value)}
                        placeholder="eg. Ewa"
                    />
                    <Field
                        label="Last name"
                        value={form.lastName}
                        onChange={(value) => setField("lastName", value)}
                        placeholder="eg. Nowacka"
                    />
                </div>

                <Field
                    label="Email"
                    value={form.email}
                    onChange={(value) => setField("email", value)}
                    placeholder="eg. ewa.nowacka@school.com"
                />

                <div className="flex flex-col">
                    <span className="text-sm font-bold text-black">Role</span>
                    <div className="mt-1 flex flex-row gap-2">
                        {(["teacher", "admin"] as const).map((role) => {
                            const isSelected = form.role === role;
                            return (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setField("role", role)}
                                    className={cn(
                                        "flex-1 rounded-xl border px-4 py-2 text-sm font-bold capitalize transition",
                                        isSelected
                                            ? "border-orange bg-orange/10 text-orange"
                                            : "border-grey bg-white text-darker-grey hover:border-dark-grey",
                                    )}
                                >
                                    {role}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {!isEdit && (
                    <Field
                        label="Password (optional)"
                        value={form.password}
                        onChange={(value) => setField("password", value)}
                        placeholder="Leave empty to generate a sample password"
                    />
                )}

                <div className="flex flex-col">
                    <span className="text-sm font-bold text-black">Additional info</span>
                    <textarea
                        value={form.additionalInfo}
                        onChange={(event) => setField("additionalInfo", event.target.value)}
                        placeholder="Notes, department, etc."
                        rows={2}
                        className="mt-1 w-full resize-none rounded-xl border border-grey bg-white px-3 py-2 text-black placeholder:text-darker-grey focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
                    />
                </div>

                <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" className="w-full border border-grey sm:w-auto" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button variant="primary" className="w-full sm:w-auto" onClick={handleSubmit} disabled={!isValid}>
                        {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create account"}
                    </Button>
                </div>
            </div>
        </Modal>
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
