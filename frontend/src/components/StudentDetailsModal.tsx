import { format } from "date-fns";
import { Calendar, Mail, Phone, Repeat, UsersRound } from "lucide-react";
import { clsx as cn } from "clsx";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import type { Student } from "@/stores/useStudentsStore";
import { recurringStudentClasses, upcomingStudentClasses } from "@/utils/studentImpact";

type StudentDetailsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: Student | null;
    isAdmin: boolean;
};

const classStatusStyles: Record<string, string> = {
    scheduled: "bg-blue-500/10 text-blue-700",
    cyclical: "bg-orange/10 text-orange",
    ongoing: "bg-emerald-500/10 text-emerald-700",
};

function formatTime(value: string | Date) {
    try {
        return format(new Date(value), "dd MMM yyyy, HH:mm");
    } catch {
        return "-";
    }
}

export function StudentDetailsModal({ open, onOpenChange, student, isAdmin }: StudentDetailsModalProps) {
    const groups = student?.groups ?? [];
    const upcoming = upcomingStudentClasses(student?.reservations);
    const recurring = recurringStudentClasses(student?.reservations);

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={student ? `${student.firstName} ${student.lastName}` : "Student"}
            description="Student details"
            className="max-w-3xl"
        >
            {!student ? (
                <div className="py-16 text-center text-sm text-darker-grey">No student selected.</div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2 text-sm text-darker-grey">
                        {student.phoneNumber && (
                            <span className="inline-flex items-center gap-2">
                                <Phone size={15} />
                                {student.phoneNumber}
                            </span>
                        )}
                        {student.email && (
                            <span className="inline-flex items-center gap-2">
                                <Mail size={15} />
                                {student.email}
                            </span>
                        )}
                        {student.additionalInfo && (
                            <span className="text-darker-grey">{student.additionalInfo}</span>
                        )}
                    </div>

                    <div>
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-darker-grey">
                            <UsersRound size={14} />
                            Groups ({groups.length})
                        </span>
                        {groups.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {groups.map((group) => (
                                    <span
                                        key={group.id}
                                        className="inline-flex items-center rounded-full border border-light-grey bg-white px-3 py-1 text-xs font-medium text-black"
                                    >
                                        {group.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-darker-grey">Not part of any group.</p>
                        )}
                    </div>

                    <div>
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-darker-grey">
                            <Calendar size={14} />
                            {isAdmin ? "Upcoming classes" : "Upcoming classes with you"} ({upcoming.length})
                        </span>
                        {upcoming.length > 0 ? (
                            <div className="mt-2 flex flex-col gap-1.5">
                                {upcoming.map((entry) => (
                                    <div
                                        key={entry.key}
                                        className="flex flex-row items-center justify-between gap-3 rounded-xl border border-light-grey bg-white px-3 py-2"
                                    >
                                        <div className="flex min-w-0 flex-col">
                                            <span className="truncate font-bold text-black">
                                                {entry.name || "Untitled class"}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 text-xs text-darker-grey">
                                                <Calendar size={13} />
                                                {formatTime(entry.nextTime)}
                                            </span>
                                        </div>
                                        {entry.recurring && (
                                            <span className="shrink-0 rounded-full bg-orange/10 px-3 py-1 text-xs font-bold text-orange">
                                                {entry.occurrences} upcoming
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-darker-grey">
                                {isAdmin ? "No upcoming classes." : "No upcoming classes with you."}
                            </p>
                        )}
                    </div>

                    <div>
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-darker-grey">
                            <Repeat size={14} />
                            Recurring classes ({recurring.length})
                        </span>
                        {recurring.length > 0 ? (
                            <div className="mt-2 flex flex-col gap-1.5">
                                {recurring.map((entry) => (
                                    <div
                                        key={entry.key}
                                        className="flex flex-row items-center justify-between gap-3 rounded-xl border border-light-grey bg-white px-3 py-2"
                                    >
                                        <div className="flex min-w-0 flex-col">
                                            <span className="truncate font-bold text-black">
                                                {entry.name || "Untitled class"}
                                            </span>
                                            <span className="text-xs text-darker-grey">
                                                Started {formatTime(entry.firstTime)}
                                            </span>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-orange/10 px-3 py-1 text-xs font-bold text-orange">
                                            {entry.occurrences} in series
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-darker-grey">Not enrolled in any recurring class.</p>
                        )}
                    </div>

                    <div className="flex justify-stretch border-t border-light-grey pt-4 sm:justify-end">
                        <Button variant="secondary" className="w-full border border-grey sm:w-auto" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
