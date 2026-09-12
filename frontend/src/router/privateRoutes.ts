import { Home } from "../pages/Home";
import { ManageStudents } from "../pages/ManageStudents";
import { ManageUsers } from "../pages/ManageUsers";

export const privateRoutes = [
    {
        path: "/myHome",
        element: Home,
        adminOnly: false,
    },
    {
        path: "/manage-students",
        element: ManageStudents,
        adminOnly: false,
    },
    {
        path: "/manage-users",
        element: ManageUsers,
        adminOnly: true,
    },
];
