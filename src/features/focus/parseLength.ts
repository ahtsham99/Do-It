/** "90" → 90, "1:30" / "1.30" / "1h 30m" / "1h30" → 90, "45m" → 45, "2h" → 120. */
export function parseLength(text: string): number | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  let m = t.match(/^(\d{1,2})\s*[:.]\s*(\d{1,2})$/);
  if (m) return clampLen(Number(m[1]) * 60 + Number(m[2]));
  m = t.match(/^(?:(\d+(?:\.\d+)?)\s*h(?:ours?|rs?)?)?\s*(?:(\d+)\s*(?:m(?:in(?:utes?|s)?)?)?)?$/);
  if (m && (m[1] || m[2])) return clampLen(Math.round(Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0)));
  m = t.match(/^(\d+)$/);
  if (m) return clampLen(Number(m[1]));
  return null;
}
const clampLen = (n: number) => (n > 0 ? Math.min(600, n) : null);
