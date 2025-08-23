import { store } from "@/lib/store";

export async function GET() {
  const sends = await store.readSends();
  const total = sends.length;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = sends.filter((s) => s.atISO.startsWith(today)).length;
  return Response.json({ data: { totalSends: total, todaySends: todayCount } });
}
