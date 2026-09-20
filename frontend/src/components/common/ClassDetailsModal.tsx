import { addMinutes, format } from "date-fns";
import { Calendar, CheckCircle2, Clock, Info, MapPin, Pencil, Repeat, User, Users, XCircle } from "lucide-react";
import { clsx as cn } from "clsx";
import { useState } from "react";
import { Modal } from "./Modal";
import { ConfirmModal } from "./ConfirmModal";
import { Button } from "./Button";
import { reservationAttendees } from "@/components/ReservationsTable";
import { userColor } from "@/utils/userColors";
import type { Reservation } from "@/stores/useReservationsStore";

type ClassDetailsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservation: Reservation | null;
    isLoading?: boolean;
    currentUserId?: string;
    isAdmin: boolean;
    onEdit: (reservation: Reservation) => void;
    onCancel?: (reservation: Reservation) => Promise<void> | void;
};

const EDITABLE_STATUSES = ["scheduled", "cyclical", "ongoing"];

const statusStyles: Record<string, string> = {
    scheduled: "bg-blue-500/10 text-blue-700",
    cyclical: "bg-orange/10 text-orange",
    ongoing: "bg-emerald-500/10 text-emerald-700",
    completed: "bg-light-grey text-darker-grey",
    canceled: "bg-red-500/10 text-red-700",
};

export function ClassDetailsModal({
    open,
    onOpenChange,
    reservation,
    isLoading,
    currentUserId,
    isAdmin,
    onEdit,
    onCancel,
}: ClassDetailsModalProps) {
    const [isCanceling, setIsCanceling] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const canEdit = Boolean(
        reservation
        && EDITABLE_STATUSES.includes(reservation.status)
        && (isAdmin || reservation.teacherId === currentUserId),
    );
    const canCancel = canEdit && Boolean(onCancel);

    const handleCancel = async () => {
        if (!reservation || !onCancel) return;
        setIsCanceling(true);
        try {
            await onCancel(reservation);
            setConfirmOpen(false);
        } finally {
            setIsCanceling(false);
        }
    };

    const start = reservation ? new Date(reservation.reservationTime) : null;
    const end = start && reservation?.durationMinutes ? addMinutes(start, reservation.durationMinutes) : null;
    const participants = reservation ? reservationAttendees(reservation) : [];

    return (
        <>
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={reservation?.name || (isLoading ? "Loading class..." : "Untitled class")}
            description="Class details"
            className="max-w-3xl"
        >
            {!reservation ? (
                <div className="py-16 text-center text-sm text-darker-grey">
                    {isLoading ? "Loading class details..." : "No class selected."}
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    <div className="flex flex-row flex-wrap items-center gap-2">
                        <span
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize",
                                statusStyles[reservation.status] ?? "bg-light-grey text-darker-grey",
                            )}
                        >
                            {reservation.status === "ongoing" && (
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                            )}
                            {reservation.status === "completed" && <CheckCircle2 size={13} />}
                            {reservation.status === "canceled" && <XCircle size={13} />}
                            {reservation.status}
                        </span>
                        {reservation.cycleId && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/10 px-3 py-1 text-xs font-bold text-orange">
                                <Repeat size={13} />
                                Recurring
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="flex flex-col gap-3 text-sm">
                            <InfoRow icon={<User size={16} />} label="Teacher">
                                <span className="inline-flex items-center gap-2">
                                    <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: userColor(reservation.teacher?.color) }}
                                    />
                                    {reservation.teacher
                                        ? `${reservation.teacher.firstName} ${reservation.teacher.lastName}`
                                        : "Unassigned"}
                                </span>
                            </InfoRow>

                            <InfoRow icon={<MapPin size={16} />} label={reservation.onlineClassroom ? "Online classroom" : "Classroom"}>
                                {reservation.classroom?.name || reservation.onlineClassroom?.name || "No room assigned"}
                            </InfoRow>

                            <InfoRow icon={<Calendar size={16} />} label="Date">
                                {start ? format(start, "EEEE, d MMMM yyyy") : "-"}
                            </InfoRow>

                            <InfoRow icon={<Clock size={16} />} label="Time">
                                {start ? format(start, "HH:mm") : "-"}
                                {end ? ` – ${format(end, "HH:mm")}` : ""}
                                {reservation.durationMinutes ? ` (${reservation.durationMinutes} min)` : ""}
                            </InfoRow>

                            {reservation.additionalInfo && (
                                <InfoRow icon={<Info size={16} />} label="Additional info">
                                    {reservation.additionalInfo}
                                </InfoRow>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-darker-grey">
                                <Users size={14} />
                                Participants ({participants.length})
                            </span>
                            <div className="mt-2 flex max-h-80 flex-col gap-1.5 overflow-y-auto rounded-xl border border-light-grey p-2">
                                {participants.length === 0 ? (
                                    <span className="py-3 text-center text-sm text-darker-grey">
                                        No participants assigned.
                                    </span>
                                ) : (
                                    participants.map((participant) => (
                                        <div
                                            key={participant.id}
                                            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-light-grey/50"
                                        >
                                            <span className="truncate font-medium text-black">{participant.name}</span>
                                            <span
                                                className={cn(
                                                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                                                    participant.group
                                                        ? "bg-orange/10 text-orange"
                                                        : "bg-light-grey text-darker-grey",
                                                )}
                                            >
                                                {participant.group ?? "Solo"}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {(canCancel || canEdit) && (
                        <div className="flex flex-row items-center gap-2 border-t border-light-grey pt-4 sm:justify-end">
                            {canCancel && (
                                <Button
                                    variant="danger"
                                    className="shrink-0 px-3 sm:mr-auto"
                                    aria-label="Cancel class"
                                    title={isCanceling ? "Canceling..." : "Cancel class"}
                                    onClick={() => setConfirmOpen(true)}
                                    disabled={isCanceling}
                                >
                                    <XCircle size={18} />
                                </Button>
                            )}
                            {canEdit && (
                                <Button variant="primary" className="flex-1 gap-2 sm:flex-none" onClick={() => onEdit(reservation)} disabled={isCanceling}>
                                    <Pencil size={16} />
                                    Edit class
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Modal>
        <ConfirmModal
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Cancel class"
            message={
                reservation
                    ? `Are you sure you want to cancel "${reservation.name || "this class"}"? It will be marked as canceled.`
                    : "Are you sure you want to cancel this class?"
            }
            confirmLabel={isCanceling ? "Canceling..." : "Cancel class"}
            isDestructive
            onConfirm={handleCancel}
        />
        </>
    );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-row items-start gap-3">
            <span className="mt-0.5 text-darker-grey">{icon}</span>
            <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">{label}</span>
                <span className="text-black/80">{children}</span>
            </div>
        </div>
    );
}
