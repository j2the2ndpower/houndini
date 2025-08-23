type Bucket = {
  limit: number;
  windowMs: number;
};

const store = new Map<string, number[]>();

function getIp(req: Request): string {
  // Try common proxy headers first
  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0].trim();
  const realIp = (req.headers.get("x-real-ip") || "").trim();
  if (realIp) return realIp;
  // Fallback (may be empty in some serverless environments)
  return "unknown";
}

export function ensureRateLimit(
  req: Request,
  name: string,
  bucket: Bucket
): { ok: true } | { ok: false; remainingMs: number } {
  const ip = getIp(req);
  const key = `${name}:${ip}`;
  const now = Date.now();
  const windowStart = now - bucket.windowMs;
  const arr = store.get(key) || [];
  // Drop timestamps outside window
  const recent = arr.filter((t) => t > windowStart);
  if (recent.length >= bucket.limit) {
    const earliest = recent[0];
    return {
      ok: false,
      remainingMs: Math.max(0, bucket.windowMs - (now - earliest)),
    };
  }
  recent.push(now);
  store.set(key, recent);
  return { ok: true };
}
