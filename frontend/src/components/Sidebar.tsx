import { useLocation, useNavigate } from "react-router";
import { LogOut, Plus } from "lucide-react";
import logo from "../logo.png";
import { Button } from "./common/Button";
import { SidebarAction } from "./common/SidebarAction";
import { CalendarDatePicker } from "./CalendarDatePicker";
import { useAuth } from "@/utils/AuthProvider";
import { authClient } from "@/lib/auth-client";
import { useActionModalActions } from "@/stores/useActionModalStore";
import { useSelectedDateActions } from "@/stores/useSelectedDateStore";
import {
    SIDEBAR_NAVIGATION,
    SIDEBAR_PAGES,
    type SidebarNavDescriptor,
    type SidebarPageActionDescriptor,
} from "@/router/sidebarConfig";

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

    const pageConfig = SIDEBAR_PAGES[pathname];
    const pageActions = (pageConfig?.actions ?? []).filter(
        (action) => !("adminOnly" in action && action.adminOnly) || isAdmin,
    );
    const navigationActions = SIDEBAR_NAVIGATION.filter(
        (action) => !("adminOnly" in action && action.adminOnly) || isAdmin,
    );

    const handleNavigate = (action: Extract<SidebarNavDescriptor, { kind: "navigate" }>) => {
        navigate(action.to);
    };

    const handlePageAction = (action: SidebarPageActionDescriptor) => {
        if (action.kind === "today") {
            setDateToToday();
            return;
        }
        if (action.target === "reservation") openReservation();
        if (action.target === "student") openStudent();
        if (action.target === "user") openUser();
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
                    Navigate
                </p>
                <div className="flex flex-col gap-1">
                    {navigationActions.map((action) => (
                        <SidebarAction
                            key={action.id}
                            icon={action.icon}
                            label={action.label}
                            hint={action.kind === "placeholder" ? action.hint : undefined}
                            disabled={action.kind === "placeholder"}
                            active={action.kind === "navigate" ? pathname === action.to : false}
                            onClick={
                                action.kind === "navigate"
                                    ? () => handleNavigate(action)
                                    : undefined
                            }
                        />
                    ))}
                </div>

                {pageActions.length > 0 && (
                    <>
                        <p className="px-3 pb-1 pt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-darker-grey">
                            {pageConfig?.label ?? "This page"}
                        </p>
                        <div className="flex flex-col gap-1">
                            {pageActions.map((action) => (
                                <SidebarAction
                                    key={action.id}
                                    icon={action.icon}
                                    label={action.label}
                                    onClick={() => handlePageAction(action)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="border-t border-light-grey p-4">
                <div className="flex items-center gap-3">
                    <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-bold text-black">{fullName}</span>
                        <span className="truncate text-xs capitalize text-darker-grey">{role}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleSignOut}
                        title="Sign out"
                        className="rounded-lg p-1.5 text-darker-grey transition hover:bg-orange/10 hover:text-orange"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
