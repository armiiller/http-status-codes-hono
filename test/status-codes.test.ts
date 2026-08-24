import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { STATUS_TEXT, SUPPORTED_STATUS_CODES } from "../src/statusCodes";

const NULL_BODY_STATUSES = new Set([204, 205, 304]);
const INFORMATIONAL_STATUSES = new Set([100, 101, 102, 103]);

const ORDINARY_CODES = SUPPORTED_STATUS_CODES.filter(
  (code) => !NULL_BODY_STATUSES.has(code) && !INFORMATIONAL_STATUSES.has(code)
);

describe("ordinary status codes", () => {
  it.each(ORDINARY_CODES)("GET /%i returns that status with its reason phrase as the body", async (code) => {
    const response = await SELF.fetch(`https://example.com/${code}`);
    expect(response.status).toBe(code);
    expect(await response.text()).toBe(STATUS_TEXT[code]);
  });

  it("306 has no defined reason phrase, matching Go's net/http.StatusText", async () => {
    const response = await SELF.fetch("https://example.com/306");
    expect(response.status).toBe(306);
    expect(await response.text()).toBe("");
  });

  it("supports non-GET methods on the same route", async () => {
    for (const method of ["POST", "PUT", "DELETE", "PATCH"]) {
      const response = await SELF.fetch("https://example.com/201", { method });
      expect(response.status).toBe(201);
      expect(await response.text()).toBe("Created");
    }
  });
});

describe("informational (1xx) status codes", () => {
  it.each([100, 101, 102, 103])(
    "GET /%i returns 501 explaining the Fetch API can't emit a final 1xx status",
    async (code) => {
      const response = await SELF.fetch(`https://example.com/${code}`);
      expect(response.status).toBe(501);
      const body = await response.text();
      expect(body).toContain(String(code));
      expect(body).toContain(STATUS_TEXT[code]);
    }
  );
});

describe("null-body status codes", () => {
  it.each([204, 205, 304])("GET /%i returns that status with an empty body", async (code) => {
    const response = await SELF.fetch(`https://example.com/${code}`);
    expect(response.status).toBe(code);
    expect(await response.text()).toBe("");
  });
});

describe("unsupported codes", () => {
  it("returns 404 for a numeric code that isn't in the supported list", async () => {
    const response = await SELF.fetch("https://example.com/999");
    expect(response.status).toBe(404);
  });

  it("returns 404 for a non-numeric path", async () => {
    const response = await SELF.fetch("https://example.com/not-a-code");
    expect(response.status).toBe(404);
  });
});

describe("sleep query param", () => {
  it("delays the response by the requested number of milliseconds", async () => {
    const start = Date.now();
    const response = await SELF.fetch("https://example.com/200?sleep=200");
    const elapsed = Date.now() - start;
    expect(response.status).toBe(200);
    expect(elapsed).toBeGreaterThanOrEqual(190);
  });

  it("returns 500 for a non-numeric sleep value", async () => {
    const response = await SELF.fetch("https://example.com/200?sleep=abc");
    expect(response.status).toBe(500);
  });

  it("proceeds normally when sleep is absent", async () => {
    const response = await SELF.fetch("https://example.com/200");
    expect(response.status).toBe(200);
  });
});
