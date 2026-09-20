import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { clsx as cn } from "clsx";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import { EntityPicker, type EntityPickerItem } from "./common/EntityPicker";
import { RemoveStudentsModal } from "./RemoveStudentsModal";
import { USER_COLORS } from "@/utils/userColors";
import eden from "@/lib/eden";
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
    color: string;
    password: string;
};

const emptyForm: Form = {
    firstName: "",
    lastName: "",
    email: "",
    role: "teacher",
    additionalInfo: "",
    color: "",
    password: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type GroupOption = {
    id: string;
    name: string;
    students?: StudentOption[];
};

type StudentOption = {
    id: string;
    firstName: string;
    lastName: string;
};

const groupLabel = (group: GroupOption) => group.name;
const studentLabel = (student: StudentOption) => `${student.firstName} ${student.lastName}`.trim();

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

    const [groups, setGroups] = useState<GroupOption[]>([]);
    const [groupSearch, setGroupSearch] = useState("");
    const [groupResults, setGroupResults] = useState<GroupOption[]>([]);
    const [isSearchingGroups, setIsSearchingGroups] = useState(false);

    const [students, setStudents] = useState<StudentOption[]>([]);
    const [studentSearch, setStudentSearch] = useState("");
    const [studentResults, setStudentResults] = useState<StudentOption[]>([]);
    const [isSearchingStudents, setIsSearchingStudents] = useState(false);

    const [pendingRemoval, setPendingRemoval] = useState<{ teacherName: string; students: StudentOption[] } | null>(null);
    const [removeOpen, setRemoveOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (user) {
            setForm({
                firstName: user.firstName ?? "",
                lastName: user.lastName ?? "",
                email: user.email ?? "",
                role: user.role === "admin" ? "admin" : "teacher",
                additionalInfo: user.additionalInfo ?? "",
                color: user.color ?? "",
                password: "",
            });
            setGroups((user.groups ?? []).map((group) => ({ id: group.id, name: group.name })));
            setStudents(
                (user.students ?? []).map((student) => ({
                    id: student.id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                })),
            );
        } else {
            setForm(emptyForm);
            setGroups([]);
            setStudents([]);
        }
        setGroupSearch("");
        setGroupResults([]);
        setStudentSearch("");
        setStudentResults([]);
    }, [open, user]);

    const showAssociations = form.role === "teacher";

    useEffect(() => {
        if (!open || !showAssociations) return;

        const query = groupSearch.trim();
        const timeout = setTimeout(async () => {
            setIsSearchingGroups(true);
            try {
                const response = await eden.groups.get({
                    query: { limit: 50, ...(query ? { search: query } : {}) },
                });
                setGroupResults((response.data?.data ?? []).map((group) => ({
                    id: group.id,
                    name: group.name,
                    students: (group.students ?? []).map((student) => ({
                        id: student.id,
                        firstName: student.firstName,
                        lastName: student.lastName,
                    })),
                })));
            } catch (err) {
                console.error("Failed to search groups:", err);
                setGroupResults([]);
            } finally {
                setIsSearchingGroups(false);
            }
        }, 250);

        return () => clearTimeout(timeout);
    }, [open, showAssociations, groupSearch]);

    useEffect(() => {
        if (!open || !showAssociations) return;

        const query = studentSearch.trim();
        const timeout = setTimeout(async () => {
            setIsSearchingStudents(true);
            try {
                const response = await eden.students.get({
                    query: { limit: 50, ...(query ? { search: query } : {}) },
                });
                setStudentResults(
                    (response.data?.data ?? []).map((student) => ({
                        id: student.id,
                        firstName: student.firstName,
                        lastName: student.lastName,
                    })),
                );
            } catch (err) {
                console.error("Failed to search students:", err);
                setStudentResults([]);
            } finally {
                setIsSearchingStudents(false);
            }
        }, 250);

        return () => clearTimeout(timeout);
    }, [open, showAssociations, studentSearch]);

    const groupIds = new Set(groups.map((group) => group.id));
    const groupCandidates = groupResults.filter((group) => !groupIds.has(group.id));

    const studentIds = new Set(students.map((student) => student.id));
    const studentCandidates = studentResults.filter((student) => !studentIds.has(student.id));

    const addGroup = (item: EntityPickerItem) => {
        const group = groupResults.find((candidate) => candidate.id === item.id);
        if (!group) return;
        setGroups((current) => (current.some((entry) => entry.id === group.id) ? current : [...current, group]));

        // Students of a newly assigned group are automatically assigned too.
        const members = group.students ?? [];
        if (members.length > 0) {
            setStudents((current) => {
                const ids = new Set(current.map((student) => student.id));
                const additions = members.filter((student) => !ids.has(student.id));
                return additions.length > 0 ? [...current, ...additions] : current;
            });
        }
    };

    const removeGroup = async (id: string) => {
        const group = groups.find((entry) => entry.id === id);
        setGroups((current) => current.filter((entry) => entry.id !== id));
        if (!group) return;

        let members = group.students;
        if (!members) {
            try {
                const response = await eden.groups({ id }).get();
                members = (response.data?.students ?? []).map((student) => ({
                    id: student.id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                }));
            } catch (error) {
                console.error("Failed to load group students:", error);
                members = [];
            }
        }

        const assignedIds = new Set(students.map((student) => student.id));
        const candidates = members.filter((member) => assignedIds.has(member.id));
        if (candidates.length === 0) return;

        setPendingRemoval({
            teacherName: `${form.firstName} ${form.lastName}`.trim(),
            students: candidates,
        });
        setRemoveOpen(true);
    };

    const addStudent = (item: EntityPickerItem) => {
        const student = studentResults.find((candidate) => candidate.id === item.id);
        if (!student) return;
        setStudents((current) => (current.some((entry) => entry.id === student.id) ? current : [...current, student]));
    };

    const removeStudent = (id: string) => setStudents((current) => current.filter((student) => student.id !== id));

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
                    color: form.color.trim() || null,
                    ...(showAssociations
                        ? {
                            groupIds: groups.map((group) => group.id),
                            studentIds: students.map((student) => student.id),
                        }
                        : {}),
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
                    color: form.color.trim() || null,
                    ...(showAssociations
                        ? {
                            groupIds: groups.map((group) => group.id),
                            studentIds: students.map((student) => student.id),
                        }
                        : {}),
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
        <>
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? "Modify user" : "Add user"}
            description={
                isEdit
                    ? "Update this account's details and access level."
                    : "Create a new account. A sample password will be generated and shown once the account is ready."
            }
            className={showAssociations ? "max-w-3xl" : "max-w-xl"}
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

                <div className="flex flex-col">
                    <span className="text-sm font-bold text-black">Color</span>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        {USER_COLORS.map((swatch) => {
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
                                value={form.color || "#f97316"}
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

                {showAssociations && (
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <EntityPicker
                            title="Groups"
                            selected={groups.map((group) => ({ id: group.id, label: groupLabel(group) }))}
                            results={groupCandidates.map((group) => ({ id: group.id, label: groupLabel(group) }))}
                            search={groupSearch}
                            onSearchChange={setGroupSearch}
                            onAdd={addGroup}
                            onRemove={removeGroup}
                            isSearching={isSearchingGroups}
                            placeholder="Search groups..."
                            emptyText={groupSearch.trim() ? "No matching groups." : "Type a name to search."}
                        />
                        <EntityPicker
                            title="Students"
                            selected={students.map((student) => ({ id: student.id, label: studentLabel(student) }))}
                            results={studentCandidates.map((student) => ({ id: student.id, label: studentLabel(student) }))}
                            search={studentSearch}
                            onSearchChange={setStudentSearch}
                            onAdd={addStudent}
                            onRemove={removeStudent}
                            isSearching={isSearchingStudents}
                            placeholder="Search students..."
                            emptyText={studentSearch.trim() ? "No matching students." : "Type a name to search."}
                        />
                    </div>
                )}

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

        <RemoveStudentsModal
            open={removeOpen}
            onOpenChange={setRemoveOpen}
            teacherName={pendingRemoval?.teacherName ?? "this teacher"}
            students={pendingRemoval?.students ?? []}
            onRemove={(selectedIds) => {
                const ids = new Set(selectedIds);
                setStudents((current) => current.filter((student) => !ids.has(student.id)));
                setPendingRemoval(null);
            }}
            onKeep={() => setPendingRemoval(null)}
        />
        </>
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
