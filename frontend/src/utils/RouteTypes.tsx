import { useAuth } from "./AuthProvider";
import { Outlet, Navigate } from "react-router-dom";

export function ProtectedRoutes() {
    const { session } = useAuth();
    return session ? <Outlet /> : <Navigate to="/" replace />
}
export function OpenRoutes() {
    const { session } = useAuth();
    return !session ? <Outlet /> : <Navigate to="/myHome" replace />
}