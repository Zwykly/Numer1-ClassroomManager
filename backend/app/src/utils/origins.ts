// Central place for every allowed origin/ host.
//
// Extra origins can be supplied through the TRUSTED_ORIGINS environment
// variable as a comma separated list, e.g.
//   TRUSTED_ORIGINS="https://app.example.com,https://admin.example.com"

const LOCAL_NETWORK_ORIGIN =
    /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

// Origins that are always trusted so the app keeps working on a local machine
// or local network without any configuration.
const DEFAULT_TRUSTED_ORIGINS = [
    "http://localhost:3030",
    "http://zwykly.duckdns.org",
    "http://zwykly.duckdns.org:3030",
    "http://localhost:*",
    "http://127.0.0.1:*",
    "http://192.168.*",
    "http://10.*",
    "http://172.*",
];

// Hosts accepted by better-auth when building absolute URLs.
const DEFAULT_ALLOWED_HOSTS = [
    "localhost",
    "localhost:*",
    "127.0.0.1",
    "127.0.0.1:*",
    "192.168.*",
    "10.*",
    "172.*",
    "zwykly.duckdns.org",
    "zwykly.duckdns.org:*",
];

export function getConfiguredOrigins(): string[] {
    return (process.env.TRUSTED_ORIGINS ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
}

function originToHost(origin: string): string | null {
    try {
        return new URL(origin).host;
    } catch {
        return null;
    }
}

export function getAllowedOrigins(): string[] {
    return [...new Set([...DEFAULT_TRUSTED_ORIGINS, ...getConfiguredOrigins()])];
}

export function getAllowedHosts(): string[] {
    const hosts = getConfiguredOrigins()
        .map(originToHost)
        .filter((host): host is string => Boolean(host))
        .flatMap((host) => [host, `${host.split(":")[0]}:*`]);

    return [...new Set([...DEFAULT_ALLOWED_HOSTS, ...hosts])];
}

// Predicate used by the CORS plugin. A missing Origin header (same-origin
// requests, curl, health checks) is always allowed.
export function isOriginAllowed(origin?: string | null): boolean {
    if (!origin) return true;
    if (getAllowedOrigins().includes(origin)) return true;
    return LOCAL_NETWORK_ORIGIN.test(origin);
}
