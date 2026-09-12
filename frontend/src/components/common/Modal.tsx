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
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
                <Dialog.Content
                    className={cn(
                        "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white p-6 shadow-xl focus:outline-none",
                        className,
                    )}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <Dialog.Title className="text-2xl font-bold text-black">{title}</Dialog.Title>
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
                    <div className="mt-4 max-h-[75vh] overflow-y-auto">{children}</div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
