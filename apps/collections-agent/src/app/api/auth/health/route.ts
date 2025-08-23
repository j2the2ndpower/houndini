import { checkGmailHealth } from "@/lib/gmail";
import { checkOutlookHealth } from "@/lib/outlook";
import { json } from "@/lib/api";

export async function POST() {
  const [gmail, outlook] = await Promise.all([
    checkGmailHealth(),
    checkOutlookHealth(),
  ]);
  return json({ gmail, outlook });
}
