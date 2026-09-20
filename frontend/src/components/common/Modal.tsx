import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { clsx as cn } from "clsx";
import type { ReactNode } from "react";

type ModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
};

export function Modal({
    open,
    onOpenChange,
    title,
    description,
    children,
    className,
}: ModalProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
                <Dialog.Content
                    className={cn(
                        "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-light-grey bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl focus:outline-none",
                        "lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:w-[92vw] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:p-6",
                        className,
                    )}
                >
                    <div className="flex shrink-0 items-start justify-between gap-4">
                        <div>
                            <Dialog.Title className="text-xl font-bold text-black sm:text-2xl">{title}</Dialog.Title>
                            {description && (
                                <Dialog.Description className="mt-1 text-sm text-darker-grey">
                                    {description}
                                </Dialog.Description>
                            )}
                        </div>
                        <Dialog.Close className="rounded-lg p-1 text-darker-grey transition hover:bg-light-grey hover:text-black">
                            <X size={20} />
                        </Dialog.Close>
                    </div>
                    <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
