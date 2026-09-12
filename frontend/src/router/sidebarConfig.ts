import {
    CalendarDays,
    CalendarPlus,
    GraduationCap,
    Plus,
    UserPlus,
    Users,
    UsersRound,
    type LucideIcon,
} from "lucide-react";

export type SidebarModalTarget = "reservation" | "student" | "user";

export type SidebarNavDescriptor =
    | { kind: "navigate"; id: string; label: string; icon: LucideIcon; to: string; adminOnly?: boolean }
    | { kind: "placeholder"; id: string; label: string; icon: LucideIcon; hint?: string };

export type SidebarPageActionDescriptor =
    | { kind: "modal"; id: string; label: string; icon: LucideIcon; target: SidebarModalTarget; adminOnly?: boolean }
    | { kind: "today"; id: string; label: string; icon: LucideIcon };

export type SidebarPageConfig = {
    label: string;
    actions: SidebarPageActionDescriptor[];
};

export const SIDEBAR_NAVIGATION: SidebarNavDescriptor[] = [
    { kind: "navigate", id: "calendar", label: "My calendar", icon: CalendarDays, to: "/myHome" },
    { kind: "navigate", id: "students", label: "Manage students", icon: GraduationCap, to: "/manage-students" },
    { kind: "navigate", id: "reservations", label: "Manage reservations", icon: CalendarPlus, to: "/manage-reservations" },
    { kind: "navigate", id: "users", label: "Manage users", icon: Users, to: "/manage-users", adminOnly: true },
    { kind: "placeholder", id: "groups", label: "Manage groups", icon: UsersRound, hint: "Soon" },
];

export const SIDEBAR_PAGES: Record<string, SidebarPageConfig> = {
    "/myHome": {
        label: "This page",
        actions: [
            { kind: "today", id: "today", label: "Go to today", icon: CalendarDays },
        ],
    },
    "/manage-reservations": {
        label: "This page",
        actions: [
            { kind: "modal", id: "new-reservation", label: "New class", icon: Plus, target: "reservation" },
        ],
    },
    "/manage-students": {
        label: "This page",
        actions: [
            { kind: "modal", id: "new-student", label: "Add a student", icon: UserPlus, target: "student", adminOnly: true },
        ],
    },
    "/manage-users": {
        label: "This page",
        actions: [
            { kind: "modal", id: "new-user", label: "Add user", icon: UserPlus, target: "user" },
        ],
    },
};
