import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("/download", () => {
  it("returns a default-sized attachment with default filename and content type", async () => {
    const response = await SELF.fetch("https://example.com/download");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/octet-stream");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="download.txt"');

    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(bytes.length).toBe(1024);
  });

  it("honors filename, size, and type query params", async () => {
    const response = await SELF.fetch("https://example.com/download?filename=report.csv&size=10&type=text/csv");
    expect(response.headers.get("content-type")).toBe("text/csv");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="report.csv"');

    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(bytes.length).toBe(10);
  });

  it("clamps size to the maximum", async () => {
    const response = await SELF.fetch("https://example.com/download?size=999999999999");
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(bytes.length).toBe(10 * 1024 * 1024);
  });

  it("strips quotes and control characters from the filename", async () => {
    const response = await SELF.fetch(`https://example.com/download?${new URLSearchParams({ filename: 'evil".txt' }).toString()}`);
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="evil.txt"');
  });

  it("rejects a non-numeric size", async () => {
    const response = await SELF.fetch("https://example.com/download?size=abc");
    expect(response.status).toBe(500);
  });

  it("responds to HEAD requests", async () => {
    const response = await SELF.fetch("https://example.com/download", { method: "HEAD" });
    expect(response.status).toBe(200);
  });
});
