import { create } from "zustand/react";

type CurrentTimeState = {
    currentTime: Date;
    actions: {
        setCurrentTime: (time: Date) => void;
    }
}
export const useCurrentTimeStore = create<CurrentTimeState>()((set) => ({
    currentTime: new Date(),
    actions: {
        setCurrentTime: (time: Date) => set({ currentTime: time }),
    }
}));

export const useCurrentTime = () => useCurrentTimeStore((state) => state.currentTime);
export const useCurrentTimeActions = () => useCurrentTimeStore((state) => state.actions);