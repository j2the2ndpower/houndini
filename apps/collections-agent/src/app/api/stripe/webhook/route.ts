import { headers } from "next/headers";
import Stripe from "stripe";
import { store } from "@/lib/store";
import { err, json } from "@/lib/api";

export async function POST(req: Request) {
  const sig = (await headers()).get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return err("Missing STRIPE_WEBHOOK_SECRET", 400);
  const body = await req.text();
  const stripe = new Stripe(process.env.STRIPE_API_KEY || "", {
    apiVersion: "2024-06-20",
  });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig as string, secret);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Invalid payload";
    return err(`Webhook Error: ${message}`, 400);
  }

  switch (event.type) {
    case "invoice.paid":
    case "invoice.voided": {
      const inv = event.data.object as Stripe.Invoice;
      const stops = await store.readStops();
      if (!stops.invoices.includes(inv.id)) {
        stops.invoices.push(inv.id);
        await store.writeStops(stops);
      }
      break;
    }
    default:
      break;
  }
  return json({ received: true });
}
