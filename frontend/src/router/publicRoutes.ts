import { Login } from "../pages/Login";
import { Register } from "../pages/Register";

export const publicRoutes = [
    {
        path: "/",
        element: Login,
    },
    {
        path: "/register",
        element: Register,
    },
];
