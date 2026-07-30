import { serveDir } from "@std/http/file-server";

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  const fileResponse = await serveDir(req, {
    fsRoot: "./dist",
    quiet: true,
  });

  // Favicon often cached aggressively; force revalidation so updates appear after deploy
  if (
    fileResponse.ok &&
    (url.pathname === "/favicon.png" ||
      url.pathname === "/favicon.svg" ||
      url.pathname === "/favicon.ico")
  ) {
    const headers = new Headers(fileResponse.headers);
    headers.set("Cache-Control", "no-cache, must-revalidate");
    return new Response(fileResponse.body, {
      status: fileResponse.status,
      statusText: fileResponse.statusText,
      headers,
    });
  }

  if (fileResponse.status === 404) {
    try {
      const indexHtml = await Deno.readFile("./dist/index.html");
      return new Response(indexHtml, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } catch {
      return new Response("Frontend not built. Run npm run build.", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }

  return fileResponse;
}

const port = Number(Deno.env.get("PORT")) || 4321;
Deno.serve({ port }, handler);
