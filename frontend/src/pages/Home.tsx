import { Topbar } from "../components/Topbar";
import { HeroButtons } from "../components/HeroButtons";
import { WelcomeBanner } from "../components/WelcomeBanner";
import { useAuth } from "@/utils/AuthProvider";
import type { UserInfo } from "@/utils/models";
import { Sidebar } from "../components/Sidebar";
import { TimelineView } from "../components/common/TimelineView";
import { TimelineSelector } from "../components/common/TimelineSelector";



export function Home() {
    const { UserData } = useAuth();

    return (
        <div className="w-full h-screen flex flex-row">
            <Sidebar />
            <div className="h-screen flex flex-col w-full">
                <TimelineSelector/>
                <TimelineView />        
            </div>

        </div>
    );
}