export const CLASSROOM_COLORS = [
    "#e07a5f",
    "#d4a373",
    "#a3b18a",
    "#81b29a",
    "#6d9dc5",
    "#7c90db",
    "#9d8189",
    "#b08968",
    "#8e9aaf",
    "#c9ada7",
    "#84a59d",
    "#e6b89c",
] as const;

const FALLBACK_COLOR = "hsl(0,0%,62%)";
const FALLBACK_TINT = "hsl(0,0%,94%)";

// Deterministic palette pick so rooms without an explicit color still read as
// distinct instead of all falling back to grey.
function derivedColor(key?: string): string | null {
    if (!key || key.length === 0) return null;
    let hash = 0;
    for (let index = 0; index < key.length; index += 1) {
        hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
    }
    return CLASSROOM_COLORS[hash % CLASSROOM_COLORS.length] ?? null;
}

export function classroomColor(color?: string | null, key?: string): string {
    if (color && color.trim().length > 0) return color;
    return derivedColor(key) ?? FALLBACK_COLOR;
}

export function classroomTint(color?: string | null, key?: string): string {
    const resolved = color && color.trim().length > 0 ? color : derivedColor(key);
    if (!resolved) return FALLBACK_TINT;
    return `color-mix(in srgb, ${resolved} 16%, white)`;
}
