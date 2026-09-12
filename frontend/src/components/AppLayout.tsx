import { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { Drawer } from "./common/Drawer";
import { ActionModalsHost } from "./ActionModalsHost";

export function AppLayout() {
    const [navOpen, setNavOpen] = useState(false);

    return (
        <div className="flex h-dvh w-full flex-row overflow-hidden">
            <Sidebar className="hidden lg:flex lg:w-[280px]" />

            <Drawer open={navOpen} onOpenChange={setNavOpen}>
                <Sidebar onNavigate={() => setNavOpen(false)} className="flex" />
            </Drawer>

            <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
                <MobileHeader onOpenNav={() => setNavOpen(true)} />
                <main className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-canvas">
                    <Outlet />
                </main>
            </div>

            <ActionModalsHost />
        </div>
    );
}
