import { handleOutlookCallback } from "@/lib/outlook";
import { err, json } from "@/lib/api";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) return err("Missing code", 400);
  try {
    const { email } = await handleOutlookCallback(code);
    return json({ email });
  } catch (e: any) {
    return err(e?.message || "OAuth error", 400);
  }
}
