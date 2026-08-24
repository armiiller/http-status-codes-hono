import { Hono } from "hono";
import { logger } from "hono/logger";
import { marked } from "marked";
import { STATUS_TEXT } from "./statusCodes";
import { INDEX_MARKDOWN } from "./content";
import { renderPage } from "./template";

const app = new Hono();

// The Fetch API's Response constructor enforces two restrictions the
// original Go/Gin service didn't have to worry about, so these codes need
// special-cased handling below:
//  - status must be in [200, 599], so a final 1xx status can't be sent at all
//  - 204/205/304 are "null body" statuses and reject any response body
const NULL_BODY_STATUSES = new Set([204, 205, 304]);
const INFORMATIONAL_STATUSES = new Set([100, 101, 102, 103]);

function clamp(value: number, minimum: number, maximum: number): number {
  if (value < minimum) return minimum;
  if (value > maximum) return maximum;
  return value;
}

app.use("*", logger());

app.onError((err, c) => {
  console.error(err);
  return c.text("Internal Server Error", 500);
});

app.get("/", async (c) => {
  const contentHtml = await marked.parse(INDEX_MARKDOWN);
  return c.html(renderPage("statuscode.app", contentHtml));
});

app.on("HEAD", "/", (c) => c.body(null, 200));

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
