import Stripe from "stripe";
import { z } from "zod";
import { mapStripeInvoiceToOverdue } from "@/lib/stripe";
import { store } from "@/lib/store";
import { err, json } from "@/lib/api";

const BodySchema = z.object({
  apiKey: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey } = BodySchema.parse(body);

    const stripe = new Stripe(apiKey, { apiVersion: "2024-06-20" });

    const invoices = await stripe.invoices.list({
      status: "open",
      limit: 50,
      expand: ["data.customer"],
    });

    const nowSec = Math.floor(Date.now() / 1000);
    const stops = await store.readStops();
    const stoppedSet = new Set(stops.invoices);
    const overdue = invoices.data
      .map((inv) => mapStripeInvoiceToOverdue(inv, nowSec))
      .filter((v): v is NonNullable<typeof v> => Boolean(v))
      .map((v) => ({ ...v, stopped: stoppedSet.has(v.id) }));

    return json(overdue);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err(message, 400);
  }
}
