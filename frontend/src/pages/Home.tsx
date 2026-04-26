import { Topbar } from "../components/Topbar";
import { HeroButtons } from "../components/HeroButtons";
import { WelcomeBanner } from "../components/WelcomeBanner";
import { useAuth } from "@/utils/AuthProvider";
import type { UserInfo } from "@/utils/models";
import { Sidebar } from "../components/Sidebar";
import { TimelineView } from "../components/common/TimelineView";



export function Home() {
    const { UserData } = useAuth();

    return (
        <div className="w-full h-screen flex flex-row">
            <Sidebar />
            <TimelineView />
        </div>
    );
}