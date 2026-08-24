import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("/echo", () => {
  it("echoes method, path, query params, and headers for a GET with no body", async () => {
    const response = await SELF.fetch("https://example.com/echo?foo=bar&baz=qux", {
      headers: { "X-Test": "hello" },
    });
    expect(response.status).toBe(200);
    const json = await response.json<{
      method: string;
      path: string;
      query: Record<string, string>;
      headers: Record<string, string>;
      body: unknown;
    }>();

    expect(json.method).toBe("GET");
    expect(json.path).toBe("/echo");
    expect(json.query).toEqual({ foo: "bar", baz: "qux" });
    expect(json.headers["x-test"]).toBe("hello");
    expect(json.body).toBeNull();
  });

  it("parses a JSON body when content-type is application/json", async () => {
    const response = await SELF.fetch("https://example.com/echo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: 1, b: "two" }),
    });
    const json = await response.json<{ body: unknown }>();
    expect(json.body).toEqual({ a: 1, b: "two" });
  });

  it("returns the raw text body for non-JSON content types", async () => {
    const response = await SELF.fetch("https://example.com/echo", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "hello world",
    });
    const json = await response.json<{ body: unknown }>();
    expect(json.body).toBe("hello world");
  });

  it("falls back to the raw text when the body claims to be JSON but isn't", async () => {
    const response = await SELF.fetch("https://example.com/echo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not valid json",
    });
    const json = await response.json<{ body: unknown }>();
    expect(json.body).toBe("{not valid json");
  });

  it("responds to non-GET/POST methods too", async () => {
    const response = await SELF.fetch("https://example.com/echo", { method: "DELETE" });
    const json = await response.json<{ method: string }>();
    expect(response.status).toBe(200);
    expect(json.method).toBe("DELETE");
  });
});
