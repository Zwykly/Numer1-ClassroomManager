import { useEffect, useState } from "react";
import { clsx as cn } from "clsx";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import { EntityPicker, type EntityPickerItem } from "./common/EntityPicker";
import { useAuth } from "@/utils/AuthProvider";
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

type Teacher = {
    id: string;
    firstName: string;
    lastName: string;
};

const inputClass =
    "mt-1 w-full rounded-xl border border-grey bg-white px-3 py-2 text-black placeholder:text-darker-grey focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30";

const personLabel = (person: { firstName: string; lastName: string }) =>
    `${person.firstName} ${person.lastName}`.trim();

const toItem = (person: { id: string; firstName: string; lastName: string }): EntityPickerItem => ({
    id: person.id,
    label: personLabel(person),
});

export function GroupFormModal({ open, onOpenChange, group, onCreate, onUpdate }: GroupFormModalProps) {
    const isEdit = Boolean(group);
    const { UserData } = useAuth();
    const isAdmin = UserData?.user?.userInfo?.role === "admin";

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [members, setMembers] = useState<Member[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [studentSearch, setStudentSearch] = useState("");
    const [studentResults, setStudentResults] = useState<Member[]>([]);
    const [isSearchingStudents, setIsSearchingStudents] = useState(false);

    const [teacherSearch, setTeacherSearch] = useState("");
    const [teacherResults, setTeacherResults] = useState<Teacher[]>([]);
    const [isSearchingTeachers, setIsSearchingTeachers] = useState(false);

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
        setTeachers(
            (group?.users ?? []).map((teacher) => ({
                id: teacher.id,
                firstName: teacher.firstName,
                lastName: teacher.lastName,
            })),
        );
        setStudentSearch("");
        setStudentResults([]);
        setTeacherSearch("");
        setTeacherResults([]);
        setError(null);
    }, [open, group]);

    useEffect(() => {
        if (!open) return;

        const query = studentSearch.trim();
        const timeout = setTimeout(async () => {
            setIsSearchingStudents(true);
            try {
                const response = await eden.students.get({
                    query: {
                        limit: 50,
                        ...(query ? { search: query } : {}),
                    },
                });
                setStudentResults(response.data?.data ?? []);
            } catch (err) {
                console.error("Failed to search students:", err);
                setStudentResults([]);
            } finally {
                setIsSearchingStudents(false);
            }
        }, 250);

        return () => clearTimeout(timeout);
    }, [open, studentSearch]);

    useEffect(() => {
        if (!open || !isAdmin) return;

        const query = teacherSearch.trim();
        const timeout = setTimeout(async () => {
            setIsSearchingTeachers(true);
            try {
                const response = await eden.users.get({
                    query: {
                        limit: 50,
                        role: "teacher",
                        ...(query ? { search: query } : {}),
                    },
                });
                setTeacherResults(
                    (response.data?.data ?? []).map((teacher) => ({
                        id: teacher.id,
                        firstName: teacher.firstName,
                        lastName: teacher.lastName,
                    })),
                );
            } catch (err) {
                console.error("Failed to search teachers:", err);
                setTeacherResults([]);
            } finally {
                setIsSearchingTeachers(false);
            }
        }, 250);

        return () => clearTimeout(timeout);
    }, [open, isAdmin, teacherSearch]);

    const memberIds = new Set(members.map((member) => member.id));
    const studentCandidates = studentResults.filter((student) => !memberIds.has(student.id));

    const teacherIds = new Set(teachers.map((teacher) => teacher.id));
    const teacherCandidates = teacherResults.filter((teacher) => !teacherIds.has(teacher.id));

    const addMember = (item: EntityPickerItem) => {
        const student = studentResults.find((candidate) => candidate.id === item.id);
        if (!student) return;
        setMembers((current) =>
            current.some((member) => member.id === student.id) ? current : [...current, student],
        );
    };

    const removeMember = (id: string) => {
        setMembers((current) => current.filter((member) => member.id !== id));
    };

    const addTeacher = (item: EntityPickerItem) => {
        const teacher = teacherResults.find((candidate) => candidate.id === item.id);
        if (!teacher) return;
        setTeachers((current) =>
            current.some((member) => member.id === teacher.id) ? current : [...current, teacher],
        );
    };

    const removeTeacher = (id: string) => {
        setTeachers((current) => current.filter((teacher) => teacher.id !== id));
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
                ...(isAdmin ? { teacherIds: teachers.map((teacher) => teacher.id) } : {}),
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

                <div className="flex flex-col gap-5 sm:flex-row">
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

                    <div className="flex w-full flex-col gap-4 sm:w-80">
                        <EntityPicker
                            title="Students"
                            selected={members.map(toItem)}
                            results={studentCandidates.map(toItem)}
                            search={studentSearch}
                            onSearchChange={setStudentSearch}
                            onAdd={addMember}
                            onRemove={removeMember}
                            isSearching={isSearchingStudents}
                            placeholder="Search students by name..."
                            emptyText={studentSearch.trim() ? "No matching students." : "Type a name to search."}
                        />

                        {isAdmin && (
                            <EntityPicker
                                title="Teachers"
                                selected={teachers.map(toItem)}
                                results={teacherCandidates.map(toItem)}
                                search={teacherSearch}
                                onSearchChange={setTeacherSearch}
                                onAdd={addTeacher}
                                onRemove={removeTeacher}
                                isSearching={isSearchingTeachers}
                                placeholder="Search teachers by name..."
                                emptyText={teacherSearch.trim() ? "No matching teachers." : "Type a name to search."}
                            />
                        )}
                    </div>
                </div>

                <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" className="w-full border border-grey sm:w-auto" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" className="w-full sm:w-auto" onClick={handleSubmit} disabled={!canSubmit}>
                        {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create group"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
