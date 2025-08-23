import { getOutlookAuthUrl } from "@/lib/outlook";
import { json } from "@/lib/api";

export async function GET() {
  const url = getOutlookAuthUrl();
  return json({ url });
}
