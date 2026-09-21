const runtimeApiUrl = typeof window !== "undefined" ? window.__API_URL__ : undefined;
const buildTimeApiUrl = import.meta.env?.BUN_PUBLIC_API_URL;

function resolveApiUrl(): string {
    const explicitApiUrl = runtimeApiUrl || buildTimeApiUrl;

    if (explicitApiUrl && explicitApiUrl.length > 0) {
        return explicitApiUrl.replace(/\/$/, "");
    }

    if (typeof window !== "undefined") {
        return `${window.location.protocol}//${window.location.hostname}:3000`;
    }

    return "http://localhost:3000";
}

export const API_URL = resolveApiUrl();
