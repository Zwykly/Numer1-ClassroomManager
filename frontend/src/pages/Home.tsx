import { TimelineView } from "../components/common/TimelineView";
import { TimelineSelector } from "../components/common/TimelineSelector";

export function Home() {
    return (
        <div className="flex h-screen w-full flex-col bg-white">
            <TimelineSelector />
            <TimelineView />
        </div>
    );
}