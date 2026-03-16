import { Topbar } from "../components/Topbar";
import { HeroButtons } from "../components/HeroButtons";
import { WelcomeBanner } from "../components/WelcomeBanner";

export function Home() {
    return (
        <div className="w-full h-full flex flex-col">
            <Topbar />
            <WelcomeBanner />
            <HeroButtons />
        </div>
    );
}