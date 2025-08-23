import { runSequencesWithKey } from "@/lib/runner";
import { getCronSecret, getStripeApiKey } from "@/lib/config";
import { err, json } from "@/lib/api";

export async function POST(req: Request) {
  const provided = req.headers.get("x-cron-secret");
  const expected = getCronSecret();
  if (!expected || provided !== expected) {
    return err("Unauthorized", 401);
  }
  const apiKey = getStripeApiKey();
  if (!apiKey) return err("Missing STRIPE_API_KEY", 400);
  try {
    await fetch("/api/auth/health", { method: "POST" });
  } catch {}
  const result = await runSequencesWithKey(apiKey);
  return json(result);
}
