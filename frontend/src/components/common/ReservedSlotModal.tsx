import { addMinutes, format } from "date-fns";
import { Calendar, CheckCircle2, Clock, Lock, Repeat, XCircle } from "lucide-react";
import { clsx as cn } from "clsx";
import { Modal } from "./Modal";
import type { ClassroomReservation } from "@/stores/useClassroomReservationsStore";

type ReservedSlotModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservation: ClassroomReservation | null;
};

const statusStyles: Record<string, string> = {
    scheduled: "bg-blue-500/10 text-blue-700",
    cyclical: "bg-orange/10 text-orange",
    ongoing: "bg-emerald-500/10 text-emerald-700",
    completed: "bg-light-grey text-darker-grey",
    canceled: "bg-red-500/10 text-red-700",
};

export function ReservedSlotModal({ open, onOpenChange, reservation }: ReservedSlotModalProps) {
    const start = reservation ? new Date(reservation.reservationTime) : null;
    const end = start && reservation?.durationMinutes ? addMinutes(start, reservation.durationMinutes) : null;

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title="Reserved slot"
            description="This classroom is reserved by another teacher."
            className="max-w-md"
        >
            {!reservation ? (
                <div className="py-12 text-center text-sm text-darker-grey">No slot selected.</div>
            ) : (
                <div className="flex flex-col gap-4">
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

                    <div className="flex flex-col gap-3 rounded-xl border border-light-grey bg-canvas p-4 text-sm">
                        <span className="inline-flex items-center gap-2 text-darker-grey">
                            <Calendar size={16} />
                            {start ? format(start, "EEEE, d MMMM yyyy") : "-"}
                        </span>
                        <span className="inline-flex items-center gap-2 text-darker-grey">
                            <Clock size={16} />
                            {start ? format(start, "HH:mm") : "-"}
                            {end ? ` – ${format(end, "HH:mm")}` : ""}
                        </span>
                    </div>

                    <p className="inline-flex items-center gap-2 text-xs text-darker-grey">
                        <Lock size={14} />
                        Details of this class are only visible to its teacher and administrators.
                    </p>
                </div>
            )}
        </Modal>
    );
}
