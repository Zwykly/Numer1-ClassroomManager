import { LogOut, ShieldAlert } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/utils/AuthProvider";
import { Button } from "@/components/common/Button";
import logo from "../logo.png";

export function NoAccess() {
    const { UserData } = useAuth();
    const fullName = UserData?.user?.userInfo
        ? `${UserData.user.userInfo.firstName} ${UserData.user.userInfo.lastName}`.trim()
        : UserData?.user?.name ?? "there";

    const handleSignOut = async () => {
        await authClient.signOut();
        window.location.href = "/";
    };

    return (
        <div className="flex h-dvh w-full items-center justify-center bg-canvas px-4">
            <div className="flex w-full max-w-lg flex-col items-start rounded-2xl border border-light-grey bg-white p-8">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Classroom Manager" className="h-11 w-11 object-contain" />
                    <div className="flex flex-col leading-none">
                        <span className="text-base font-bold tracking-tight text-black">Classroom</span>
                        <span className="text-base font-bold tracking-tight text-orange">Manager</span>
                    </div>
                </div>

                <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 text-orange">
                    <ShieldAlert size={28} />
                </div>

                <h1 className="mt-5 text-2xl font-bold text-black">Access pending</h1>
                <p className="mt-2 text-sm text-darker-grey">
                    Hi {fullName}, your account hasn't been given access yet. An administrator needs to
                    assign you a role before you can use Classroom Manager.
                </p>

                <Button
                    variant="secondary"
                    className="mt-6 w-full gap-2 border border-grey sm:w-auto"
                    onClick={handleSignOut}
                >
                    <LogOut size={18} />
                    Sign out
                </Button>
            </div>
        </div>
    );
}
