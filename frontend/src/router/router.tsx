import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import { privateRoutes } from "./privateRoutes";
import { ProtectedRoutes, OpenRoutes } from "../utils/RouteTypes";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<OpenRoutes />}>
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={<route.element />} />
      ))}
      </Route>
      <Route element={<ProtectedRoutes />}>
        {privateRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={<route.element />} />
        ))}
      </Route >
    </>
  )
);

