import { Topbar } from "../components/Topbar";
import { HeroButtons } from "../components/HeroButtons";
import { WelcomeBanner } from "../components/WelcomeBanner";
import { useAuth } from "@/utils/AuthProvider";


export function Home() {
    const { user } = useAuth();
    console.log(user);
    return (
        <div className="w-full h-full flex flex-col">
            <Topbar />
            <WelcomeBanner user={user} />
            <HeroButtons />
        </div>
    );
}