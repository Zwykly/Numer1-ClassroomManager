import { useAuth } from "./AuthProvider";
import { Outlet, Navigate } from "react-router";

export function ProtectedRoutes() {
    const { UserData } = useAuth();
    return UserData ? <Outlet /> : <Navigate to="/" replace />
}
export function AdminRoutes() {
    const { UserData } = useAuth();
    if (!UserData) return <Navigate to="/" replace />
    if (UserData.user?.userInfo?.role !== "admin") return <Navigate to="/myHome" replace />
    return <Outlet />
}
export function OpenRoutes() {
    const { UserData } = useAuth();
    return !UserData ? <Outlet /> : <Navigate to="/myHome" replace />
}