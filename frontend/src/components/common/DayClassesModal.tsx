import { format } from "date-fns";
import { Modal } from "./Modal";
import { ClassTile } from "./ClassTile";
import type { ClassroomReservation } from "@/stores/useClassroomReservationsStore";

type DayClassesModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    day: Date | null;
    reservations: ClassroomReservation[];
    currentUserId?: string;
    isAdmin?: boolean;
    onSelectReservation?: (reservation: ClassroomReservation) => void;
};

export function DayClassesModal({ open, onOpenChange, day, reservations, currentUserId, isAdmin, onSelectReservation }: DayClassesModalProps) {
    const count = reservations.length;

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={day ? format(day, "EEEE, d MMMM yyyy") : "Classes"}
            description={count > 0 ? `${count} ${count === 1 ? "class" : "classes"} scheduled` : "No classes scheduled"}
        >
            {count === 0 ? (
                <div className="py-12 text-center text-sm text-darker-grey">
                    Nothing is scheduled for this day.
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {reservations.map((reservation) => (
                        <div key={reservation.id} className="h-16">
                            <ClassTile
                                reservation={reservation}
                                isOwn={reservation.teacherId === currentUserId}
                                isAdmin={isAdmin}
                                onClick={onSelectReservation ? () => onSelectReservation(reservation) : undefined}
                            />
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
}
