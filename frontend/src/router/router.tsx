import { createBrowserRouter, type RouteObject } from "react-router";
import { publicRoutes } from "./publicRoutes";
import { privateRoutes } from "./privateRoutes";
import { adminRoutes } from "./adminRoutes";
import { ProtectedRoutes, OpenRoutes, AdminRoutes } from "../utils/RouteTypes";

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
        element: <AdminRoutes />,
        children: adminRoutes.map((route) => ({
          path: route.path,
          element: <route.element />,
        })),
      },
      ...privateRoutes.map((route) => ({
        path: route.path,
        element: <route.element />,
      })),
    ],
  },
];

export const router = createBrowserRouter(routes);
