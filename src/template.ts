import { COMMON_CODES, STATUS_CLASSES, STATUS_SUMMARY, noteForStatus, statusName } from "./content";

const SITE_URL = "https://statuscode.app";
const SITE_NAME = "statuscode.app";
const GITHUB_URL = "https://github.com/armiiller/http-status-codes-hono";

const PRESETS: Array<{ code: number; sleep?: number; label?: string }> = [
  { code: 200 },
  { code: 201 },
  { code: 301 },
  { code: 404 },
  { code: 429 },
  { code: 500 },
  { code: 503 },
  { code: 504, sleep: 3000, label: "504 + 3s delay" },
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function classKey(code: number): string {
  return `c${Math.floor(code / 100)}`;
}

const ICON_COPY = `<svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14"><path fill="currentColor" d="M5 1.5A1.5 1.5 0 0 1 6.5 0h7A1.5 1.5 0 0 1 15 1.5v7a1.5 1.5 0 0 1-1.5 1.5H12V8.5h1.5v-7h-7V3H5V1.5Z"/><path fill="currentColor" d="M1 6.5A1.5 1.5 0 0 1 2.5 5h7A1.5 1.5 0 0 1 11 6.5v7A1.5 1.5 0 0 1 9.5 15h-7A1.5 1.5 0 0 1 1 13.5v-7Zm1.5 0v7h7v-7h-7Z"/></svg>`;
const ICON_GITHUB = `<svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>`;

function copyButton(text: string, label: string): string {
  return `<button type="button" class="icon-btn" data-copy="${escapeHtml(text)}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">${ICON_COPY}</button>`;
}

function codeBlock(command: string): string {
  return `<div class="snippet"><pre><code>${escapeHtml(command)}</code></pre>${copyButton(command, "Copy command")}</div>`;
}

function renderPresets(): string {
  return PRESETS.map(({ code, sleep, label }) => {
    const sleepAttr = sleep !== undefined ? ` data-sleep="${sleep}"` : "";
    return `<button type="button" class="preset ${classKey(code)}" data-code="${code}"${sleepAttr}>${escapeHtml(label ?? `${code} ${statusName(code)}`)}</button>`;
  }).join("");
}

function renderCodeOptions(selected: number): string {
  return STATUS_CLASSES.map(
    (group) =>
      `<optgroup label="${group.key} ${escapeHtml(group.name)}">${group.codes
        .map((c) => `<option value="${c}"${c === selected ? " selected" : ""}>${c} ${escapeHtml(statusName(c))}</option>`)
        .join("")}</optgroup>`
  ).join("");
}

function renderStatusRow(code: number): string {
  const name = statusName(code);
  const note = noteForStatus(code);
  const noteHtml = note ? ` <a class="tag tag-warn" href="#limitations">${note}</a>` : "";
  const commonHtml = COMMON_CODES.has(code) ? ` <span class="tag">Common</span>` : "";
  const search = `${code} ${name} ${STATUS_SUMMARY[code]}`.toLowerCase();
  return `<li class="code-row" data-search="${escapeHtml(search)}">
          <a class="code-num ${classKey(code)}" href="/${code}">${code}</a>
          <div class="code-text">
            <div class="code-name">${escapeHtml(name)}${commonHtml}${noteHtml}</div>
            <p>${escapeHtml(STATUS_SUMMARY[code])}</p>
          </div>
          <div class="code-actions">
            <button type="button" class="btn btn-small" data-try="${code}">Try</button>
            ${copyButton(`${SITE_URL}/${code}`, `Copy URL for ${code}`)}
          </div>
        </li>`;
}

function renderStatusReference(): string {
  return STATUS_CLASSES.map(
    (group) => `<section class="code-group" data-group="${group.key}" aria-labelledby="group-${group.key}">
        <header class="code-group-head">
          <h3 id="group-${group.key}"><span class="dot ${classKey(group.codes[0])}"></span>${group.key} ${escapeHtml(group.name)}</h3>
          <p>${escapeHtml(group.summary)}</p>
        </header>
        <ul class="code-list">
        ${group.codes.map(renderStatusRow).join("\n        ")}
        </ul>
      </section>`
  ).join("\n      ");
}

function renderJsonLd(description: string): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Person", name: "Austin Miller", url: "https://austinmiller.dev" },
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const CLIENT_SCRIPT = `
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var origin = location.protocol === "file:" ? "${SITE_URL}" : location.origin;

  // ---- Copy buttons ----
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy]");
    if (!btn) return;
    var text = btn.getAttribute("data-copy");
    var done = function () {
      btn.classList.add("copied");
      setTimeout(function () { btn.classList.remove("copied"); }, 1200);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
  });

  // ---- Live tester ----
  var form = $("#tester");
  if (!form) return;
  var codeIn = $("#t-code"), sleepIn = $("#t-sleep"), methodIn = $("#t-method");
  var urlOut = $("#t-url"), curlBtn = $("#t-copy-curl"), urlBtn = $("#t-copy-url");
  var result = $("#t-result"), statusOut = $("#t-status"), timeOut = $("#t-time");
  var headersOut = $("#t-headers"), bodyOut = $("#t-body"), sendBtn = $("#t-send");

  function path() {
    var code = codeIn.value || "200";
    var sleep = parseInt(sleepIn.value, 10);
    var q = !isNaN(sleep) && sleep > 0 ? "?sleep=" + Math.min(sleep, 5000) : "";
    return "/" + code + q;
  }
  function curl() {
    var m = methodIn.value;
    return "curl " + (m === "HEAD" ? "-I " : "-i " + (m === "GET" ? "" : "-X " + m + " ")) + "'" + origin + path() + "'";
  }
  function sync() {
    urlOut.textContent = origin + path();
    curlBtn.setAttribute("data-copy", curl());
    urlBtn.setAttribute("data-copy", origin + path());
  }
  [codeIn, sleepIn, methodIn].forEach(function (el) { el.addEventListener("input", sync); });
  sync();

  function classOf(status) { return "c" + String(status).charAt(0); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var started = performance.now();
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending…";
    result.hidden = false;
    result.className = "result pending";
    statusOut.textContent = "Waiting for response…";
    timeOut.textContent = "";
    headersOut.textContent = "";
    bodyOut.textContent = "";
    fetch(path(), { method: methodIn.value, cache: "no-store" })
      .then(function (res) {
        return res.text().then(function (body) {
          var ms = Math.round(performance.now() - started);
          result.className = "result " + classOf(res.status);
          statusOut.textContent = res.status + " " + (res.statusText || "");
          timeOut.textContent = ms + " ms";
          var lines = [];
          res.headers.forEach(function (v, k) { lines.push(k + ": " + v); });
          headersOut.textContent = lines.join("\\n");
          bodyOut.textContent = body === "" ? "(empty body)" : body;
        });
      })
      .catch(function (err) {
        result.className = "result c5";
        statusOut.textContent = "Request failed";
        bodyOut.textContent = String(err);
      })
      .then(function () {
        sendBtn.disabled = false;
        sendBtn.textContent = "Send request";
      });
  });

  function load(code, sleep) {
    codeIn.value = code;
    sleepIn.value = sleep || "";
    sync();
  }
  $$(".preset").forEach(function (b) {
    b.addEventListener("click", function () {
      load(b.getAttribute("data-code"), b.getAttribute("data-sleep"));
      form.requestSubmit();
    });
  });
  $$("[data-try]").forEach(function (b) {
    b.addEventListener("click", function () {
      load(b.getAttribute("data-try"), "");
      $("#try").scrollIntoView({ behavior: "smooth", block: "start" });
      form.requestSubmit();
    });
  });

  // ---- Reference filter ----
  var filter = $("#filter"), tabs = $$(".tab"), empty = $("#filter-empty");
  var activeGroup = "all";
  function applyFilter() {
    var q = (filter.value || "").trim().toLowerCase();
    var shown = 0;
    $$(".code-group").forEach(function (g) {
      var groupOk = activeGroup === "all" || g.getAttribute("data-group") === activeGroup;
      var any = false;
      $$(".code-row", g).forEach(function (row) {
        var ok = groupOk && (!q || row.getAttribute("data-search").indexOf(q) !== -1);
        row.hidden = !ok;
        if (ok) { any = true; shown++; }
      });
      g.hidden = !any;
    });
    empty.hidden = shown !== 0;
  }
  filter.addEventListener("input", applyFilter);
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      activeGroup = t.getAttribute("data-filter");
      tabs.forEach(function (o) { o.setAttribute("aria-pressed", String(o === t)); });
      applyFilter();
    });
  });
})();
`;

export function renderPage(title: string, description: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="color-scheme" content="light dark">
    <link rel="canonical" href="${SITE_URL}/" />
    <link rel="icon" href="/favicon.ico" />

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${SITE_URL}/">

    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">

    <link rel="stylesheet" href="/app.css" />
    <script type="application/ld+json">${renderJsonLd(description)}</script>
  </head>
  <body>
    <a class="skip" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="wrap header-inner">
        <a class="brand" href="/" aria-label="statuscode.app home">
          <span class="brand-mark" aria-hidden="true">200</span>
          <span>statuscode<span class="muted">.app</span></span>
        </a>
        <nav aria-label="Primary">
          <a href="#try">Try it</a>
          <a href="#endpoints">Endpoints</a>
          <a href="#codes">Status codes</a>
          <a class="nav-gh" href="${GITHUB_URL}" rel="noopener">${ICON_GITHUB}<span>GitHub</span></a>
        </nav>
      </div>
    </header>

    <main id="main">
      <section class="hero">
        <div class="wrap hero-grid">
          <div class="hero-copy">
            <p class="eyebrow">Free HTTP testing endpoint &middot; no signup</p>
            <h1>Any HTTP status code, on&nbsp;demand.</h1>
            <p class="lede">Request <code>statuscode.app/<em>{code}</em></code> and get that exact status back. Use it to check that your uptime monitors alert, your retries back off, your timeouts fire, and your error pages render, before production does it for you.</p>
            <div class="hero-cta">
              <a class="btn btn-primary" href="#try">Try it live</a>
              <a class="btn" href="#codes">Browse all ${STATUS_CLASSES.reduce((n, g) => n + g.codes.length, 0)} codes</a>
            </div>
            ${codeBlock(`curl -i ${SITE_URL}/503`)}
            <ul class="trust">
              <li>Any HTTP method</li>
              <li>Served from Cloudflare&rsquo;s edge</li>
              <li>No request data stored</li>
              <li>Open source</li>
            </ul>
          </div>

          <div class="tester-card" id="try">
            <div class="tester-head">
              <span class="tester-title">Live request</span>
              <span class="muted small">Sends a real request from your browser</span>
            </div>
            <form id="tester" autocomplete="off">
              <div class="fields">
                <label class="field field-method">
                  <span>Method</span>
                  <select id="t-method">
                    <option>GET</option><option>POST</option><option>PUT</option>
                    <option>PATCH</option><option>DELETE</option><option>HEAD</option>
                  </select>
                </label>
                <label class="field field-code">
                  <span>Status code</span>
                  <select id="t-code">
                    ${renderCodeOptions(503)}
                  </select>
                </label>
                <label class="field field-sleep">
                  <span>Delay (ms)</span>
                  <input id="t-sleep" type="number" min="0" max="5000" step="100" placeholder="0">
                </label>
              </div>
              <div class="url-row">
                <code id="t-url" class="url">${SITE_URL}/503</code>
                <button type="button" class="icon-btn" id="t-copy-url" data-copy="${SITE_URL}/503" aria-label="Copy URL" title="Copy URL">${ICON_COPY}</button>
              </div>
              <div class="tester-actions">
                <button class="btn btn-primary" id="t-send" type="submit">Send request</button>
                <button class="btn" id="t-copy-curl" type="button" data-copy="curl -i '${SITE_URL}/503'">Copy as curl</button>
              </div>
            </form>
            <div class="presets" aria-label="Quick presets">${renderPresets()}</div>
            <div id="t-result" class="result" hidden aria-live="polite">
              <div class="result-status"><span class="pill" id="t-status"></span><span id="t-time" class="muted small"></span></div>
              <details>
                <summary>Response headers</summary>
                <pre id="t-headers"></pre>
              </details>
              <div class="result-label">Body</div>
              <pre id="t-body"></pre>
            </div>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="uses-title">
        <div class="wrap">
          <h2 id="uses-title">What people test with it</h2>
          <div class="cards">
            <article class="card">
              <h3>Uptime monitors &amp; alerting</h3>
              <p>Point a monitor at <a href="/503"><code>/503</code></a> and confirm it actually pages someone. Then flip it to <a href="/200"><code>/200</code></a> and confirm it resolves.</p>
            </article>
            <article class="card">
              <h3>Retries &amp; backoff</h3>
              <p>Hit <a href="/429"><code>/429</code></a>, <a href="/502"><code>/502</code></a>, or <a href="/503"><code>/503</code></a> to check your HTTP client retries the right errors and gives up on the rest.</p>
            </article>
            <article class="card">
              <h3>Timeouts &amp; slow responses</h3>
              <p>Add <a href="/200?sleep=5000"><code>?sleep=5000</code></a> to hold a response for up to 5 seconds and confirm your timeouts and loading states kick in.</p>
            </article>
            <article class="card">
              <h3>Webhooks &amp; outbound requests</h3>
              <p>Send anything to <a href="/echo"><code>/echo</code></a> and see exactly which method, headers, query, and body your code put on the wire.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section section-alt" id="endpoints" aria-labelledby="endpoints-title">
        <div class="wrap">
          <h2 id="endpoints-title">Endpoints</h2>
          <p class="section-lede">Every endpoint accepts any HTTP method. Nothing to configure, no API key.</p>
          <div class="endpoints">
            <article class="endpoint">
              <div class="endpoint-head"><code class="route">/{code}</code><span class="muted small">e.g. <a href="/404">/404</a></span></div>
              <p>Returns that status code with its standard reason phrase as a plain-text body, e.g. <code>404 Not Found</code>.</p>
              ${codeBlock(`curl -i ${SITE_URL}/404`)}
            </article>
            <article class="endpoint">
              <div class="endpoint-head"><code class="route">?sleep={ms}</code><span class="muted small">0&ndash;5000</span></div>
              <p>Add to any status code URL to wait that many milliseconds before responding. Values above 5000 are capped at 5000.</p>
              ${codeBlock(`curl -i "${SITE_URL}/200?sleep=3000"`)}
            </article>
            <article class="endpoint">
              <div class="endpoint-head"><code class="route">/echo</code><a class="muted small" href="/echo">open</a></div>
              <p>Returns JSON describing the request it received: method, path, query, headers, and body. JSON bodies are parsed; anything else comes back as text.</p>
              ${codeBlock(`curl -X POST ${SITE_URL}/echo \\\n  -H "content-type: application/json" \\\n  -d '{"event":"ping"}'`)}
            </article>
            <article class="endpoint">
              <div class="endpoint-head"><code class="route">/ip</code><a class="muted small" href="/ip">open</a></div>
              <p>Returns your public IP address as plain text, as seen by Cloudflare.</p>
              ${codeBlock(`curl ${SITE_URL}/ip`)}
            </article>
            <article class="endpoint endpoint-wide">
              <div class="endpoint-head"><code class="route">/download</code><a class="muted small" href="/download?filename=report.csv&amp;size=2048&amp;type=text/csv">try it</a></div>
              <p>Returns a dummy file as an attachment for testing download handling. Optional query parameters: <code>filename</code> (default <code>download.txt</code>), <code>size</code> in bytes (default 1024, max 10&nbsp;MiB), and <code>type</code> for the Content-Type header (default <code>application/octet-stream</code>).</p>
              ${codeBlock(`curl -OJ "${SITE_URL}/download?filename=report.csv&size=2048&type=text/csv"`)}
            </article>
          </div>
        </div>
      </section>

      <section class="section" id="codes" aria-labelledby="codes-title">
        <div class="wrap">
          <h2 id="codes-title">Status code reference</h2>
          <p class="section-lede">Every supported code, what it means, and a link that returns it. Reason phrases match Go&rsquo;s <code>net/http</code>. Full registry at <a href="https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml" rel="noopener">IANA</a>.</p>
          <div class="filter-bar">
            <input id="filter" type="search" placeholder="Search codes, e.g. 429 or timeout" aria-label="Search status codes">
            <div class="tabs" role="group" aria-label="Filter by class">
              <button type="button" class="tab" data-filter="all" aria-pressed="true">All</button>
              ${STATUS_CLASSES.map((g) => `<button type="button" class="tab" data-filter="${g.key}" aria-pressed="false">${g.key}</button>`).join("")}
            </div>
          </div>
          <p id="filter-empty" class="empty" hidden>No matching status codes.</p>
          ${renderStatusReference()}
        </div>
      </section>

      <section class="section section-alt" id="limitations" aria-labelledby="limits-title">
        <div class="wrap narrow">
          <h2 id="limits-title">Good to know</h2>
          <div class="faq">
            <div>
              <h3>Two groups of codes behave slightly differently</h3>
              <p>This service runs on Cloudflare Workers, which follow the Fetch API&rsquo;s rules for responses:</p>
              <ul>
                <li><strong>100, 101, 102, 103</strong> return <code>501 Not Implemented</code> with an explanation, because a Worker can&rsquo;t send a 1xx status as a final response.</li>
                <li><strong>204, 205, 304</strong> return the correct status with an empty body, because these statuses can&rsquo;t have one.</li>
              </ul>
              <p>Every other code is returned exactly as listed. <code>306</code> has no defined reason phrase, so its body is empty.</p>
            </div>
            <div>
              <h3>What happens to my requests?</h3>
              <p>Nothing is captured or stored. Responses are generated on the fly, and you can read every line of the code <a href="${GITHUB_URL}" rel="noopener">on GitHub</a>.</p>
            </div>
            <div>
              <h3>Is it free?</h3>
              <p>Yes. There&rsquo;s no account, API key, or paid tier.</p>
            </div>
            <div>
              <h3>Do redirects send a Location header?</h3>
              <p>No. 3xx responses return the status code only, so clients see the redirect status rather than following it to another URL.</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="wrap footer-inner">
        <p>Built by <a href="https://austinmiller.dev">Austin Miller</a>. Runs on <a href="https://workers.cloudflare.com" rel="noopener">Cloudflare Workers</a>. Source on <a href="${GITHUB_URL}" rel="noopener">GitHub</a>.</p>
        <p class="muted"><a href="/llms.txt">llms.txt</a> &middot; No request data stored</p>
      </div>
    </footer>

    <script>${CLIENT_SCRIPT}</script>
  </body>
</html>`;
}
