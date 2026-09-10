export function clamp(value: number, minimum: number, maximum: number): number {
  if (value < minimum) return minimum;
  if (value > maximum) return maximum;
  return value;
}

// Strips characters that would break out of the quoted filename in a
// Content-Disposition header (quotes, backslashes, and control characters).
export function sanitizeFilename(filename: string): string {
  const cleaned = filename.replace(/[\x00-\x1f"\\]/g, "").trim();
  return cleaned || "download";
}
