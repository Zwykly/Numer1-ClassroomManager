import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
    return (
        <div className="flex h-screen w-full flex-row overflow-hidden">
            <Sidebar />
            <main className="flex h-screen w-full flex-col overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
}
