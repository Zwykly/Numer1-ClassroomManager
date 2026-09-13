import { serve } from "bun";
import { networkInterfaces } from "node:os";
import index from "./index.html";

const port = Number(Bun.env.PORT ?? 3030);

const server = serve({
  hostname: "0.0.0.0",
  port,

  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

function getNetworkUrls(port: number): string[] {
  const urls: string[] = [];
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === "IPv4" && !address.internal) {
        urls.push(`http://${address.address}:${port}`);
      }
    }
  }
  return urls;
}

console.log(`🚀 Server running at ${server.url}`);
for (const url of getNetworkUrls(port)) {
  console.log(`   On your network: ${url}`);
}
