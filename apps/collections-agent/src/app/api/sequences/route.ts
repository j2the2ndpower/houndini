import { NextRequest } from "next/server";
import { z } from "zod";
import {
  defaultSequence,
  validateSequence,
  type Sequence,
} from "@vibe/true-ai";
import { store } from "@/lib/store";
import { err, json } from "@/lib/api";

const BodySchema = z.object({
  sequence: z.any(),
});

export async function GET() {
  const sequences = await store.readSequences();
  if (!sequences.length) {
    const seq = defaultSequence();
    await store.writeSequences([seq]);
    return json([seq]);
  }
  return json(sequences);
}

export async function POST(req: Request | NextRequest) {
  try {
    const body = await req.json();
    const parsed = BodySchema.parse(body);
    const seq = parsed.sequence as Sequence;
    validateSequence(seq);
    const sequences = await store.readSequences();
    const idx = sequences.findIndex((s) => s.id === seq.id);
    if (idx >= 0) sequences[idx] = seq;
    else sequences.push(seq);
    await store.writeSequences(sequences);
    return json(seq);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Invalid sequence";
    return err(message, 400);
  }
}
