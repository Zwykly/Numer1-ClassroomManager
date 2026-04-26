import { useCurrentTime, useCurrentTimeActions } from "../stores/useCurrentTimeStore";
import { useEffect } from "react";

export function useCurrentTimeTicker(interval = 60000) {
    const { setCurrentTime } = useCurrentTimeActions();

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, interval);

        return () => clearInterval(timerId);
    }, [interval, setCurrentTime]);

    return useCurrentTime();
}