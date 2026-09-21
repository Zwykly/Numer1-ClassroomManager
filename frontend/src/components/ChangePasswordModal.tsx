import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import { ConfirmModal } from "./common/ConfirmModal";

type ChangePasswordModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReset: (newPassword: string) => Promise<boolean>;
};

const inputClass =
    "mt-1 w-full rounded-xl border border-grey bg-white px-3 py-2 text-black placeholder:text-darker-grey focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30";

export function ChangePasswordModal({ open, onOpenChange, onReset }: ChangePasswordModalProps) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        if (open) return;
        setNewPassword("");
        setConfirmPassword("");
        setError(null);
        setConfirmOpen(false);
    }, [open]);

    const isValid = newPassword.trim().length >= 8 && newPassword === confirmPassword && !isSubmitting;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            const ok = await onReset(newPassword);
            if (!ok) {
                setError("Could not update your password. Please try again.");
                setConfirmOpen(false);
                return;
            }
            setConfirmOpen(false);
            onOpenChange(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Modal
                open={open}
                onOpenChange={onOpenChange}
                title="Change password"
                description="Choose a new password for your account. It must be at least 8 characters long."
                className="max-w-md"
            >
                <div className="flex flex-col gap-3">
                    <label className="flex flex-col">
                        <span className="text-sm font-bold text-black">New password</span>
                        <input
                            type="password"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder="At least 8 characters"
                            className={inputClass}
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm font-bold text-black">Confirm new password</span>
                        <input
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Repeat the new password"
                            className={inputClass}
                        />
                    </label>

                    {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                        <p className="text-xs font-medium text-red-600">The passwords do not match.</p>
                    )}

                    {error && (
                        <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700">
                            {error}
                        </p>
                    )}

                    <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                            variant="secondary"
                            className="w-full border border-grey sm:w-auto"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="w-full gap-2 sm:w-auto"
                            onClick={() => setConfirmOpen(true)}
                            disabled={!isValid}
                        >
                            <KeyRound size={18} />
                            Reset password
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Reset password"
                message="Are you sure you want to reset your password? Your current password will stop working and you will need the new one the next time you sign in."
                confirmLabel={isSubmitting ? "Resetting..." : "Reset password"}
                onConfirm={handleConfirm}
            />
        </>
    );
}
