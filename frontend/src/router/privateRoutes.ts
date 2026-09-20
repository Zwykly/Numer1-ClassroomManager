import { Home } from "../pages/Home";
import { ManageClassrooms } from "../pages/ManageClassrooms";
import { ManageGroups } from "../pages/ManageGroups";
import { ManageReservations } from "../pages/ManageReservations";
import { ManageStudents } from "../pages/ManageStudents";
import { ManageUsers } from "../pages/ManageUsers";

export const privateRoutes = [
    {
        path: "/myHome",
        element: Home,
        adminOnly: false,
    },
    {
        path: "/manage-reservations",
        element: ManageReservations,
        adminOnly: false,
    },
    {
        path: "/manage-students",
        element: ManageStudents,
        adminOnly: false,
    },
    {
        path: "/manage-groups",
        element: ManageGroups,
        adminOnly: false,
    },
    {
        path: "/manage-classrooms",
        element: ManageClassrooms,
        adminOnly: true,
    },
    {
        path: "/manage-users",
        element: ManageUsers,
        adminOnly: true,
    },
];
