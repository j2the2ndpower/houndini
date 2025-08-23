import type { OverdueInvoice } from "@/lib/types";

export function mapStripeInvoiceToOverdue(
  inv: any,
  nowSec: number
): OverdueInvoice | null {
  if (!inv?.due_date || inv.due_date >= nowSec) return null;
  const daysOverdue = Math.max(
    0,
    Math.floor((nowSec - (inv.due_date as number)) / 86400)
  );
  const customerObj =
    typeof inv.customer === "object" && inv.customer
      ? (inv.customer as any)
      : null;
  const customerEmail = customerObj?.email || inv.customer_email || null;
  const customerId =
    typeof inv.customer === "string"
      ? (inv.customer as string)
      : customerObj?.id || null;
  return {
    id: inv.id,
    number: inv.number ?? null,
    amountDue: inv.amount_remaining ? inv.amount_remaining / 100 : 0,
    currency: (inv.currency?.toUpperCase?.() as string) ?? "USD",
    customerId,
    customerName:
      (customerObj?.name as string | undefined) || customerEmail || "Customer",
    customerEmail,
    dueDateISO: inv.due_date
      ? new Date((inv.due_date as number) * 1000).toISOString()
      : undefined,
    daysOverdue,
    hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
  };
}
