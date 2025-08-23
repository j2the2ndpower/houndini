import { store } from "@/lib/store";
import { z } from "zod";
import { err, json } from "@/lib/api";

const BodySchema = z.object({
  emailProviderOrder: z.array(z.enum(["outlook", "gmail", "smtp"])).optional(),
});

export async function GET() {
  const settings = await store.readSettings();
  return json(settings);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = BodySchema.parse(body);
    const current = await store.readSettings();
    const next = { ...current, ...parsed };
    await store.writeSettings(next);
    return json(next);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Invalid settings";
    return err(message, 400);
  }
}
