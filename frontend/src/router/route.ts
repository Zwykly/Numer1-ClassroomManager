import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";

export const ROUTES = [
    {
        path: "/myHome",
        element: Home,
    },
    {
        path: "/",
        element: Login,
    },
        {
        path: "/register",
        element: Register,
    },
];
