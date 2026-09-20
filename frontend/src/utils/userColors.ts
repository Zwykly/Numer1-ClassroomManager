export const USER_COLORS = [
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#10b981",
    "#14b8a6",
    "#0ea5e9",
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#64748b",
] as const;

const FALLBACK_COLOR = "hsl(0,0%,70%)";
const FALLBACK_TINT = "hsl(0,0%,94%)";

export function userColor(color?: string | null): string {
    return color && color.trim().length > 0 ? color : FALLBACK_COLOR;
}

export function userTint(color?: string | null): string {
    if (!color || color.trim().length === 0) return FALLBACK_TINT;
    return `color-mix(in srgb, ${color} 16%, white)`;
}
