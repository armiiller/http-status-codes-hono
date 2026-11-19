import { INFORMATIONAL_STATUSES, NULL_BODY_STATUSES, STATUS_TEXT, SUPPORTED_STATUS_CODES } from "./statusCodes";

// STATUS_TEXT holds the exact reason phrase this service serves in the
// response body, which is intentionally blank for 306 (see statusCodes.ts).
// This override just gives 306 a human-readable name on the homepage.
const STATUS_NAME_OVERRIDES: Record<number, string> = {
  306: "Switch Proxy",
};

export function statusName(code: number): string {
  return STATUS_NAME_OVERRIDES[code] ?? STATUS_TEXT[code];
}

// One-line plain-English meaning for each supported code, shown in the
// reference table on the homepage.
export const STATUS_SUMMARY: Record<number, string> = {
  100: "Headers received; the client should go ahead and send the request body.",
  101: "Server is switching protocols as requested via the Upgrade header (e.g. WebSocket).",
  102: "WebDAV: request received and still being processed; no response yet.",
  103: "Lets the client start preloading resources while the final response is prepared.",
  200: "The standard success response.",
  201: "Request succeeded and a new resource was created.",
  202: "Request accepted for processing, but processing hasn't finished.",
  203: "Success, but the payload was modified by a transforming proxy.",
  204: "Success with no response body.",
  205: "Success; the client should reset the document view, e.g. clear a form.",
  206: "Only part of the resource is being sent, in reply to a Range request.",
  207: "WebDAV: the body holds separate status codes for multiple operations.",
  208: "WebDAV: members were already listed earlier in the same response.",
  226: "Response is the result of instance-manipulations applied to the resource.",
  300: "Several representations are available; the client should pick one.",
  301: "Resource has moved to a new URL permanently.",
  302: "Resource is temporarily at a different URL.",
  303: "Fetch the result from a different URL with a GET request.",
  304: "The cached copy is still valid, so no body is sent.",
  305: "Deprecated. The resource must be accessed through a proxy.",
  306: "No longer used; reserved by the HTTP specification.",
  307: "Temporary redirect; the method and body must not change.",
  308: "Permanent redirect; the method and body must not change.",
  400: "The request is malformed or has invalid parameters.",
  401: "Authentication is missing or invalid.",
  402: "Reserved; sometimes used for billing or quota limits.",
  403: "Authenticated, but not allowed to access this resource.",
  404: "The resource doesn't exist.",
  405: "The HTTP method isn't supported for this resource.",
  406: "Nothing matches the request's Accept headers.",
  407: "The client must authenticate with the proxy first.",
  408: "The server timed out waiting for the request.",
  409: "The request conflicts with the resource's current state.",
  410: "The resource was removed permanently.",
  411: "The request must include a Content-Length header.",
  412: "A conditional header such as If-Match evaluated to false.",
  413: "The request body is larger than the server accepts.",
  414: "The request URL is longer than the server accepts.",
  415: "The request body's format isn't supported.",
  416: "The requested byte range can't be served.",
  417: "The Expect request header can't be satisfied.",
  418: "RFC 2324's April Fools' joke: the server refuses to brew coffee.",
  421: "The request reached a server that can't respond for this host.",
  422: "The request is well-formed but fails validation.",
  423: "WebDAV: the resource is locked.",
  424: "WebDAV: the request failed because an earlier one failed.",
  425: "The server won't process a request that might be replayed.",
  426: "The client must switch to a different protocol.",
  428: "The server requires the request to be conditional.",
  429: "Rate limit exceeded; slow down and retry later.",
  431: "The request's headers are too large.",
  451: "Blocked for legal reasons, such as a court order.",
  500: "A generic, unexpected server failure.",
  501: "The server doesn't support the functionality required.",
  502: "An upstream server returned an invalid response.",
  503: "The server is overloaded or down for maintenance.",
  504: "An upstream server didn't respond in time.",
  505: "The HTTP version used isn't supported.",
  506: "Content negotiation is misconfigured on the server.",
  507: "WebDAV: the server can't store what's needed to finish.",
  508: "WebDAV: the server hit an infinite loop.",
  510: "The request needs further extensions to be fulfilled.",
  511: "The client must log in to the network first, as with a captive portal.",
};

// Codes that people reach for most often; flagged in the reference table
// and offered as one-click presets in the tester.
export const COMMON_CODES = new Set([200, 201, 204, 301, 302, 400, 401, 403, 404, 429, 500, 502, 503, 504]);

export interface StatusClass {
  key: string;
  name: string;
  summary: string;
  codes: number[];
}

const CLASS_INFO: Array<Omit<StatusClass, "codes">> = [
  { key: "1xx", name: "Informational", summary: "Request received, continuing process" },
  { key: "2xx", name: "Success", summary: "The request was received, understood, and accepted" },
  { key: "3xx", name: "Redirection", summary: "Further action is needed to complete the request" },
  { key: "4xx", name: "Client Error", summary: "The request has bad syntax or can't be fulfilled" },
  { key: "5xx", name: "Server Error", summary: "The server failed to fulfill a valid request" },
];

export const STATUS_CLASSES: StatusClass[] = CLASS_INFO.map((info) => ({
  ...info,
  codes: SUPPORTED_STATUS_CODES.filter((code) => `${Math.floor(code / 100)}xx` === info.key),
}));

export function noteForStatus(code: number): string | null {
  if (INFORMATIONAL_STATUSES.has(code)) return "Returns 501";
  if (NULL_BODY_STATUSES.has(code)) return "Empty body";
  return null;
}
