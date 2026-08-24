# HTTP Status Codes (Hono)

A service for generating HTTP codes, running on Cloudflare Workers via [Hono](https://hono.dev).

It's useful for testing monitoring services. Point your app at this service and append the status code you want to test, then make a request and it'll return that for you.

This is a Cloudflare Workers port of [armiiller/http-status-codes](https://github.com/armiiller/http-status-codes) (originally Go/Gin on Fly.io). Functionality is a 1:1 replica with two documented exceptions forced by the Fetch API spec that Workers implements — see [Platform differences](#platform-differences) below.

## Usage

- `GET/POST/.../ /:code` — returns that HTTP status with the standard reason phrase as the body, e.g. `/404` → `404 Not Found`.
- `?sleep=<ms>` — delays the response by `ms` milliseconds, clamped to `[0, 5000]`.
- `GET /` — renders the supported status code list.

## Development

```bash
npm install
npm run css     # builds public/app.css from src/app.css via Tailwind
npm run dev      # wrangler dev
```

## Deploy

```bash
npm run css
npm run deploy
```

## Platform differences

The Fetch API's `Response` constructor (which Workers implements per-spec) enforces two rules the original Go service didn't have to deal with:

- **1xx codes (`/100`, `/101`, `/102`, `/103`)** — a `Response` can't be constructed with a status below 200 at all, so a Worker can't emit a final informational status. These routes return `501 Not Implemented` with an explanatory body instead of 500ing.
- **Null-body statuses (`/204`, `/205`, `/304`)** — a `Response` with one of these statuses can't carry a body. These routes return the correct status code with an empty body instead of the reason phrase text.

Every other supported code (200–511, including edge cases like `306`, which has no defined reason phrase and returns an empty body by design — matching Go's `net/http.StatusText`) behaves identically to the original.
