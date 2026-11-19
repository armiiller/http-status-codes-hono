import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { SUPPORTED_STATUS_CODES } from "../src/statusCodes";

describe("GET /", () => {
  it("renders the index page as HTML", async () => {
    const response = await SELF.fetch("https://example.com/");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");

    const html = await response.text();
    expect(html).toContain("<title>statuscode.app — HTTP Status Code Generator</title>");
    expect(html).toContain('<meta name="description"');
    expect(html).toContain('<link rel="canonical" href="https://statuscode.app/" />');
    expect(html).toContain('<meta property="og:title" content="statuscode.app — HTTP Status Code Generator">');
    expect(html).toContain('id="tester"');
    expect(html).toContain('<a class="code-num c2" href="/200">200</a>');
    expect(html).toContain('<a class="code-num c4" href="/404">404</a>');
    expect(html).toContain('<a href="/echo">');
    expect(html).toContain('href="/download?filename=report.csv');
  });

  it("lists every supported status code with a link", async () => {
    const html = await (await SELF.fetch("https://example.com/")).text();
    for (const code of SUPPORTED_STATUS_CODES) {
      expect(html).toContain(`href="/${code}">${code}</a>`);
    }
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
