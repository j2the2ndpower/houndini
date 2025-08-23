import { z } from "zod";
import { runSequencesWithKey } from "@/lib/runner";

const BodySchema = z.object({ apiKey: z.string().min(10) });

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { apiKey } = BodySchema.parse(json);
    const result = await runSequencesWithKey(apiKey);
    return Response.json({ data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 400 });
  }
}
