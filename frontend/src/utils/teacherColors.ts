const GOLDEN_ANGLE = 137.508;

function hashString(value: string): number {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
    }
    return hash;
}

export function teacherColor(teacherId?: string | null): string {
    if (!teacherId) return "hsl(0,0%,70%)";

    const hash = hashString(teacherId);
    const hue = Math.round((hash * GOLDEN_ANGLE) % 360);
    const saturation = 58 + (hash % 3) * 7;
    const lightness = 44 + (hash % 4) * 4;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
