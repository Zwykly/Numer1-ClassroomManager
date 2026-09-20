import { Menu, Plus } from "lucide-react";
import logo from "../logo.png";
import { useActionModalActions } from "@/stores/useActionModalStore";

type MobileHeaderProps = {
    onOpenNav: () => void;
};

export function MobileHeader({ onOpenNav }: MobileHeaderProps) {
    const { openReservation } = useActionModalActions();

    return (
        <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-light-grey bg-white px-4 pb-0 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[env(safe-area-inset-top)] lg:hidden">
            <button
                type="button"
                onClick={onOpenNav}
                aria-label="Open navigation"
                className="rounded-lg p-2 text-black transition hover:bg-light-grey"
            >
                <Menu size={22} />
            </button>

            <div className="flex min-w-0 items-center gap-2">
                <img src={logo} alt="Classroom Manager" className="h-8 w-8 object-contain" />
                <span className="truncate text-sm font-bold tracking-tight text-black">
                    Classroom <span className="text-orange">Manager</span>
                </span>
            </div>

            <button
                type="button"
                onClick={() => openReservation()}
                aria-label="Reserve a classroom"
                className="rounded-lg bg-orange p-2 text-white transition hover:bg-orange/90"
            >
                <Plus size={20} />
            </button>
        </header>
    );
}
