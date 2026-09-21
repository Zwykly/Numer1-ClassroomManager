import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";

type UserCredentialsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    credentials: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    } | null;
    title?: string;
    description?: string;
};

export function UserCredentialsModal({
    open,
    onOpenChange,
    credentials,
    title = "Account created",
    description = "Share these credentials with the user. The password is only shown once.",
}: UserCredentialsModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!credentials) return;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(credentials.password);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = credentials.password;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy password:", error);
        }
    };

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            className="max-w-md"
        >
            {credentials && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wide text-darker-grey">User</span>
                        <span className="mt-1 font-bold text-black">
                            {credentials.firstName} {credentials.lastName}
                        </span>
                        <span className="text-sm text-darker-grey">{credentials.email}</span>
                    </div>

                    <div className="flex flex-col rounded-xl bg-light-black p-4">
                        <span className="text-xs font-bold uppercase tracking-wide text-white/50">
                            Sample password
                        </span>
                        <div className="mt-2 flex flex-row items-center justify-between gap-3">
                            <code className="select-all font-mono text-lg text-orange">{credentials.password}</code>
                            <button
                                onClick={handleCopy}
                                title="Copy password"
                                className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-orange"
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-stretch sm:justify-end">
                        <Button variant="primary" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>Done</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
