import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { clsx as cn } from "clsx";
import { Button } from "../components/common/Button";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { ReservationsTable } from "../components/ReservationsTable";
import { ReservationFormModal } from "../components/ReservationFormModal";
import {
    useReservations,
    useReservationsLoading,
    useReservationsActions,
    type Reservation,
    type ReservationView,
} from "@/stores/useReservationsStore";
import { useAuth } from "@/utils/AuthProvider";

const FILTERS: { value: ReservationView; label: string }[] = [
    { value: "all", label: "All" },
    { value: "recurring", label: "Recurring" },
    { value: "upcoming", label: "Scheduled" },
    { value: "archived", label: "Archived" },
];

export function ManageReservations() {
    const reservations = useReservations();
    const isLoading = useReservationsLoading();
    const { fetchReservations, createReservation, createRecurringReservation, patchReservation, deleteReservation } =
        useReservationsActions();
    const { UserData } = useAuth();
    const currentUserId = UserData?.user?.userInfo?.id;
    const isAdmin = UserData?.user?.userInfo?.role === "admin";

    const [view, setView] = useState<ReservationView>("all");
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchReservations(view, search.trim() || undefined);
        }, 300);
        return () => clearTimeout(timeout);
    }, [view, search]);

    const recurringCount = reservations.filter(
        (reservation) => reservation.cycleId || reservation.status === "cyclical",
    ).length;
    const upcomingCount = reservations.filter((reservation) => reservation.status === "scheduled").length;

    const openAdd = () => {
        setEditingReservation(null);
        setFormOpen(true);
    };

    const openModify = (reservation: Reservation) => {
        setEditingReservation(reservation);
        setFormOpen(true);
    };

    const openDelete = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedReservation) return;
        try {
            await deleteReservation(selectedReservation.id);
            setDeleteOpen(false);
        } catch (error) {
            console.error("Failed to delete reservation:", error);
        }
    };

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
            <div className="pt-15 px-8 flex flex-col h-full overflow-hidden">
                    <div className="flex flex-row items-end justify-between gap-6">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange">
                                Scheduling
                            </span>
                            <h1 className="mt-1 text-black font-bold text-4xl">Classes</h1>
                            <p className="mt-2 max-w-xl text-sm text-darker-grey">
                                Reserve classrooms, schedule recurring classes and keep track of who is attending.
                            </p>
                        </div>
                        <Button variant="primary" className="gap-2" onClick={openAdd}>
                            <Plus size={20} />
                            Reserve a class
                        </Button>
                    </div>

                    <div className="mt-8 flex flex-row flex-wrap items-end justify-between gap-6">
                        <div className="flex flex-row items-center gap-2">
                            {FILTERS.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setView(filter.value)}
                                    className={cn(
                                        "rounded-xl border px-4 py-2 text-sm font-bold transition",
                                        view === filter.value
                                            ? "border-orange bg-orange/10 text-orange"
                                            : "border-light-grey bg-white text-darker-grey hover:border-grey",
                                    )}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-row items-center gap-6">
                            <Stat label="Total" value={reservations.length} />
                            <div className="h-9 w-px bg-light-grey" />
                            <Stat label="Recurring" value={recurringCount} accent />
                            <div className="h-9 w-px bg-light-grey" />
                            <Stat label="Scheduled" value={upcomingCount} />
                        </div>
                    </div>

                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by class name..."
                        className="mt-5 w-full max-w-sm rounded-xl border border-light-grey bg-white px-4 py-2 text-black placeholder:text-darker-grey/60 focus:border-orange focus:outline-none"
                    />

                    <div className="mt-6 flex-1 overflow-y-auto pb-10">
                        <ReservationsTable
                            reservations={reservations}
                            isLoading={isLoading}
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                            groupRecurring={view !== "upcoming"}
                            onModify={openModify}
                            onDelete={openDelete}
                        />
                    </div>
                </div>

            <ReservationFormModal
                open={formOpen}
                onOpenChange={setFormOpen}
                reservation={editingReservation}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onCreate={createReservation}
                onCreateRecurring={createRecurringReservation}
                onUpdate={patchReservation}
            />

            <ConfirmModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete class"
                message={
                    selectedReservation
                        ? `Are you sure you want to delete "${selectedReservation.name || "this class"}"? This cannot be undone.`
                        : "Are you sure you want to delete this class?"
                }
                confirmLabel="Delete"
                isDestructive
                onConfirm={confirmDelete}
            />
        </div>
    );
}

type StatProps = {
    label: string;
    value: number;
    accent?: boolean;
};

function Stat({ label, value, accent }: StatProps) {
    return (
        <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">{label}</span>
            <span className={accent ? "text-2xl font-bold text-orange" : "text-2xl font-bold text-black"}>
                {value}
            </span>
        </div>
    );
}
