"use client";
import { useEffect, useMemo, useState } from "react";

export default function SettingsPage() {
  const [gmail, setGmail] = useState<{
    connected: boolean;
    email: string | null;
  }>({ connected: false, email: null });
  const [outlook, setOutlook] = useState<{
    connected: boolean;
    email: string | null;
  }>({ connected: false, email: null });
  const [order, setOrder] = useState<string[]>(["outlook", "gmail", "smtp"]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [g, o] = await Promise.all([
        fetch("/api/auth/gmail/status").then((r) => r.json()),
        fetch("/api/auth/outlook/status").then((r) => r.json()),
      ]);
      setGmail(g.data);
      setOutlook(o.data);
    })();
    (async () => {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (
        res.ok &&
        json?.data?.emailProviderOrder &&
        json.data.emailProviderOrder.length
      ) {
        setOrder(json.data.emailProviderOrder as string[]);
      }
    })();
  }, []);

  const baseUrl = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  }, []);

  const cronCurl = useMemo(() => {
    const endpoint = `${baseUrl}/api/cron`;
    return `curl -s -X POST '${endpoint}' -H 'x-cron-secret: $CRON_SECRET'`;
  }, [baseUrl]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Scheduler</h2>
        <p className="text-sm text-gray-600">
          Point your scheduler at the endpoint with the shared secret header.
        </p>
        <div className="text-sm">
          <div className="font-mono break-all border rounded p-2 bg-gray-50">
            POST {baseUrl}/api/cron
          </div>
          <div className="mt-2">
            <div className="text-xs text-gray-600">
              Example (replace with your deployment):
            </div>
            <pre className="font-mono text-xs border rounded p-2 bg-gray-50 whitespace-pre-wrap">
              {cronCurl}
            </pre>
          </div>
        </div>
        <div className="text-xs text-gray-600">
          Required env: STRIPE_API_KEY, CRON_SECRET
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Email Connections</h2>
        <div className="text-sm flex items-center gap-2">
          <span>Gmail:</span>
          {gmail.connected ? (
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-300">
              Connected{gmail.email ? ` (${gmail.email})` : ""}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
              Not connected
            </span>
          )}
        </div>
        <div className="text-sm flex items-center gap-2">
          <span>Outlook:</span>
          {outlook.connected ? (
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-300">
              Connected{outlook.email ? ` (${outlook.email})` : ""}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
              Not connected
            </span>
          )}
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Email provider order</h2>
        <p className="text-sm text-gray-600">
          Select the order providers are tried for sending.
        </p>
        <ul className="space-y-2">
          {order.map((name, idx) => (
            <li
              key={name}
              className="flex items-center justify-between border rounded px-3 py-2"
            >
              <span className="capitalize">{name}</span>
              <div className="flex items-center gap-2">
                <button
                  className="rounded border px-2 py-0.5 disabled:opacity-50"
                  disabled={idx === 0}
                  onClick={() => {
                    setOrder((arr) => {
                      const copy = arr.slice();
                      [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
                      return copy;
                    });
                  }}
                >
                  Up
                </button>
                <button
                  className="rounded border px-2 py-0.5 disabled:opacity-50"
                  disabled={idx === order.length - 1}
                  onClick={() => {
                    setOrder((arr) => {
                      const copy = arr.slice();
                      [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
                      return copy;
                    });
                  }}
                >
                  Down
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <button
            className="rounded bg-black text-white px-3 py-1 disabled:opacity-50"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await fetch("/api/settings", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ emailProviderOrder: order }),
                });
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving..." : "Save order"}
          </button>
          <button
            className="rounded border px-3 py-1"
            onClick={() => setOrder(["outlook", "gmail", "smtp"])}
          >
            Reset
          </button>
        </div>
      </section>
    </div>
  );
}
