import { clsx as cn } from "clsx";
import type { LucideIcon } from "lucide-react";

type SidebarActionProps = {
    icon: LucideIcon;
    label: string;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    hint?: string;
};

export function SidebarAction({
    icon: Icon,
    label,
    onClick,
    active,
    disabled,
    hint,
}: SidebarActionProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-current={active ? "page" : undefined}
            className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition",
                active
                    ? "bg-orange text-white shadow-sm"
                    : "text-light-black hover:bg-orange/10 hover:text-orange",
                disabled && "cursor-not-allowed text-darker-grey opacity-60 hover:bg-transparent",
            )}
        >
            <Icon
                size={18}
                className={cn(
                    "shrink-0",
                    active ? "text-white" : "text-darker-grey group-hover:text-orange",
                    disabled && "text-dark-grey group-hover:text-dark-grey",
                )}
            />
            <span className="flex-1 truncate">{label}</span>
            {hint && (
                <span className="rounded-full bg-light-grey px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-darker-grey">
                    {hint}
                </span>
            )}
        </button>
    );
}
