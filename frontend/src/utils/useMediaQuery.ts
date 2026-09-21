import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() =>
        typeof window !== "undefined" ? window.matchMedia(query).matches : false,
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const handleChange = () => setMatches(mediaQuery.matches);

        handleChange();
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [query]);

    return matches;
}

export const DESKTOP_QUERY = "(min-width: 1024px)";

export const useIsDesktop = () => useMediaQuery(DESKTOP_QUERY);

export const useIsMobile = () => !useIsDesktop();
