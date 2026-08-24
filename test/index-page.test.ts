import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("GET /", () => {
  it("renders the index page as HTML", async () => {
    const response = await SELF.fetch("https://example.com/");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");

    const html = await response.text();
    expect(html).toContain("<title>statuscode.app</title>");
    expect(html).toContain("markdown-body");
    expect(html).toContain('<a href="/200">200</a>');
    expect(html).toContain('<a href="/echo">/echo</a>');
  });
});

describe("HEAD /", () => {
  it("returns 200 with no body", async () => {
    const response = await SELF.fetch("https://example.com/", { method: "HEAD" });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
  });
});

// robots.txt, app.css, and favicon.ico are served by the Workers Static
// Assets platform layer in front of the Worker script (verified manually
// via `wrangler dev`), not by any code in this repo, so there's nothing
// here for the test harness — which only runs the Worker script in
// isolation — to meaningfully exercise.
