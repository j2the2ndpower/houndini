import Stripe from "stripe";
import { type Sequence, defaultSequence } from "@vibe/true-ai";
import { composeReminder } from "@vibe/true-ai";
import { mapStripeInvoiceToOverdue } from "@/lib/stripe";
import { store } from "@/lib/store";
import type { SendLog } from "@/lib/types";
import { renderTemplate, formatCurrency } from "@vibe/true-ai";
import { Mailer } from "@/lib/mailer";

export async function runSequencesWithKey(apiKey: string) {
  const stripe = new Stripe(apiKey, { apiVersion: "2024-06-20" });
  const invoices = await stripe.invoices.list({
    status: "open",
    limit: 100,
    expand: ["data.customer"],
  });
  const nowSec = Math.floor(Date.now() / 1000);
  const overdue = invoices.data
    .map((inv) => mapStripeInvoiceToOverdue(inv, nowSec))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));

  let sequences = await store.readSequences();
  if (!sequences.length) sequences = [defaultSequence() as Sequence];
  const active = sequences.find((s) => s.active) || sequences[0];
  const sends = await store.readSends();
  const sentIds = new Set(sends.map((s) => s.id));
  const stops = await store.readStops();

  let attempted = 0;
  let sent = 0;
  const mailer = new Mailer();

  for (const inv of overdue) {
    if (!inv.customerEmail) continue;
    if (stops.invoices.includes(inv.id)) continue;
    for (const step of active.steps) {
      if (step.channel !== "email") continue;
      if (inv.daysOverdue < step.waitDays) continue;
      const key = `${inv.id}:${step.id}`;
      if (sentIds.has(key)) continue;

      const draft = composeReminder({
        businessName: "Your Company",
        customerName: inv.customerName,
        invoiceNumber: inv.number ?? inv.id,
        amountDue: inv.amountDue,
        currency: inv.currency,
        daysOverdue: inv.daysOverdue,
        tone: step.tone,
      });
      if (inv.hostedInvoiceUrl)
        draft.bodyText += `\n\nPay now: ${inv.hostedInvoiceUrl}`;

      if (step.template) {
        const body = renderTemplate(step.template, {
          customerName: inv.customerName,
          businessName: "Your Company",
          invoiceNumber: inv.number ?? inv.id,
          amountDue: inv.amountDue,
          amountDueFormatted: formatCurrency(inv.amountDue, inv.currency),
          currency: inv.currency,
          daysOverdue: inv.daysOverdue,
          hostedInvoiceUrl: inv.hostedInvoiceUrl,
          dueDate: inv.dueDateISO ? new Date(inv.dueDateISO) : null,
        });
        draft.bodyText = body;
      }

      attempted++;
      await mailer.send(inv.customerEmail, draft.subject, draft.bodyText);
      sent++;
      sends.push({
        id: key,
        invoiceId: inv.id,
        stepId: step.id,
        to: inv.customerEmail,
        atISO: new Date().toISOString(),
      } as SendLog);
      sentIds.add(key);
    }
  }

  await store.writeSends(sends);
  return { attempted, sent };
}
