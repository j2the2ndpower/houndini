import { getAuthUrl } from "@/lib/gmail";
import { json } from "@/lib/api";

export async function GET() {
  const url = getAuthUrl();
  return json({ url });
}
