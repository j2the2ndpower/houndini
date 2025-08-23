import { z } from "zod";
import { composeReminder } from "@vibe/true-ai";
import { renderTemplate, formatCurrency } from "@vibe/true-ai";
import { err, json } from "@/lib/api";
import { ensureRateLimit } from "@/lib/rateLimit";

const BodySchema = z.object({
  businessName: z.string().min(1),
  customerName: z.string().min(1),
  invoiceNumber: z.string().min(1),
  amountDue: z.number().positive(),
  currency: z.string().min(3),
  daysOverdue: z.number().int().min(0),
  dueDateISO: z.string().optional(),
  tone: z.enum(["friendly", "firm", "professional"]).optional(),
  hostedInvoiceUrl: z.string().url().optional(),
  template: z.string().optional(),
});

export async function POST(req: Request) {
  // 120 requests per 5 minutes per IP
  const rl = ensureRateLimit(req, "compose", {
    limit: 120,
    windowMs: 5 * 60 * 1000,
  });
  if (!rl.ok)
    return err(
      `Rate limit exceeded. Retry in ${Math.ceil(rl.remainingMs / 1000)}s`,
      429
    );

  try {
    const body = await req.json();
    const input = BodySchema.parse(body);
    const result = composeReminder(input);
    if (input.hostedInvoiceUrl) {
      result.bodyText += `\n\nPay now: ${input.hostedInvoiceUrl}`;
    }
    if (input.template) {
      result.bodyText = renderTemplate(input.template, {
        customerName: input.customerName,
        businessName: input.businessName,
        invoiceNumber: input.invoiceNumber,
        amountDue: input.amountDue,
        amountDueFormatted: formatCurrency(input.amountDue, input.currency),
        currency: input.currency,
        daysOverdue: input.daysOverdue,
        hostedInvoiceUrl: input.hostedInvoiceUrl,
        dueDate: input.dueDateISO ? new Date(input.dueDateISO) : null,
      });
    }
    return json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err(message, 400);
  }
}
