export const actionButtonStyles =
    "rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-30";

export const actionColors = {
    expand: "text-darker-grey hover:bg-orange/10 hover:text-orange",
    class: "text-blue-600 hover:bg-blue-500/10 hover:text-blue-700",
    group: "text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700",
    modify: "text-amber-600 hover:bg-amber-500/10 hover:text-amber-700",
    delete: "text-red-600 hover:bg-red-500/10 hover:text-red-700",
} as const;
