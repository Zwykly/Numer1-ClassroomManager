import { Topbar } from "../components/Topbar";
import { HeroButtons } from "../components/HeroButtons";
import { WelcomeBanner } from "../components/WelcomeBanner";
import { useAuth } from "@/utils/AuthProvider";
import type { UserInfo } from "@/utils/models";
import { Sidebar } from "../components/Sidebar";


export function Home() {
    const { UserData } = useAuth();
    return (
        <div className="w-full h-full flex flex-row">
            <Sidebar />
            <div className="w-full h-full flex flex-col">
                <WelcomeBanner userInfo={UserData?.user?.userInfo} />
                <HeroButtons />
            </div>
        </div>
    );
}