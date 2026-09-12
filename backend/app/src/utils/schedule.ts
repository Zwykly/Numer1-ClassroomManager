export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const MS_PER_MINUTE = 60 * 1000;
export const MAX_GENERATED_OCCURRENCES = 200;
export const DEFAULT_DURATION_MINUTES = 60;

export function durationOf(value?: number | null): number {
    return value && value > 0 ? value : DEFAULT_DURATION_MINUTES;
}

export function endOf(start: Date, durationMinutes?: number | null): Date {
    return new Date(start.getTime() + durationOf(durationMinutes) * MS_PER_MINUTE);
}

export function intervalsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}

export type OccurrenceInput = {
    anchorDate: string | Date;
    frequency: number;
    cycleEndDate?: string | Date | null;
    numberOfOccurrences?: number | null;
    overrides?: { index: number; reservationTime: string | Date }[];
};

export function buildOccurrenceDates(input: OccurrenceInput): Date[] {
    const anchor = new Date(input.anchorDate);
    const end = input.cycleEndDate ? new Date(input.cycleEndDate) : null;
    const frequency = Math.max(input.frequency, 1);
    const max = input.numberOfOccurrences
        ? Math.min(input.numberOfOccurrences, MAX_GENERATED_OCCURRENCES)
        : MAX_GENERATED_OCCURRENCES;

    const dates: Date[] = [];
    let current = new Date(anchor);
    while (dates.length < max) {
        if (end && current > end) break;
        dates.push(new Date(current));
        current = new Date(current.getTime() + frequency * MS_PER_DAY);
    }

    if (input.overrides) {
        for (const override of input.overrides) {
            if (override.index >= 0 && override.index < dates.length) {
                dates[override.index] = new Date(override.reservationTime);
            }
        }
    }

    return dates;
}
