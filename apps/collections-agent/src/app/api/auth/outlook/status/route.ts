import { store } from "@/lib/store";
import { json } from "@/lib/api";

export async function GET() {
  const auth = await store.readOutlookAuth();
  return json({ connected: Boolean(auth), email: auth?.email || null });
}
