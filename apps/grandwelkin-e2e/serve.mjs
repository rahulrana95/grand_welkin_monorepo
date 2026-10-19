// Minimal static file server for the e2e web server — no deps, so it runs in the
// Playwright CI container without relying on python. Serves apps/grandwelkin.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "grandwelkin");
const PORT = Number(process.env.PORT ?? process.env.PW_PORT ?? 4330);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent((req.url ?? "/").split("?")[0]);
    if (path.endsWith("/")) path += "index.html";
    const rel = normalize(path).replace(/^(\.\.[/\\])+/, "");
    const file = join(ROOT, rel);
    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    const body = await readFile(file);
    const ext = rel.slice(rel.lastIndexOf("."));
    res.writeHead(200, { "content-type": TYPES[ext] ?? "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(PORT, "127.0.0.1", () => console.log(`serving apps/grandwelkin on http://127.0.0.1:${PORT}`));
