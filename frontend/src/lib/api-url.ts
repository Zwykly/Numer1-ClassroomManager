// Runtime configuration injected by the frontend server into index.html. This
// lets the same image target any domain simply by setting BUN_PUBLIC_API_URL.
const runtimeApiUrl =
    typeof window !== "undefined" ? (window as { __API_URL__?: string }).__API_URL__ : undefined;

const explicitApiUrl =
    runtimeApiUrl && runtimeApiUrl.length > 0
        ? runtimeApiUrl
        : import.meta.env?.BUN_PUBLIC_API_URL;

function resolveApiUrl(): string {
    if (explicitApiUrl && explicitApiUrl.length > 0) {
        return explicitApiUrl.replace(/\/$/, "");
    }

    if (typeof window !== "undefined") {
        return `${window.location.protocol}//${window.location.hostname}:3000`;
    }

    return "http://localhost:3000";
}

export const API_URL = resolveApiUrl();
