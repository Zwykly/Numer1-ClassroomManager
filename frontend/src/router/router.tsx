import { createBrowserRouter, type RouteObject } from "react-router";
import { publicRoutes } from "./publicRoutes";
import { privateRoutes } from "./privateRoutes";
import { ProtectedRoutes, OpenRoutes, AdminRoutes } from "../utils/RouteTypes";
import { AppLayout } from "../components/AppLayout";

const standardRoutes = privateRoutes.filter((route) => !route.adminOnly);
const adminOnlyRoutes = privateRoutes.filter((route) => route.adminOnly);

const routes: RouteObject[] = [
  {
    element: <OpenRoutes />,
    children: publicRoutes.map((route) => ({
      path: route.path,
      element: <route.element />,
    })),
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <AppLayout />,
        children: standardRoutes.map((route) => ({
          path: route.path,
          element: <route.element />,
        })),
      },
    ],
  },
  {
    element: <AdminRoutes />,
    children: [
      {
        element: <AppLayout />,
        children: adminOnlyRoutes.map((route) => ({
          path: route.path,
          element: <route.element />,
        })),
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
