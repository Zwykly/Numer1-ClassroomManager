import { Modal } from "./Modal";
import { Button } from "./Button";

type ConfirmModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void | Promise<void>;
};

export function ConfirmModal({
    open,
    onOpenChange,
    title,
    message,
    confirmLabel = "Confirm",
    isDestructive = false,
    onConfirm,
}: ConfirmModalProps) {
    return (
        <Modal open={open} onOpenChange={onOpenChange} title={title} className="max-w-md">
            <p className="text-black/70">{message}</p>
            <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" className="border border-grey" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button
                    variant={isDestructive ? "danger" : "primary"}
                    onClick={onConfirm}
                >
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    );
}
