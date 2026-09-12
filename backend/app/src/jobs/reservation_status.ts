import { ClassroomReservationsService } from "../services/classroom_reservations";

const BASE_INTERVAL_MS = 3 * 60 * 1000;
const JITTER_MS = 45 * 1000;
const MIN_INTERVAL_MS = 5 * 1000;

let timeout: ReturnType<typeof setTimeout> | null = null;

async function syncReservationStatuses() {
    try {
        const started = await ClassroomReservationsService.startDueReservations();
        const completed = await ClassroomReservationsService.completeFinishedReservations();

        if (started > 0 || completed > 0) {
            console.log(`[reservation-status] started ${started}, completed ${completed}`);
        }
    } catch (error) {
        console.error("[reservation-status] job failed:", error);
    } finally {
        scheduleNext();
    }
}

function scheduleNext() {
    const delay = Math.max(
        BASE_INTERVAL_MS + (Math.random() * 2 - 1) * JITTER_MS,
        MIN_INTERVAL_MS,
    );
    timeout = setTimeout(syncReservationStatuses, delay);
}

export function startReservationStatusJob() {
    void syncReservationStatuses();

    return () => {
        if (timeout) clearTimeout(timeout);
        timeout = null;
    };
}
