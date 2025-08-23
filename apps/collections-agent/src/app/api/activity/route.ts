import { store } from "@/lib/store";
import type { SendLog } from "@/lib/types";
import { json } from "@/lib/api";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").toLowerCase();
  const since = url.searchParams.get("since");
  const until = url.searchParams.get("until");
  const sends = await store.readSends();
  const filtered = (sends as SendLog[]).filter((s) => {
    if (
      q &&
      !(
        `${s.to}`.toLowerCase().includes(q) ||
        `${s.invoiceId}`.toLowerCase().includes(q)
      )
    )
      return false;
    if (since && s.atISO < since) return false;
    if (until && s.atISO > until) return false;
    return true;
  });
  return json(filtered);
}
