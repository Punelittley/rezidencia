const http = require("http")
const fs = require("fs")
const path = require("path")

const PORT = process.env.PORT || 3000
const ROOT = __dirname

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0])
  if (urlPath === "/") urlPath = "/index.html"

  // Try root first, then the public/ directory (for assets like /images/*)
  const candidates = [path.join(ROOT, urlPath), path.join(ROOT, "public", urlPath)]

  const send = (i) => {
    if (i >= candidates.length) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" })
      res.end("<h1>404 — Not Found</h1>")
      return
    }
    const filePath = candidates[i]
    // Prevent path traversal
    if (!filePath.startsWith(ROOT)) {
      send(i + 1)
      return
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        send(i + 1)
        return
      }
      const ext = path.extname(filePath).toLowerCase()
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" })
      res.end(data)
    })
  }
  send(0)
})

server.listen(PORT, () => {
  console.log(`[v0] Keratin.Residence running on http://localhost:${PORT}`)
})
