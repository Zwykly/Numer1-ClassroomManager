import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { clsx as cn } from "clsx";
import type { ReactNode } from "react";

type DrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    children: ReactNode;
    className?: string;
};

export function Drawer({
    open,
    onOpenChange,
    title = "Navigation",
    children,
    className,
}: DrawerProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
                <Dialog.Content
                    aria-describedby={undefined}
                    className={cn(
                        "fixed inset-y-0 left-0 z-50 flex h-full w-[85vw] max-w-[320px] flex-col bg-white shadow-2xl focus:outline-none",
                        className,
                    )}
                >
                    <Dialog.Title className="sr-only">{title}</Dialog.Title>
                    <Dialog.Close
                        aria-label="Close navigation"
                        className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-darker-grey transition hover:bg-light-grey hover:text-black"
                    >
                        <X size={20} />
                    </Dialog.Close>
                    {children}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
