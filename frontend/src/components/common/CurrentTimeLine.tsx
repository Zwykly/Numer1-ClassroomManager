import { format } from "date-fns";
import { HOUR_HEIGHT, minutesFromTimelineStart } from "@/utils/calendarRange";
import { useCurrentTimeTicker } from "@/utils/CurrentTime";

export function CurrentTimeLine() {
    const now = useCurrentTimeTicker(60000);
    const minutesFromStart = minutesFromTimelineStart(now);
    if (minutesFromStart < 0) return null;
    const top = (minutesFromStart / 60) * HOUR_HEIGHT;
    return (
        <div className="z-20 w-full border-t-3 border-orange absolute" style={{ top: `${top}px` }}>
            <div className="w-16 text-end pr-1 font-semibold text-orange">{format(now, "HH:mm")}</div>
        </div>
    );
}
