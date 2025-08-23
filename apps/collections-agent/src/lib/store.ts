import { promises as fs } from "fs";
import path from "path";
import type { Sequence } from "@vibe/true-ai";
import type { SendLog } from "@/lib/types";

export type Stops = {
  invoices: string[]; // invoiceIds to halt sequences for
};

const dataDir = path.join(process.cwd(), "data");
const sequencesFile = path.join(dataDir, "sequences.json");
const sendsFile = path.join(dataDir, "sends.json");
const stopsFile = path.join(dataDir, "stops.json");
const gmailFile = path.join(dataDir, "gmail.json");
const outlookFile = path.join(dataDir, "outlook.json");
const settingsFile = path.join(dataDir, "settings.json");

export type GmailAuth = {
  email: string;
  tokens: any;
};

export type OutlookAuth = {
  email: string;
  tokens: any;
};

export type Settings = {
  emailProviderOrder?: string[]; // e.g., ["outlook","gmail","smtp"]
};

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const buf = await fs.readFile(file);
    return JSON.parse(buf.toString()) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  await fs.writeFile(file, JSON.stringify(data, null, 2), { mode: 0o600 });
}

export const store = {
  readSequences: () => readJson<Sequence[]>(sequencesFile, []),
  writeSequences: (seqs: Sequence[]) => writeJson(sequencesFile, seqs),
  readSends: () => readJson<SendLog[]>(sendsFile, []),
  writeSends: (sends: SendLog[]) => writeJson(sendsFile, sends),
  readStops: () => readJson<Stops>(stopsFile, { invoices: [] }),
  writeStops: (stops: Stops) => writeJson(stopsFile, stops),
  readGmailAuth: () => readJson<GmailAuth | null>(gmailFile, null),
  writeGmailAuth: (auth: GmailAuth) => writeJson(gmailFile, auth),
  clearGmailAuth: () => writeJson<GmailAuth | null>(gmailFile, null),
  readOutlookAuth: () => readJson<OutlookAuth | null>(outlookFile, null),
  writeOutlookAuth: (auth: OutlookAuth) => writeJson(outlookFile, auth),
  clearOutlookAuth: () => writeJson<OutlookAuth | null>(outlookFile, null),
  readSettings: () => readJson<Settings>(settingsFile, {}),
  writeSettings: (s: Settings) => writeJson(settingsFile, s),
};
