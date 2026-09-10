import { INFORMATIONAL_STATUSES, NULL_BODY_STATUSES, STATUS_TEXT, SUPPORTED_STATUS_CODES } from "./statusCodes";

const INTRO = `# HTTP Status Codes 🤠
A service for generating HTTP codes.

It's useful for testing monitoring services.

Just add the status code you want to the end of the URL, like this: [https://statuscode.app/200](https://statuscode.app/200)

If you want to delay a response add the query parameter **sleep** and specify the duration in milliseconds (maximum: 5000). Example: [https://statuscode.app/200?sleep=5000](https://statuscode.app/200?sleep=5000)`;

const EXTRA_ENDPOINTS = `## Extra Endpoints
Beyond status codes, a few other routes are useful for testing:

| Path | Description |
| ---- | ----------- |
| [/echo](/echo) | Accepts any method and returns a JSON summary of what it received: method, path, query params, headers, and body. |
| [/ip](/ip) | Accepts any method and returns your connecting IP address as plain text, read from the **CF-Connecting-IP** header Cloudflare sets on every request. |
| [/download](/download) | Returns a dummy file as an attachment for testing download handling. Customize with query params: **filename** (default \`download.txt\`), **size** in bytes (default 1024, max 10 MiB), and **type** for the Content-Type header (default \`application/octet-stream\`). Example: [/download?filename=report.csv&size=2048&type=text/csv](/download?filename=report.csv&size=2048&type=text/csv) |`;

const STATUS_CATEGORIES = `---
| Code | Category | Description |
| ---- | -------- | ----------- |
| 1xx | Informational | Request received, continuing process |
| 2xx | Success | The action was successfully received, understood, and accepted |
| 3xx | Redirection | Further action must be taken in order to complete the request |
| 4xx | Client Error | The request contains bad syntax or cannot be fulfilled |
| 5xx | Server Error | The server failed to fulfill an apparently valid request |

Please see the [IANA website](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml) for all available codes and details.

---`;

// STATUS_TEXT holds the exact reason phrase this service serves in the
// response body, which is intentionally blank for 306 (see statusCodes.ts).
// This override just gives 306 a human-readable name in the docs table.
const STATUS_DESCRIPTION_OVERRIDES: Record<number, string> = {
  306: "Switch Proxy",
};

function describeStatus(code: number): string {
  return STATUS_DESCRIPTION_OVERRIDES[code] ?? STATUS_TEXT[code];
}

function noteForStatus(code: number): string {
  if (INFORMATIONAL_STATUSES.has(code)) return "Returns 501 instead — see note below";
  if (NULL_BODY_STATUSES.has(code)) return "Empty body — see note below";
  return "";
}

function buildStatusCodeTable(): string {
  const rows = SUPPORTED_STATUS_CODES.map(
    (code) => `| [${code}](/${code}) | ${describeStatus(code)} | ${noteForStatus(code)} |`
  );
  return ["## Supported Status Codes", "| Code | Description | Notes |", "| ---- | ----------- | ----- |", ...rows].join(
    "\n"
  );
}

const PLATFORM_LIMITATIONS = `### Platform limitations

This service runs on Cloudflare Workers, which implements the Fetch API's \`Response\` object rules. Two groups of codes can't be emitted exactly as specced because of that:

1. **100, 101, 102, 103** — the Fetch API forbids constructing a \`Response\` with a status below 200 at all, so a final 1xx status can't be sent. These routes return \`501 Not Implemented\` with an explanatory body instead.
2. **204, 205, 304** — the Fetch API forbids a body on these "null body" statuses. These routes return the correct status code with an empty body instead of the reason phrase text.

Every other code behaves exactly as documented above, including \`306\`, which has no defined reason phrase (matching Go's \`net/http.StatusText\`) and returns an empty body by design.`;

const FOOTER = `---
Created by [Austin Miller](https://austinmiller.dev), Hosted on [Cloudflare Workers](https://workers.cloudflare.com), Open Sourced on [Github](https://github.com/armiiller/http-status-codes-hono).

We don't capture or store any data about the requests you make.`;

export const INDEX_MARKDOWN =
  [INTRO, EXTRA_ENDPOINTS, STATUS_CATEGORIES, buildStatusCodeTable(), PLATFORM_LIMITATIONS, FOOTER].join("\n\n") + "\n";
