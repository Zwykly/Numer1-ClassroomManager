/**
 * Production server for the built frontend (dist/).
 *
 * Serves the static bundle with an SPA fallback and injects the runtime API URL
 * from BUN_PUBLIC_API_URL into the HTML, so the same image works on any domain
 * without being rebuilt.
 */
import { serve } from "bun";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const port = Number(Bun.env.PORT ?? 3030);
const apiUrl = Bun.env.BUN_PUBLIC_API_URL ?? "";
const distDir = join(import.meta.dir, "dist");

const rawIndex = await readFile(join(distDir, "index.html"), "utf8");
const runtimeConfig = `<script>window.__API_URL__ = ${JSON.stringify(apiUrl)};</script>`;
const indexHtml = rawIndex.replace("</head>", `${runtimeConfig}</head>`);

function htmlResponse() {
  return new Response(indexHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

const server = serve({
  hostname: "0.0.0.0",
  port,

  async fetch(request) {
    const pathname = decodeURIComponent(new URL(request.url).pathname);

    if (pathname === "/" || pathname === "/index.html") {
      return htmlResponse();
    }

    // Prevent path traversal by keeping the request inside dist/.
    const relativePath = pathname.replace(/^\/+/, "").replace(/\.\.(\/|\\)/g, "");
    if (relativePath.length > 0) {
      const filePath = join(distDir, relativePath);
      try {
        const info = await stat(filePath);
        if (info.isFile()) {
          return new Response(Bun.file(filePath));
        }
      } catch {
        // fall through to the SPA fallback
      }
    }

    // Unknown path: let the React router handle it client-side.
    return htmlResponse();
  },
});

console.log(`🚀 Frontend running at ${server.url}`);
console.log(`   API base URL: ${apiUrl || "(same host, port 3000)"}`);
