import { useAuth } from "./AuthProvider";
import { Outlet, Navigate } from "react-router-dom";

export function ProtectedRoutes() {
    const { UserData } = useAuth();
    return UserData ? <Outlet /> : <Navigate to="/" replace />
}
export function OpenRoutes() {
    const { UserData } = useAuth();
    return !UserData ? <Outlet /> : <Navigate to="/myHome" replace />
}
export function AdminRoutes() {
    const { UserData } = useAuth();
    const isAdmin = UserData?.user.userInfo?.role === "admin";
    return isAdmin ? <Outlet /> : <Navigate to="/myHome" replace />
}