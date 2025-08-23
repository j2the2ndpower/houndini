import { z } from "zod";
import { store } from "@/lib/store";
import { json } from "@/lib/api";

const BodySchema = z.object({
  invoiceId: z.string(),
  action: z.enum(["stop", "resume"]),
});

export async function GET() {
  const stops = await store.readStops();
  return json(stops);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { invoiceId, action } = BodySchema.parse(body);
  const stops = await store.readStops();
  const set = new Set(stops.invoices);
  if (action === "stop") set.add(invoiceId);
  else set.delete(invoiceId);
  await store.writeStops({ invoices: Array.from(set) });
  return json({ invoiceId, stopped: action === "stop" });
}
