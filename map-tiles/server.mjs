// server.mjs: run with  ATMOSPORE_API_KEY=your-key node server.mjs
import http from "node:http";
import { readFile } from "node:fs/promises";

let cached = null;
let fetchedAt = 0;

// Ask Atmospore for fresh tile links at most once an hour.
// Each call counts as one API request; the tiles themselves are free.
async function pollenTiles() {
  if (cached && Date.now() - fetchedAt < 60 * 60 * 1000) return cached;
  const res = await fetch("https://pollenapi.com/v1/map-tiles", {
    headers: { "x-api-key": process.env.ATMOSPORE_API_KEY },
  });
  if (!res.ok) throw new Error(`Atmospore answered ${res.status}`);
  cached = await res.json();
  fetchedAt = Date.now();
  return cached;
}

http.createServer(async (req, res) => {
  try {
    if (req.url === "/pollen-tiles") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(await pollenTiles()));
    } else {
      res.setHeader("Content-Type", "text/html");
      res.end(await readFile("index.html"));
    }
  } catch (err) {
    res.statusCode = 502;
    res.end(String(err));
  }
}).listen(3000, () => console.log("Open http://localhost:3000"));
