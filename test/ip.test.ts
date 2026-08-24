import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("/ip", () => {
  it("echoes the CF-Connecting-IP header as plain text", async () => {
    const response = await SELF.fetch("https://example.com/ip", {
      headers: { "CF-Connecting-IP": "203.0.113.42" },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(await response.text()).toBe("203.0.113.42");
  });

  it("supports IPv6 addresses", async () => {
    const response = await SELF.fetch("https://example.com/ip", {
      headers: { "CF-Connecting-IP": "2001:db8::1" },
    });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("2001:db8::1");
  });

  it("responds to non-GET methods too", async () => {
    const response = await SELF.fetch("https://example.com/ip", {
      method: "POST",
      headers: { "CF-Connecting-IP": "198.51.100.7" },
    });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("198.51.100.7");
  });

  it("returns 500 when the header is missing", async () => {
    // Hono's fetch(input, init) always sets a Host header on the outgoing
    // request, but nothing synthesizes CF-Connecting-IP unless a real
    // Cloudflare edge (or Miniflare's local dev simulation) puts it there —
    // which SELF.fetch's in-process dispatch does not.
    const response = await SELF.fetch("https://example.com/ip");
    expect(response.status).toBe(500);
    expect(await response.text()).toBe("cf-connecting-ip header not present");
  });
});
