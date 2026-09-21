import { useState } from "react";
import { KeyRound, Mail, UserRound, Video } from "lucide-react";
import { clsx as cn } from "clsx";
import { Button } from "../components/common/Button";
import { useUsersActions } from "@/stores/useUsersStore";
import { useAuth } from "@/utils/AuthProvider";
import { userColor } from "@/utils/userColors";

const roleStyles: Record<string, string> = {
    admin: "bg-orange/10 text-orange",
    teacher: "bg-light-grey text-darker-grey",
    pending: "bg-amber-500/10 text-amber-700",
};

const inputClass =
    "mt-1 w-full rounded-xl border border-grey bg-white px-3 py-2 text-black placeholder:text-darker-grey focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30";

export function Profile() {
    const { UserData } = useAuth();
    const { setOwnPassword } = useUsersActions();
    const userInfo = UserData?.user?.userInfo;

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const firstName = userInfo?.firstName ?? UserData?.user?.name?.split(" ")[0] ?? "";
    const lastName = userInfo?.lastName ?? UserData?.user?.name?.split(" ").slice(1).join(" ") ?? "";
    const fullName = `${firstName} ${lastName}`.trim() || "Your account";
    const role = userInfo?.role ?? "teacher";

    const canSubmit = newPassword.trim().length >= 8 && newPassword === confirmPassword && !isSaving;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword.trim().length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("The passwords do not match.");
            return;
        }

        setIsSaving(true);
        try {
            const ok = await setOwnPassword(newPassword);
            if (!ok) {
                setError("Could not update your password. Please try again.");
                return;
            }
            setNewPassword("");
            setConfirmPassword("");
            setSuccess("Your password has been updated.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto overscroll-contain bg-canvas">
            <div className="flex flex-col px-4 pt-8 pb-10 sm:px-6 lg:px-8 lg:pt-15">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange">
                            Account
                        </span>
                        <h1 className="mt-1 text-black font-bold text-3xl sm:text-4xl">Your profile</h1>
                        <p className="mt-2 max-w-xl text-sm text-darker-grey">
                            Your account details and password.
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex w-full max-w-2xl flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <span
                            className="h-12 w-12 shrink-0 rounded-full"
                            style={{ backgroundColor: userColor(userInfo?.color) }}
                        />
                        <div className="flex min-w-0 flex-col gap-1">
                            <span className="truncate text-xl font-bold text-black">{fullName}</span>
                            <span
                                className={cn(
                                    "w-fit rounded-full px-3 py-1 text-xs font-bold capitalize",
                                    roleStyles[role] ?? "bg-light-grey text-darker-grey",
                                )}
                            >
                                {role}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-light-grey pt-6 text-sm text-darker-grey">
                        <span className="inline-flex items-center gap-2">
                            <UserRound size={16} />
                            {fullName}
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <Mail size={16} />
                            {userInfo?.email ?? UserData?.user?.email ?? "-"}
                        </span>
                        {userInfo?.onlineClassroom?.name && (
                            <span className="inline-flex items-center gap-2">
                                <Video size={16} />
                                {userInfo.onlineClassroom.name}
                            </span>
                        )}
                        {userInfo?.additionalInfo && (
                            <span className="text-darker-grey">{userInfo.additionalInfo}</span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-light-grey pt-6">
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-darker-grey">
                            <KeyRound size={14} />
                            Password
                        </span>
                        <p className="text-sm text-darker-grey">
                            Choose a new password for your account. It must be at least 8 characters long.
                        </p>

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

                        {error && (
                            <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700">
                                {error}
                            </p>
                        )}
                        {success && (
                            <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700">
                                {success}
                            </p>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full gap-2 sm:w-auto"
                            disabled={!canSubmit}
                        >
                            <KeyRound size={18} />
                            {isSaving ? "Saving..." : "Save password"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
