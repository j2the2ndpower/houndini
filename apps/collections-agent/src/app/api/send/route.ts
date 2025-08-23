import { z } from "zod";
import { Mailer } from "@/lib/mailer";
import { err, json } from "@/lib/api";
import { ensureRateLimit } from "@/lib/rateLimit";

const BodySchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  bodyText: z.string().min(1).max(10000),
});

export async function POST(req: Request) {
  // 60 requests per 5 minutes per IP
  const rl = ensureRateLimit(req, "send", {
    limit: 60,
    windowMs: 5 * 60 * 1000,
  });
  if (!rl.ok)
    return err(
      `Rate limit exceeded. Retry in ${Math.ceil(rl.remainingMs / 1000)}s`,
      429
    );

  try {
    const jsonBody = await req.json();
    const { to, subject, bodyText } = BodySchema.parse(jsonBody);

    const mailer = await Mailer.fromSettings();
    const result = await mailer.send(to, subject, bodyText);
    return json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err(message, 400);
  }
}
