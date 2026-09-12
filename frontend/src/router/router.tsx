import { createBrowserRouter, type RouteObject } from "react-router";
import { publicRoutes } from "./publicRoutes";
import { privateRoutes } from "./privateRoutes";
import { ProtectedRoutes, OpenRoutes } from "../utils/RouteTypes";

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
    children: privateRoutes.map((route) => ({
      path: route.path,
      element: <route.element />,
    })),
  },
];

export const router = createBrowserRouter(routes);
