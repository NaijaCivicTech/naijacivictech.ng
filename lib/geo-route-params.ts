import mongoose from "mongoose";

/** Strict 24-char hex ObjectId from query string, or null. */
export function parseObjectIdParam(raw: string | null): mongoose.Types.ObjectId | null {
  if (!raw?.trim()) return null;
  const s = raw.trim();
  if (!mongoose.Types.ObjectId.isValid(s)) return null;
  const o = new mongoose.Types.ObjectId(s);
  if (o.toString() !== s) return null;
  return o;
}

const GEO_SLUG_MAX = 128;
const GEO_SLUG_RE = /^[a-z0-9][a-z0-9_.-]*$/i;

/** URL-safe geo slug (zones, states, LGAs) from query string, or null. */
export function parseGeoSlugParam(raw: string | null): string | null {
  const s = raw?.trim();
  if (!s || s.length > GEO_SLUG_MAX) return null;
  if (!GEO_SLUG_RE.test(s)) return null;
  return s;
}
