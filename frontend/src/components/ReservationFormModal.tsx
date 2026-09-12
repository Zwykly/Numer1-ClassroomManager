import { useEffect, useMemo, useState } from "react";
import { clsx as cn } from "clsx";
import { Search, X } from "lucide-react";
import { format } from "date-fns";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import { useStudents, useStudentsActions } from "@/stores/useStudentsStore";
import { useGroups, useGroupsActions } from "@/stores/useGroupsStore";
import type { Reservation, NewReservation, NewRecurringReservation, ReservationPatch } from "@/stores/useReservationsStore";
import eden from "@/lib/eden";

type ReservationFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservation?: Reservation | null;
    currentUserId?: string;
    isAdmin: boolean;
    onCreate: (data: NewReservation) => Promise<void>;
    onCreateRecurring: (data: NewRecurringReservation) => Promise<void>;
    onUpdate: (id: string, data: ReservationPatch) => Promise<void>;
};

type ClassroomOption = { id: string; name: string };
type OnlineClassroomOption = { id: string; name: string };
type TeacherOption = { id: string; firstName: string; lastName: string; role?: string | null };

type Form = {
    name: string;
    teacherId: string;
    roomType: "classroom" | "online";
    classroomId: string;
    onlineClassroomId: string;
    reservationTime: string;
    durationMinutes: string;
    isRecurring: boolean;
    frequency: string;
    endMode: "occurrences" | "endDate";
    numberOfOccurrences: string;
    cycleEndDate: string;
    status: string;
    additionalInfo: string;
    studentIds: string[];
    groupIds: string[];
};

const inputClass =
    "mt-1 w-full rounded-xl border border-grey bg-white px-3 py-2 text-black placeholder:text-darker-grey/60 focus:border-orange focus:outline-none";

const STATUS_OPTIONS = ["scheduled", "ongoing", "cyclical", "completed", "canceled"] as const;

const DURATION_OPTIONS = [30, 45, 60, 75, 90, 120, 150, 180, 240];

function toDateInput(value: string | Date) {
    try {
        return format(new Date(value), "yyyy-MM-dd'T'HH:mm");
    } catch {
        return "";
    }
}

function emptyForm(currentUserId?: string): Form {
    return {
        name: "",
        teacherId: currentUserId ?? "",
        roomType: "classroom",
        classroomId: "",
        onlineClassroomId: "",
        reservationTime: toDateInput(new Date()),
        durationMinutes: "60",
        isRecurring: false,
        frequency: "7",
        endMode: "occurrences",
        numberOfOccurrences: "10",
        cycleEndDate: "",
        status: "scheduled",
        additionalInfo: "",
        studentIds: [],
        groupIds: [],
    };
}

export function ReservationFormModal({
    open,
    onOpenChange,
    reservation,
    currentUserId,
    isAdmin,
    onCreate,
    onCreateRecurring,
    onUpdate,
}: ReservationFormModalProps) {
    const isEdit = Boolean(reservation);
    const students = useStudents();
    const { fetchStudents } = useStudentsActions();
    const groups = useGroups();
    const { fetchGroups } = useGroupsActions();

    const [form, setForm] = useState<Form>(emptyForm(currentUserId));
    const [classrooms, setClassrooms] = useState<ClassroomOption[]>([]);
    const [onlineClassrooms, setOnlineClassrooms] = useState<OnlineClassroomOption[]>([]);
    const [teachers, setTeachers] = useState<TeacherOption[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const durationOptions = useMemo(() => {
        const options = new Set(DURATION_OPTIONS);
        const current = Number(form.durationMinutes);
        if (current > 0) options.add(current);
        return [...options].sort((a, b) => a - b);
    }, [form.durationMinutes]);

    useEffect(() => {
        if (!open) return;

        fetchStudents();
        fetchGroups();

        eden.classrooms.get({ query: { limit: 100 } }).then((response) => {
            setClassrooms(response.data?.data ?? []);
        }).catch((error) => console.error("Failed to fetch classrooms:", error));

        eden["online-classrooms"].get({ query: { limit: 100 } }).then((response) => {
            setOnlineClassrooms(response.data?.data ?? []);
        }).catch((error) => console.error("Failed to fetch online classrooms:", error));

        if (isAdmin) {
            eden.users.get({ query: { limit: 100 } }).then((response) => {
                setTeachers(response.data?.data ?? []);
            }).catch((error) => console.error("Failed to fetch teachers:", error));
        }

        if (reservation) {
            setForm({
                name: reservation.name ?? "",
                teacherId: reservation.teacherId ?? currentUserId ?? "",
                roomType: reservation.onlineClassroomId ? "online" : "classroom",
                classroomId: reservation.classroomId ?? "",
                onlineClassroomId: reservation.onlineClassroomId ?? "",
                reservationTime: toDateInput(reservation.reservationTime),
                durationMinutes: reservation.durationMinutes ? String(reservation.durationMinutes) : "60",
                isRecurring: Boolean(reservation.cycleId),
                frequency: "7",
                endMode: "occurrences",
                numberOfOccurrences: "10",
                cycleEndDate: "",
                status: reservation.status ?? "scheduled",
                additionalInfo: reservation.additionalInfo ?? "",
                studentIds: reservation.students?.map((student) => student.id) ?? [],
                groupIds: reservation.groups?.map((group) => group.id) ?? [],
            });
        } else {
            setForm(emptyForm(currentUserId));
        }
    }, [open, reservation, isAdmin, currentUserId]);

    const setField = <K extends keyof Form>(field: K, value: Form[K]) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const toggleId = (field: "studentIds" | "groupIds", id: string) => {
        setForm((current) => ({
            ...current,
            [field]: current[field].includes(id)
                ? current[field].filter((value) => value !== id)
                : [...current[field], id],
        }));
    };

    const validTime = Boolean(form.reservationTime) && !Number.isNaN(new Date(form.reservationTime).getTime());
    const validRoom = form.roomType === "classroom" ? Boolean(form.classroomId) : Boolean(form.onlineClassroomId);
    const validRecurring = !form.isRecurring
        || (Number(form.frequency) >= 1
            && (form.endMode === "occurrences"
                ? Number(form.numberOfOccurrences) >= 1
                : Boolean(form.cycleEndDate)));

    const isValid =
        form.name.trim().length > 0
        && validTime
        && validRoom
        && Boolean(form.teacherId)
        && validRecurring
        && !isSubmitting;

    const handleSubmit = async () => {
        if (!isValid) return;
        setIsSubmitting(true);
        try {
            if (isEdit && reservation) {
                const patch: ReservationPatch = {
                    name: form.name.trim(),
                    teacherId: isAdmin ? form.teacherId : undefined,
                    classroomId: form.roomType === "classroom" ? form.classroomId : null,
                    onlineClassroomId: form.roomType === "online" ? form.onlineClassroomId : null,
                    reservationTime: new Date(form.reservationTime),
                    durationMinutes: Number(form.durationMinutes) || null,
                    additionalInfo: form.additionalInfo.trim() || null,
                    status: form.status as ReservationPatch["status"],
                    studentIds: form.studentIds,
                    groupIds: form.groupIds,
                };
                await onUpdate(reservation.id, patch);
            } else if (form.isRecurring) {
                const payload: NewRecurringReservation = {
                    name: form.name.trim(),
                    teacherId: form.teacherId,
                    classroomId: form.roomType === "classroom" ? form.classroomId : undefined,
                    onlineClassroomId: form.roomType === "online" ? form.onlineClassroomId : undefined,
                    additionalInfo: form.additionalInfo.trim() || null,
                    anchorDate: new Date(form.reservationTime).toISOString(),
                    durationMinutes: Number(form.durationMinutes) || undefined,
                    frequency: Number(form.frequency),
                    ...(form.endMode === "occurrences"
                        ? { numberOfOccurrences: Number(form.numberOfOccurrences) }
                        : { cycleEndDate: new Date(form.cycleEndDate).toISOString() }),
                    studentIds: form.studentIds,
                    groupIds: form.groupIds,
                };
                await onCreateRecurring(payload);
            } else {
                const payload: NewReservation = {
                    name: form.name.trim(),
                    teacherId: form.teacherId,
                    classroomId: form.roomType === "classroom" ? form.classroomId : null,
                    onlineClassroomId: form.roomType === "online" ? form.onlineClassroomId : null,
                    reservationTime: new Date(form.reservationTime),
                    durationMinutes: Number(form.durationMinutes) || null,
                    additionalInfo: form.additionalInfo.trim() || null,
                    status: "scheduled",
                    studentIds: form.studentIds,
                    groupIds: form.groupIds,
                };
                await onCreate(payload);
            }
            onOpenChange(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? "Modify class" : "Reserve a class"}
            description={
                isEdit
                    ? "Update the details of this class."
                    : "Fill in the details to reserve a classroom or an online classroom."
            }
            className="max-w-3xl"
        >
            <div className="flex flex-col gap-4">
                <div className="h-1 w-full rounded-full bg-orange" />

                <label className="flex flex-col">
                    <span className="text-sm font-bold text-black">Class name</span>
                    <input
                        value={form.name}
                        onChange={(event) => setField("name", event.target.value)}
                        placeholder="eg. Algebra basics"
                        className={inputClass}
                    />
                </label>

                <div className="flex flex-row gap-3">
                    {isAdmin && (
                        <label className="flex flex-1 flex-col">
                            <span className="text-sm font-bold text-black">Teacher</span>
                            <select
                                value={form.teacherId}
                                onChange={(event) => setField("teacherId", event.target.value)}
                                className={inputClass}
                            >
                                <option value="">Select a teacher...</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.firstName} {teacher.lastName}
                                        {teacher.role === "admin" ? " (admin)" : ""}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

                    <div className="flex flex-1 flex-col">
                        <span className="text-sm font-bold text-black">Room type</span>
                        <div className="mt-1 flex flex-row gap-2">
                            {(["classroom", "online"] as const).map((roomType) => (
                                <button
                                    key={roomType}
                                    type="button"
                                    onClick={() => setField("roomType", roomType)}
                                    className={cn(
                                        "flex-1 rounded-xl border px-4 py-2 text-sm font-bold capitalize transition",
                                        form.roomType === roomType
                                            ? "border-orange bg-orange/10 text-orange"
                                            : "border-grey bg-white text-darker-grey hover:border-dark-grey",
                                    )}
                                >
                                    {roomType}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-row gap-3">
                    <label className="flex flex-1 flex-col">
                        <span className="text-sm font-bold text-black">
                            {form.roomType === "classroom" ? "Classroom" : "Online classroom"}
                        </span>
                        {form.roomType === "classroom" ? (
                            <select
                                value={form.classroomId}
                                onChange={(event) => setField("classroomId", event.target.value)}
                                className={inputClass}
                            >
                                <option value="">Select a classroom...</option>
                                {classrooms.map((classroom) => (
                                    <option key={classroom.id} value={classroom.id}>
                                        {classroom.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <select
                                value={form.onlineClassroomId}
                                onChange={(event) => setField("onlineClassroomId", event.target.value)}
                                className={inputClass}
                            >
                                <option value="">Select an online classroom...</option>
                                {onlineClassrooms.map((classroom) => (
                                    <option key={classroom.id} value={classroom.id}>
                                        {classroom.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </label>

                    <label className="flex flex-1 flex-col">
                        <span className="text-sm font-bold text-black">
                            {form.isRecurring ? "First occurrence" : "Date & time"}
                        </span>
                        <input
                            type="datetime-local"
                            value={form.reservationTime}
                            onChange={(event) => setField("reservationTime", event.target.value)}
                            className={inputClass}
                        />
                    </label>

                    <label className="flex flex-1 flex-col">
                        <span className="text-sm font-bold text-black">Duration</span>
                        <select
                            value={form.durationMinutes}
                            onChange={(event) => setField("durationMinutes", event.target.value)}
                            className={inputClass}
                        >
                            {durationOptions.map((minutes) => (
                                <option key={minutes} value={String(minutes)}>
                                    {minutes} minutes
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {isEdit ? (
                    <label className="flex flex-col">
                        <span className="text-sm font-bold text-black">Status</span>
                        <select
                            value={form.status}
                            onChange={(event) => setField("status", event.target.value)}
                            className={inputClass}
                        >
                            {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </label>
                ) : (
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-black">Recurring class</span>
                        <div className="mt-1 flex flex-row gap-2">
                            {[
                                { value: false, label: "One-off" },
                                { value: true, label: "Recurring" },
                            ].map((option) => (
                                <button
                                    key={option.label}
                                    type="button"
                                    onClick={() => setField("isRecurring", option.value)}
                                    className={cn(
                                        "flex-1 rounded-xl border px-4 py-2 text-sm font-bold transition",
                                        form.isRecurring === option.value
                                            ? "border-orange bg-orange/10 text-orange"
                                            : "border-grey bg-white text-darker-grey hover:border-dark-grey",
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {form.isRecurring && !isEdit && (
                    <div className="flex flex-row gap-3">
                        <label className="flex flex-1 flex-col">
                            <span className="text-sm font-bold text-black">Repeats every (days)</span>
                            <input
                                type="number"
                                min={1}
                                value={form.frequency}
                                onChange={(event) => setField("frequency", event.target.value)}
                                className={inputClass}
                            />
                        </label>
                        <label className="flex flex-1 flex-col">
                            <span className="text-sm font-bold text-black">Ends</span>
                            <select
                                value={form.endMode}
                                onChange={(event) => setField("endMode", event.target.value as Form["endMode"])}
                                className={inputClass}
                            >
                                <option value="occurrences">After number of classes</option>
                                <option value="endDate">On a date</option>
                            </select>
                        </label>
                        {form.endMode === "occurrences" ? (
                            <label className="flex flex-1 flex-col">
                                <span className="text-sm font-bold text-black">Occurrences</span>
                                <input
                                    type="number"
                                    min={1}
                                    value={form.numberOfOccurrences}
                                    onChange={(event) => setField("numberOfOccurrences", event.target.value)}
                                    className={inputClass}
                                />
                            </label>
                        ) : (
                            <label className="flex flex-1 flex-col">
                                <span className="text-sm font-bold text-black">End date</span>
                                <input
                                    type="datetime-local"
                                    value={form.cycleEndDate}
                                    onChange={(event) => setField("cycleEndDate", event.target.value)}
                                    className={inputClass}
                                />
                            </label>
                        )}
                    </div>
                )}

                <div className="flex flex-col">
                    <span className="text-sm font-bold text-black">Additional info</span>
                    <textarea
                        value={form.additionalInfo}
                        onChange={(event) => setField("additionalInfo", event.target.value)}
                        placeholder="Notes, equipment, etc."
                        rows={2}
                        className={cn(inputClass, "resize-none")}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <MultiSelect
                        label={`Students (${form.studentIds.length})`}
                        placeholder="Search students..."
                        items={students.map((student) => ({ id: student.id, name: `${student.firstName} ${student.lastName}` }))}
                        selected={form.studentIds}
                        onToggle={(id) => toggleId("studentIds", id)}
                    />
                    <MultiSelect
                        label={`Groups (${form.groupIds.length})`}
                        placeholder="Search groups..."
                        items={groups.map((group) => ({ id: group.id, name: group.name }))}
                        selected={form.groupIds}
                        onToggle={(id) => toggleId("groupIds", id)}
                    />
                </div>

                <div className="mt-1 flex justify-end gap-2">
                    <Button variant="secondary" className="border border-grey" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
                        {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Reserve class"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

type MultiSelectProps = {
    label: string;
    placeholder: string;
    items: { id: string; name: string }[];
    selected: string[];
    onToggle: (id: string) => void;
};

function MultiSelect({ label, placeholder, items, selected, onToggle }: MultiSelectProps) {
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return items;
        return items.filter((item) => item.name.toLowerCase().includes(query));
    }, [items, search]);

    return (
        <div className="flex flex-col">
            <span className="text-sm font-bold text-black">{label}</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-grey bg-white px-3 py-2 focus-within:border-orange">
                <Search size={16} className="text-darker-grey" />
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-black placeholder:text-darker-grey/60 focus:outline-none"
                />
            </div>
            <div className="mt-2 flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-xl border border-light-grey p-2">
                {filtered.length === 0 && (
                    <span className="py-3 text-center text-sm text-darker-grey">Nothing found.</span>
                )}
                {filtered.map((item) => {
                    const isSelected = selected.includes(item.id);
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onToggle(item.id)}
                            className={cn(
                                "flex items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition",
                                isSelected ? "bg-orange/10 text-orange" : "text-black/80 hover:bg-light-grey/60",
                            )}
                        >
                            <span className="truncate">{item.name}</span>
                            {isSelected && <X size={14} />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
