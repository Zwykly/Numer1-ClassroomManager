import {
    CalendarDays,
    CalendarPlus,
    GraduationCap,
    Plus,
    UserPlus,
    type LucideIcon,
} from "lucide-react";

export type SidebarModalTarget = "reservation" | "student" | "user";

export type SidebarActionDescriptor =
    | { kind: "navigate"; id: string; label: string; icon: LucideIcon; to: string; adminOnly?: boolean }
    | { kind: "modal"; id: string; label: string; icon: LucideIcon; target: SidebarModalTarget; adminOnly?: boolean }
    | { kind: "today"; id: string; label: string; icon: LucideIcon }
    | { kind: "placeholder"; id: string; label: string; icon: LucideIcon; hint?: string };

export type SidebarPageConfig = {
    label: string;
    actions: SidebarActionDescriptor[];
};

export const SIDEBAR_PAGES: Record<string, SidebarPageConfig> = {
    "/myHome": {
        label: "My calendar",
        actions: [
            { kind: "today", id: "today", label: "Go to today", icon: CalendarDays },
            { kind: "modal", id: "reserve", label: "Reserve a classroom", icon: CalendarPlus, target: "reservation" },
            { kind: "navigate", id: "reservations", label: "Manage reservations", icon: CalendarDays, to: "/manage-reservations" },
        ],
    },
    "/manage-reservations": {
        label: "Reservations",
        actions: [
            { kind: "modal", id: "new-reservation", label: "New class", icon: Plus, target: "reservation" },
            { kind: "navigate", id: "students", label: "Manage students", icon: GraduationCap, to: "/manage-students" },
            { kind: "navigate", id: "calendar", label: "View calendar", icon: CalendarDays, to: "/myHome" },
        ],
    },
    "/manage-students": {
        label: "Students",
        actions: [
            { kind: "modal", id: "new-student", label: "Add a student", icon: UserPlus, target: "student", adminOnly: true },
            { kind: "navigate", id: "reservations", label: "Manage reservations", icon: CalendarPlus, to: "/manage-reservations" },
            { kind: "navigate", id: "calendar", label: "View calendar", icon: CalendarDays, to: "/myHome" },
        ],
    },
    "/manage-users": {
        label: "Users",
        actions: [
            { kind: "modal", id: "new-user", label: "Add user", icon: UserPlus, target: "user" },
            { kind: "navigate", id: "reservations", label: "Manage reservations", icon: CalendarPlus, to: "/manage-reservations" },
            { kind: "navigate", id: "calendar", label: "View calendar", icon: CalendarDays, to: "/myHome" },
        ],
    },
};
