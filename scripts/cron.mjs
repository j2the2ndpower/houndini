#!/usr/bin/env node
import "dotenv/config";
import fetch from "node-fetch";

const base = process.env.CRON_BASE_URL || "http://localhost:3000";
const secret = process.env.CRON_SECRET;
async function main() {
  try {
    const health = await fetch(`${base}/api/auth/health`, { method: "POST" });
    if (!health.ok) console.error("Health check failed", await health.text());
  } catch (e) {
    console.error("Health request error", e);
  }
  const headers = secret ? { "x-cron-secret": secret } : {};
  const res = await fetch(`${base}/api/cron`, { method: "POST", headers });
  if (!res.ok) {
    console.error("Cron run failed", await res.text());
    process.exit(1);
  }
  const json = await res.json();
  console.log("Cron run result:", json);
}

main();
