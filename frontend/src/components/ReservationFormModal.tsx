import { useEffect, useMemo, useState } from "react";
import { clsx as cn } from "clsx";
import { AlertTriangle, Search, X } from "lucide-react";
import { format } from "date-fns";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import { useStudents, useStudentsActions } from "@/stores/useStudentsStore";
import { useGroups, useGroupsActions } from "@/stores/useGroupsStore";
import {
    useReservationsActions,
    type Reservation,
    type NewReservation,
    type NewRecurringReservation,
    type ReservationPatch,
    type ConflictCheck,
    type ConflictResult,
} from "@/stores/useReservationsStore";
import { useAuth } from "@/utils/AuthProvider";
import { classroomColor } from "@/utils/classroomColors";
import { userColor } from "@/utils/userColors";
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
    onUpdateFuture: (id: string, data: ReservationPatch) => Promise<void>;
};

type ClassroomOption = { id: string; name: string; color?: string | null };
type OnlineClassroomOption = { id: string; name: string; teacher?: { color?: string | null } | null };
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
    "mt-1 w-full rounded-xl border border-grey bg-white px-3 py-2 text-black placeholder:text-darker-grey focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30";

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

type ConflictItem = ConflictResult["conflicts"][number]["items"][number];

function formatConflictSpan(item: ConflictItem) {
    const start = new Date(item.reservationTime);
    if (!item.durationMinutes) return format(start, "dd MMM, HH:mm");
    const end = new Date(start.getTime() + item.durationMinutes * 60_000);
    return `${format(start, "dd MMM, HH:mm")}–${format(end, "HH:mm")}`;
}

function conflictItemMessage(item: ConflictItem) {
    if (item.restricted) {
        return "This time slot is already reserved.";
    }
    const span = formatConflictSpan(item);
    if (item.type === "room") {
        return `Room "${item.roomName ?? "selected room"}" is already booked ${span}${item.name ? ` (${item.name})` : ""}.`;
    }
    return `Teacher ${item.teacherName ?? ""} is already teaching ${span}${item.name ? ` (${item.name})` : ""}.`;
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
    onUpdateFuture,
}: ReservationFormModalProps) {
    const isEdit = Boolean(reservation);
    const isRecurringEdit = isEdit && Boolean(reservation?.cycleId);
    const students = useStudents();
    const { fetchStudents } = useStudentsActions();
    const groups = useGroups();
    const { fetchGroups } = useGroupsActions();
    const { checkConflicts, checkFutureConflicts } = useReservationsActions();
    const { UserData } = useAuth();
    const ownOnlineClassroom = UserData?.user?.userInfo?.onlineClassroom ?? null;

    const [form, setForm] = useState<Form>(emptyForm(currentUserId));
    const [classrooms, setClassrooms] = useState<ClassroomOption[]>([]);
    const [onlineClassrooms, setOnlineClassrooms] = useState<OnlineClassroomOption[]>([]);
    const [teachers, setTeachers] = useState<TeacherOption[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [conflicts, setConflicts] = useState<ConflictResult | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [scope, setScope] = useState<"single" | "future">("single");
    const [futureConflicts, setFutureConflicts] = useState<ConflictResult | null>(null);
    const [isCheckingFuture, setIsCheckingFuture] = useState(false);
    const [overrides, setOverrides] = useState<{ index: number; reservationTime: string }[]>([]);

    // The server already scopes the fetched list to the teacher's own classroom.
    const teacherOnlineClassroomId = ownOnlineClassroom?.id ?? onlineClassrooms[0]?.id;

    const durationOptions = useMemo(() => {
        const options = new Set(DURATION_OPTIONS);
        const current = Number(form.durationMinutes);
        if (current > 0) options.add(current);
        return [...options].sort((a, b) => a - b);
    }, [form.durationMinutes]);

    useEffect(() => {
        if (!open) return;

        setError(null);
        setConflicts(null);
        setOverrides([]);
        setScope("single");
        setFutureConflicts(null);
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

    const applyOverride = (index: number, reservationTime: string) => {
        setOverrides((current) => [
            ...current.filter((override) => override.index !== index),
            { index, reservationTime },
        ]);
    };

    const applySeriesSuggestion = (anchor: string) => {
        setField("reservationTime", toDateInput(anchor));
        setOverrides([]);
    };

    const buildEditPatch = (): ReservationPatch => ({
        name: form.name.trim() || null,
        teacherId: isAdmin ? form.teacherId : undefined,
        classroomId: form.roomType === "classroom" ? form.classroomId : null,
        onlineClassroomId: form.roomType === "online"
            ? (isAdmin ? form.onlineClassroomId : teacherOnlineClassroomId ?? null)
            : null,
        reservationTime: new Date(form.reservationTime),
        durationMinutes: Number(form.durationMinutes) || null,
        additionalInfo: form.additionalInfo.trim() || null,
        status: form.status as ReservationPatch["status"],
        studentIds: form.studentIds,
        groupIds: form.groupIds,
    });

    useEffect(() => {
        if (!open) return;
        if (isRecurringEdit && scope === "future") {
            setConflicts(null);
            return;
        }

        const classroomId = form.roomType === "classroom" ? form.classroomId : "";
        const onlineClassroomId = form.roomType === "online" ? form.onlineClassroomId : "";
        const validRoom = form.roomType === "classroom" ? classroomId : onlineClassroomId;
        const validTime = form.reservationTime && !Number.isNaN(new Date(form.reservationTime).getTime());
        const validRecurrence = !form.isRecurring
            || (Number(form.frequency) >= 1
                && (form.endMode === "occurrences"
                    ? Number(form.numberOfOccurrences) >= 1
                    : Boolean(form.cycleEndDate)));

        if (!form.teacherId || !validTime || !validRoom || !validRecurrence) {
            setConflicts(null);
            return;
        }

        const timeout = setTimeout(async () => {
            setIsChecking(true);
            try {
                const input: ConflictCheck = {
                    teacherId: form.teacherId,
                    classroomId: classroomId || null,
                    onlineClassroomId: onlineClassroomId || null,
                    durationMinutes: Number(form.durationMinutes) || null,
                    ...(isEdit && reservation ? { excludeId: reservation.id } : {}),
                };

                if (!isEdit && form.isRecurring) {
                    input.recurrence = {
                        anchorDate: new Date(form.reservationTime).toISOString(),
                        frequency: Number(form.frequency) || 1,
                        ...(form.endMode === "occurrences"
                            ? { numberOfOccurrences: Number(form.numberOfOccurrences) || 1 }
                            : {
                                cycleEndDate: form.cycleEndDate
                                    ? new Date(form.cycleEndDate).toISOString()
                                    : undefined,
                            }),
                        overrides,
                    };
                } else {
                    input.reservationTime = new Date(form.reservationTime).toISOString();
                }

                const result = await checkConflicts(input);
                setConflicts(result);
            } catch (err) {
                console.error("Failed to check conflicts:", err);
                setConflicts(null);
            } finally {
                setIsChecking(false);
            }
        }, 400);

        return () => clearTimeout(timeout);
    }, [
        open,
        isEdit,
        reservation,
        scope,
        isRecurringEdit,
        form.teacherId,
        form.roomType,
        form.classroomId,
        form.onlineClassroomId,
        form.reservationTime,
        form.durationMinutes,
        form.isRecurring,
        form.frequency,
        form.endMode,
        form.numberOfOccurrences,
        form.cycleEndDate,
        overrides,
    ]);

    useEffect(() => {
        if (!open || !isRecurringEdit || scope !== "future" || !reservation) {
            setFutureConflicts(null);
            return;
        }

        const validRoom = form.roomType === "classroom" ? form.classroomId : form.onlineClassroomId;
        const validTime = form.reservationTime && !Number.isNaN(new Date(form.reservationTime).getTime());
        if (!form.teacherId || !validTime || !validRoom) {
            setFutureConflicts(null);
            return;
        }

        const timeout = setTimeout(async () => {
            setIsCheckingFuture(true);
            try {
                const result = await checkFutureConflicts(reservation.id, buildEditPatch());
                setFutureConflicts(result);
            } catch (err) {
                console.error("Failed to check future conflicts:", err);
                setFutureConflicts(null);
            } finally {
                setIsCheckingFuture(false);
            }
        }, 400);

        return () => clearTimeout(timeout);
    }, [
        open,
        isRecurringEdit,
        scope,
        reservation,
        form.teacherId,
        form.roomType,
        form.classroomId,
        form.onlineClassroomId,
        form.reservationTime,
        form.durationMinutes,
        form.status,
        form.name,
        form.additionalInfo,
        form.studentIds,
        form.groupIds,
    ]);

    const setField = <K extends keyof Form>(field: K, value: Form[K]) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    // Teachers can only host online classes in their own online classroom.
    const onlineClassroomOptions = useMemo<OnlineClassroomOption[]>(() => {
        if (!isAdmin) {
            if (ownOnlineClassroom) return [{ id: ownOnlineClassroom.id, name: ownOnlineClassroom.name }];
            return onlineClassrooms;
        }
        return onlineClassrooms;
    }, [isAdmin, ownOnlineClassroom, onlineClassrooms]);

    const selectRoomType = (roomType: Form["roomType"]) => {
        setForm((current) => {
            if (roomType === "online" && !isAdmin && teacherOnlineClassroomId) {
                return { ...current, roomType, onlineClassroomId: teacherOnlineClassroomId };
            }
            return { ...current, roomType };
        });
    };

    // A teacher always hosts online classes in their own online classroom. The
    // classroom list may still be loading when they pick "online", so resolve it
    // as soon as it becomes available.
    useEffect(() => {
        if (!open || isAdmin || form.roomType !== "online") return;
        const resolvedId = ownOnlineClassroom?.id ?? onlineClassrooms[0]?.id;
        if (resolvedId && form.onlineClassroomId !== resolvedId) {
            setForm((current) => ({ ...current, onlineClassroomId: resolvedId }));
        }
    }, [open, isAdmin, form.roomType, form.onlineClassroomId, ownOnlineClassroom?.id, onlineClassrooms]);

    const toggleId = (field: "studentIds" | "groupIds", id: string) => {
        setForm((current) => ({
            ...current,
            [field]: current[field].includes(id)
                ? current[field].filter((value) => value !== id)
                : [...current[field], id],
        }));
    };

    // Students that are already covered by one of the selected groups.
    const groupStudentIds = useMemo(() => {
        const ids = new Set<string>();
        for (const groupId of form.groupIds) {
            const group = groups.find((item) => item.id === groupId);
            for (const student of group?.students ?? []) ids.add(student.id);
        }
        return ids;
    }, [groups, form.groupIds]);

    // Adding a group replaces any of its members that were picked individually.
    const toggleGroup = (id: string) => {
        setForm((current) => {
            if (current.groupIds.includes(id)) {
                return { ...current, groupIds: current.groupIds.filter((value) => value !== id) };
            }

            const group = groups.find((item) => item.id === id);
            const memberIds = new Set((group?.students ?? []).map((student) => student.id));
            return {
                ...current,
                groupIds: [...current.groupIds, id],
                studentIds: current.studentIds.filter((studentId) => !memberIds.has(studentId)),
            };
        });
    };

    const validTime = Boolean(form.reservationTime) && !Number.isNaN(new Date(form.reservationTime).getTime());
    const validRoom = form.roomType === "classroom" ? Boolean(form.classroomId) : Boolean(form.onlineClassroomId);
    const validRecurring = !form.isRecurring
        || (Number(form.frequency) >= 1
            && (form.endMode === "occurrences"
                ? Number(form.numberOfOccurrences) >= 1
                : Boolean(form.cycleEndDate)));

    const activeConflicts = scope === "future" ? futureConflicts : conflicts;
    const activeChecking = scope === "future" ? isCheckingFuture : isChecking;
    const hasConflicts = (activeConflicts?.conflicts.length ?? 0) > 0;

    const isValid =
        validTime
        && validRoom
        && Boolean(form.teacherId)
        && validRecurring
        && !hasConflicts
        && !activeChecking
        && !isSubmitting;

    const handleSubmit = async () => {
        if (!isValid) return;
        setIsSubmitting(true);
        setError(null);
        try {
            if (isEdit && reservation) {
                const patch = buildEditPatch();
                if (isRecurringEdit && scope === "future") {
                    await onUpdateFuture(reservation.id, patch);
                } else {
                    await onUpdate(reservation.id, patch);
                }
            } else if (form.isRecurring) {
                const payload: NewRecurringReservation = {
                    name: form.name.trim() || "",
                    teacherId: form.teacherId,
                    classroomId: form.roomType === "classroom" ? form.classroomId : undefined,
                    onlineClassroomId: form.roomType === "online"
                        ? (isAdmin ? form.onlineClassroomId : teacherOnlineClassroomId)
                        : undefined,
                    additionalInfo: form.additionalInfo.trim() || null,
                    anchorDate: new Date(form.reservationTime).toISOString(),
                    durationMinutes: Number(form.durationMinutes) || undefined,
                    frequency: Number(form.frequency),
                    ...(form.endMode === "occurrences"
                        ? { numberOfOccurrences: Number(form.numberOfOccurrences) }
                        : { cycleEndDate: new Date(form.cycleEndDate).toISOString() }),
                    occurrenceOverrides: overrides,
                    studentIds: form.studentIds,
                    groupIds: form.groupIds,
                };
                await onCreateRecurring(payload);
            } else {
                const payload: NewReservation = {
                    name: form.name.trim() || null,
                    teacherId: form.teacherId,
                    classroomId: form.roomType === "classroom" ? form.classroomId : null,
                    onlineClassroomId: form.roomType === "online"
                        ? (isAdmin ? form.onlineClassroomId : teacherOnlineClassroomId ?? null)
                        : null,
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

                <div className="flex flex-col gap-3 sm:flex-row">
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
                                    onClick={() => selectRoomType(roomType)}
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

                <div className="flex flex-col gap-3 sm:flex-row">
                    <label className="flex flex-1 flex-col">
                        <span className="inline-flex items-center gap-2 text-sm font-bold text-black">
                            {form.roomType === "classroom" ? "Classroom" : "Online classroom"}
                            {form.roomType === "classroom" && form.classroomId && (
                                <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{
                                        backgroundColor: classroomColor(
                                            classrooms.find((classroom) => classroom.id === form.classroomId)?.color,
                                            form.classroomId,
                                        ),
                                    }}
                                />
                            )}
                            {form.roomType === "online" && form.onlineClassroomId && (
                                <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{
                                        backgroundColor: userColor(
                                            onlineClassrooms.find((classroom) => classroom.id === form.onlineClassroomId)?.teacher?.color,
                                        ),
                                    }}
                                />
                            )}
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
                                disabled={!isAdmin}
                                className={cn(inputClass, !isAdmin && "cursor-not-allowed bg-light-grey text-darker-grey")}
                            >
                                <option value="">Select an online classroom...</option>
                                {onlineClassroomOptions.map((classroom) => (
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

                {isRecurringEdit && (
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-black">Apply changes to</span>
                        <div className="mt-1 flex flex-row gap-2">
                            {([
                                { value: "single", label: "This occurrence" },
                                { value: "future", label: "This and all future" },
                            ] as const).map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setScope(option.value)}
                                    className={cn(
                                        "flex-1 rounded-xl border px-4 py-2 text-sm font-bold transition",
                                        scope === option.value
                                            ? "border-orange bg-orange/10 text-orange"
                                            : "border-grey bg-white text-darker-grey hover:border-dark-grey",
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        {scope === "future" && (
                            <span className="mt-1.5 text-xs text-darker-grey">
                                The same changes will be applied to this class and every following one.
                            </span>
                        )}
                    </div>
                )}

                {form.isRecurring && !isEdit && (
                    <div className="flex flex-col gap-3 sm:flex-row">
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

                {hasConflicts && activeConflicts && (
                    <div className="rounded-xl border border-red-300 bg-red-500/10 p-4">
                        <div className="flex items-center gap-2 text-red-700">
                            <AlertTriangle size={18} />
                            <span className="text-sm font-bold">
                                {scope === "future"
                                    ? "These changes conflict with future classes"
                                    : activeConflicts.allConflicted
                                        ? "Every class in this series conflicts"
                                        : "Scheduling conflict detected"}
                            </span>
                        </div>

                        {!isEdit && form.isRecurring ? (
                            <div className="mt-3 flex flex-col gap-3">
                                {activeConflicts.allConflicted && activeConflicts.suggestedAnchor && (
                                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/70 px-3 py-2">
                                        <span className="text-sm text-red-800">
                                            Suggested series time:{" "}
                                            <strong>{format(new Date(activeConflicts.suggestedAnchor), "dd MMM yyyy, HH:mm")}</strong>
                                        </span>
                                        <Button
                                            variant="secondary"
                                            className="border border-grey px-3 py-1 text-xs"
                                            onClick={() => applySeriesSuggestion(activeConflicts.suggestedAnchor!)}
                                        >
                                            Apply to series
                                        </Button>
                                    </div>
                                )}

                                {activeConflicts.conflicts.map((entry) => {
                                    const override = overrides.find((value) => value.index === entry.index);
                                    const currentValue = override?.reservationTime ?? entry.suggestion ?? entry.reservationTime;
                                    return (
                                        <div key={entry.index} className="rounded-lg bg-white/70 px-3 py-2">
                                            <div className="text-xs font-bold uppercase tracking-wide text-red-700">
                                                {format(new Date(entry.reservationTime), "dd MMM yyyy, HH:mm")}
                                            </div>
                                            <ul className="mt-1 list-disc pl-4 text-sm text-red-800">
                                                {entry.items.map((item, index) => (
                                                    <li key={index}>{conflictItemMessage(item)}</li>
                                                ))}
                                            </ul>
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                {entry.suggestion && (
                                                    <Button
                                                        variant="secondary"
                                                        className="border border-grey px-3 py-1 text-xs"
                                                        onClick={() => applyOverride(entry.index, entry.suggestion!)}
                                                    >
                                                        Use suggestion: {format(new Date(entry.suggestion), "dd MMM HH:mm")}
                                                    </Button>
                                                )}
                                                <input
                                                    type="datetime-local"
                                                    value={toDateInput(currentValue)}
                                                    onChange={(event) => {
                                                        if (!event.target.value) return;
                                                        applyOverride(entry.index, new Date(event.target.value).toISOString());
                                                    }}
                                                    className="rounded-lg border border-grey bg-white px-2 py-1 text-xs text-black focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mt-3 flex flex-col gap-2">
                                {activeConflicts.conflicts.map((entry) => (
                                    <div key={entry.index} className="rounded-lg bg-white/70 px-3 py-2">
                                        {scope === "future" && (
                                            <div className="text-xs font-bold uppercase tracking-wide text-red-700">
                                                {format(new Date(entry.reservationTime), "dd MMM yyyy, HH:mm")}
                                            </div>
                                        )}
                                        <ul className="list-disc pl-4 text-sm text-red-800">
                                            {entry.items.map((item, index) => (
                                                <li key={index}>{conflictItemMessage(item)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="mt-2 text-xs text-red-700">Resolve the conflicts before saving.</p>
                    </div>
                )}

                {activeChecking && !hasConflicts && (
                    <p className="text-xs text-darker-grey">Checking availability...</p>
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
                        disabledIds={groupStudentIds}
                        onToggle={(id) => toggleId("studentIds", id)}
                    />
                    <MultiSelect
                        label={`Groups (${form.groupIds.length})`}
                        placeholder="Search groups..."
                        items={groups.map((group) => ({ id: group.id, name: group.name }))}
                        selected={form.groupIds}
                        onToggle={toggleGroup}
                    />
                </div>

                {error && (
                    <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
                )}

                <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" className="w-full border border-grey sm:w-auto" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" className="w-full sm:w-auto" onClick={handleSubmit} disabled={!isValid}>
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
    disabledIds?: Set<string>;
    onToggle: (id: string) => void;
};

function MultiSelect({ label, placeholder, items, selected, disabledIds, onToggle }: MultiSelectProps) {
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
                    className="w-full bg-transparent text-black placeholder:text-darker-grey focus:outline-none"
                />
            </div>
            <div className="mt-2 flex max-h-40 flex-col gap-1.5 overflow-y-auto overscroll-contain rounded-xl border border-light-grey p-2">
                {filtered.length === 0 && (
                    <span className="py-3 text-center text-sm text-darker-grey">Nothing found.</span>
                )}
                {filtered.map((item) => {
                    const isSelected = selected.includes(item.id);
                    const isDisabled = !isSelected && Boolean(disabledIds?.has(item.id));
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onToggle(item.id)}
                            disabled={isDisabled}
                            title={isDisabled ? "Already included in a selected group" : undefined}
                            className={cn(
                                "flex items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition",
                                isSelected
                                    ? "bg-orange/10 text-orange"
                                    : "text-black/80 hover:bg-light-grey/60",
                                isDisabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
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
