import { useState } from "react";
import { KeyRound, Mail, UserRound, Video } from "lucide-react";
import { clsx as cn } from "clsx";
import { Button } from "../components/common/Button";
import { UserCredentialsModal } from "../components/UserCredentialsModal";
import { useUsersActions } from "@/stores/useUsersStore";
import { useAuth } from "@/utils/AuthProvider";
import { userColor } from "@/utils/userColors";

const roleStyles: Record<string, string> = {
    admin: "bg-orange/10 text-orange",
    teacher: "bg-light-grey text-darker-grey",
    pending: "bg-amber-500/10 text-amber-700",
};

export function Profile() {
    const { UserData } = useAuth();
    const { resetOwnPassword } = useUsersActions();
    const userInfo = UserData?.user?.userInfo;

    const [isResetting, setIsResetting] = useState(false);
    const [credentials, setCredentials] = useState<{
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    } | null>(null);
    const [credentialsOpen, setCredentialsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const firstName = userInfo?.firstName ?? UserData?.user?.name?.split(" ")[0] ?? "";
    const lastName = userInfo?.lastName ?? UserData?.user?.name?.split(" ").slice(1).join(" ") ?? "";
    const fullName = `${firstName} ${lastName}`.trim() || "Your account";
    const role = userInfo?.role ?? "teacher";

    const handleReset = async () => {
        setIsResetting(true);
        setError(null);
        try {
            const password = await resetOwnPassword();
            if (!password) {
                setError("Could not generate a new password. Please try again.");
                return;
            }
            setCredentials({
                firstName,
                lastName,
                email: userInfo?.email ?? UserData?.user?.email ?? "",
                password,
            });
            setCredentialsOpen(true);
        } finally {
            setIsResetting(false);
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

                    <div className="flex flex-col gap-3 border-t border-light-grey pt-6">
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-darker-grey">
                            <KeyRound size={14} />
                            Password
                        </span>
                        <p className="text-sm text-darker-grey">
                            Generate a new password for your account. Your current password will stop
                            working and the new one is shown only once.
                        </p>
                        {error && (
                            <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700">
                                {error}
                            </p>
                        )}
                        <Button
                            variant="primary"
                            className="w-full gap-2 sm:w-auto"
                            onClick={handleReset}
                            disabled={isResetting}
                        >
                            <KeyRound size={18} />
                            {isResetting ? "Generating..." : "Generate new password"}
                        </Button>
                    </div>
                </div>
            </div>

            <UserCredentialsModal
                open={credentialsOpen}
                onOpenChange={setCredentialsOpen}
                credentials={credentials}
                title="New password"
                description="Use this password the next time you sign in. It is only shown once."
            />
        </div>
    );
}
