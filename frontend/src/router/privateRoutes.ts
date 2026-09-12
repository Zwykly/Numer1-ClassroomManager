import { Home } from "../pages/Home";
import { ManageStudents } from "../pages/ManageStudents";

export const privateRoutes = [
    {
        path: "/myHome",
        element: Home,
    },
    {
        path: "/manage-students",
        element: ManageStudents,
    },
];
