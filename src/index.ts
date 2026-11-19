import { Hono } from "hono";
import { logger } from "hono/logger";
import { INFORMATIONAL_STATUSES, NULL_BODY_STATUSES, STATUS_TEXT } from "./statusCodes";
import { renderPage } from "./template";
import { clamp, sanitizeFilename } from "./utils";

const app = new Hono();

app.use("*", logger());

app.onError((err, c) => {
  console.error(err);
  return c.text("Internal Server Error", 500);
});

const INDEX_TITLE = "statuscode.app — HTTP Status Code Generator";
const INDEX_DESCRIPTION =
  "Generate any HTTP status code (100–511) on demand for testing monitoring services, webhooks, and error handling. Delay responses with ?sleep, inspect requests with /echo, or stub a file download with /download.";

app.get("/", (c) => c.html(renderPage(INDEX_TITLE, INDEX_DESCRIPTION)));

app.on("HEAD", "/", (c) => c.body(null, 200));

app.all("/echo", async (c) => {
  const url = new URL(c.req.url);

  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  let body: unknown = null;
  if (c.req.method !== "GET" && c.req.method !== "HEAD") {
    const rawBody = await c.req.text();
    if (rawBody) {
      const contentType = c.req.header("content-type") ?? "";
      if (contentType.includes("application/json")) {
        try {
          body = JSON.parse(rawBody);
        } catch {
          body = rawBody;
        }
      } else {
        body = rawBody;
      }
    }
  }

  return c.json({
    method: c.req.method,
    path: url.pathname,
    query,
    headers,
    body,
  });
});

const DEFAULT_DOWNLOAD_FILENAME = "download.txt";
const DEFAULT_DOWNLOAD_SIZE = 1024;
const MAX_DOWNLOAD_SIZE = 10 * 1024 * 1024; // 10 MiB
const DEFAULT_DOWNLOAD_CONTENT_TYPE = "application/octet-stream";
const DOWNLOAD_FILLER = "0123456789abcdef";

app.all("/download", (c) => {
  const filename = sanitizeFilename(c.req.query("filename") ?? DEFAULT_DOWNLOAD_FILENAME);
  const contentType = c.req.query("type") ?? DEFAULT_DOWNLOAD_CONTENT_TYPE;

  let size = DEFAULT_DOWNLOAD_SIZE;
  const sizeParam = c.req.query("size");
  if (sizeParam !== undefined) {
    const parsedSize = Number.parseInt(sizeParam, 10);
    if (Number.isNaN(parsedSize)) {
      throw new Error(`invalid size value: ${sizeParam}`);
    }
    size = clamp(parsedSize, 0, MAX_DOWNLOAD_SIZE);
  }

  const body = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    body[i] = DOWNLOAD_FILLER.charCodeAt(i % DOWNLOAD_FILLER.length);
  }

  c.header("Content-Type", contentType);
  c.header("Content-Disposition", `attachment; filename="${filename}"`);
  return c.body(body, 200);
});

app.all("/ip", (c) => {
  const ip = c.req.header("cf-connecting-ip");
  if (!ip) {
    return c.text("cf-connecting-ip header not present", 500);
  }
  return c.text(ip);
});

app.all("/:code{[0-9]+}", async (c) => {
  const sleepParam = c.req.query("sleep");
  if (sleepParam !== undefined) {
    const sleepMs = Number.parseInt(sleepParam, 10);
    if (Number.isNaN(sleepMs)) {
      throw new Error(`invalid sleep value: ${sleepParam}`);
    }
    const clampedMs = clamp(sleepMs, 0, 5000);
    await new Promise((resolve) => setTimeout(resolve, clampedMs));
  }

  const code = Number.parseInt(c.req.param("code"), 10);
  const text = STATUS_TEXT[code];
  if (text === undefined) {
    return c.notFound();
  }

  if (INFORMATIONAL_STATUSES.has(code)) {
    return new Response(
      `Cannot send a final ${code} ${text} response: the Fetch API only allows response statuses in the 200-599 range, so Cloudflare Workers cannot emit informational 1xx statuses as a final response.`,
      { status: 501 }
    );
  }

  if (NULL_BODY_STATUSES.has(code)) {
    return new Response(null, { status: code });
  }

  return new Response(text, { status: code });
});

export default app;
