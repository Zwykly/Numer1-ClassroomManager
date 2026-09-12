import { useLocation, useNavigate } from "react-router";
import { LogOut, Plus, UsersRound } from "lucide-react";
import logo from "../logo.png";
import { Button } from "./common/Button";
import { SidebarAction } from "./common/SidebarAction";
import { CalendarDatePicker } from "./CalendarDatePicker";
import { useAuth } from "@/utils/AuthProvider";
import { authClient } from "@/lib/auth-client";
import { useActionModalActions } from "@/stores/useActionModalStore";
import { useSelectedDateActions } from "@/stores/useSelectedDateStore";
import { SIDEBAR_PAGES, type SidebarActionDescriptor } from "@/router/sidebarConfig";

export function Sidebar() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { UserData, refetch } = useAuth();
    const { openReservation, openStudent, openUser } = useActionModalActions();
    const { setDateToToday } = useSelectedDateActions();

    const userInfo = UserData?.user?.userInfo;
    const isAdmin = userInfo?.role === "admin";
    const fullName = userInfo
        ? `${userInfo.firstName} ${userInfo.lastName}`.trim()
        : UserData?.user?.name ?? "User";
    const role = userInfo?.role ?? "teacher";
    const initials = fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "U";

    const pageConfig = SIDEBAR_PAGES[pathname];
    const pageActions = (pageConfig?.actions ?? []).filter(
        (action) => !("adminOnly" in action && action.adminOnly) || isAdmin,
    );

    const handleAction = (action: SidebarActionDescriptor) => {
        switch (action.kind) {
            case "navigate":
                navigate(action.to);
                break;
            case "modal":
                if (action.target === "reservation") openReservation();
                if (action.target === "student") openStudent();
                if (action.target === "user") openUser();
                break;
            case "today":
                setDateToToday();
                break;
            case "placeholder":
                break;
        }
    };

    const handleSignOut = async () => {
        await authClient.signOut();
        await refetch();
        navigate("/", { replace: true });
    };

    return (
        <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-light-grey bg-white">
            <div className="flex items-center gap-3 px-5 py-6">
                <img src={logo} alt="Classroom Manager" className="h-11 w-11 object-contain" />
                <div className="flex flex-col leading-none">
                    <span className="text-base font-bold tracking-tight text-black">Classroom</span>
                    <span className="text-base font-bold tracking-tight text-orange">Manager</span>
                </div>
            </div>

            <div className="px-4">
                <Button variant="primary" className="w-full gap-2" onClick={() => openReservation()}>
                    <Plus size={18} />
                    Reserve a classroom
                </Button>
            </div>

            <div className="mt-4 flex flex-1 flex-col overflow-y-auto px-4 pb-4">
                {pathname === "/myHome" && (
                    <div className="py-2">
                        <CalendarDatePicker />
                    </div>
                )}

                <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.15em] text-darker-grey">
                    {pageConfig?.label ?? "Actions"}
                </p>
                <div className="flex flex-col gap-1">
                    {pageActions.map((action) => (
                        <SidebarAction
                            key={action.id}
                            icon={action.icon}
                            label={action.label}
                            hint={action.kind === "placeholder" ? action.hint : undefined}
                            disabled={action.kind === "placeholder"}
                            active={action.kind === "navigate" ? pathname === action.to : false}
                            onClick={action.kind === "placeholder" ? undefined : () => handleAction(action)}
                        />
                    ))}
                    <SidebarAction icon={UsersRound} label="Manage groups" hint="Soon" disabled />
                </div>
            </div>

            <div className="border-t border-light-grey p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange/10 text-sm font-bold text-orange">
                        {initials}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-bold text-black">{fullName}</span>
                        <span className="truncate text-xs capitalize text-darker-grey">{role}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleSignOut}
                        title="Sign out"
                        className="rounded-lg p-1.5 text-darker-grey transition hover:bg-light-grey hover:text-black"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
