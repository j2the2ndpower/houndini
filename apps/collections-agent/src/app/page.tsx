"use client";
import { useState, useEffect } from "react";

type Invoice = {
  id: string;
  number: string | null;
  amountDue: number;
  currency: string;
  customerName: string;
  customerEmail?: string | null;
  dueDateISO?: string;
  daysOverdue: number;
  hostedInvoiceUrl?: string | null;
  stopped?: boolean;
};

type Draft = {
  subject: string;
  bodyText: string;
};

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [businessName, setBusinessName] = useState("Your Company");
  const [tone, setTone] = useState<"friendly" | "firm" | "professional">(
    "professional"
  );
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<{
    totalSends: number;
    todaySends: number;
  } | null>(null);
  const [gmail, setGmail] = useState<{
    connected: boolean;
    email: string | null;
  }>({ connected: false, email: null });
  const [outlook, setOutlook] = useState<{
    connected: boolean;
    email: string | null;
  }>({ connected: false, email: null });
  function scrollToKey() {
    if (typeof window === "undefined") return;
    document
      .getElementById("stripe-key")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function fetchOverdue() {
    setLoading(true);
    setDrafts({});
    setError(null);
    try {
      const res = await fetch("/api/stripe/overdue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setInvoices(json.data as Invoice[]);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch overdue invoices.");
    } finally {
      setLoading(false);
    }
  }

  async function generateDraft(inv: Invoice) {
    const res = await fetch("/api/compose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName,
        customerName: inv.customerName,
        invoiceNumber: inv.number ?? inv.id,
        amountDue: inv.amountDue,
        currency: inv.currency,
        daysOverdue: inv.daysOverdue,
        dueDateISO: inv.dueDateISO,
        tone,
        hostedInvoiceUrl: inv.hostedInvoiceUrl ?? undefined,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Compose failed");
    setDrafts((d) => ({ ...d, [inv.id]: json.data as Draft }));
  }

  async function copyDraft(invId: string) {
    const draft = drafts[invId];
    if (!draft) return;
    await navigator.clipboard.writeText(
      `${draft.subject}\n\n${draft.bodyText}`
    );
  }

  function openEmail(invId: string) {
    const draft = drafts[invId];
    const inv = invoices.find((i) => i.id === invId);
    if (!draft || !inv?.customerEmail) return;
    const mailto = `mailto:${encodeURIComponent(
      inv.customerEmail
    )}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(
      draft.bodyText
    )}`;
    window.open(mailto, "_blank");
  }

  async function sendEmail(invId: string) {
    const draft = drafts[invId];
    const inv = invoices.find((i) => i.id === invId);
    if (!draft || !inv?.customerEmail) return;
    const res = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: inv.customerEmail,
        subject: draft.subject,
        bodyText: draft.bodyText,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Send failed");
  }

  async function runSequences() {
    setLoading(true);
    try {
      const res = await fetch("/api/run-sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Run failed");
      await loadAnalytics();
    } catch (e) {
      console.error(e);
      setError("Failed to run sequences.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalytics() {
    const res = await fetch("/api/analytics");
    const json = await res.json();
    if (res.ok) setAnalytics(json.data);
  }

  useEffect(() => {
    loadAnalytics();
    (async () => {
      const res = await fetch("/api/auth/gmail/status");
      const json = await res.json();
      if (res.ok) setGmail(json.data);
    })();
    (async () => {
      const res = await fetch("/api/auth/outlook/status");
      const json = await res.json();
      if (res.ok) setOutlook(json.data);
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Houndini</h1>
      <p className="text-sm text-gray-600">
        Automate polite, effective invoice follow-ups with Stripe and email.
      </p>
      <div className="flex gap-3">
        <button
          className="rounded bg-black text-white px-3 py-1"
          onClick={scrollToKey}
        >
          Connect Stripe key
        </button>
        <a href="/sequences" className="rounded border px-3 py-1">
          Edit Sequences
        </a>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Stripe Secret Key</label>
        <input
          type="password"
          id="stripe-key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="sk_live_... or sk_test_..."
        />
        <label className="block text-sm font-medium mt-4">Business Name</label>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        <label className="block text-sm font-medium mt-4">Tone</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as any)}
          className="w-full rounded border px-3 py-2"
        >
          <option value="friendly">Friendly</option>
          <option value="professional">Professional</option>
          <option value="firm">Firm</option>
        </select>
        <button
          onClick={fetchOverdue}
          disabled={!apiKey || loading}
          className="mt-4 rounded bg-black text-white px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Fetch Overdue Invoices"}
        </button>
        <button
          onClick={runSequences}
          disabled={!apiKey || loading}
          className="mt-2 rounded bg-gray-800 text-white px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Running…" : "Run Sequences Now"}
        </button>
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        {analytics && (
          <div className="mt-2 text-sm text-gray-700">
            Total sends: {analytics.totalSends} · Today: {analytics.todaySends}
          </div>
        )}
        <div className="mt-4 text-sm flex items-center gap-2">
          <span>Gmail:</span>
          {gmail.connected ? (
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-300">
              Connected{gmail.email ? ` (${gmail.email})` : ""}
            </span>
          ) : (
            <button
              className="rounded border px-3 py-1"
              onClick={async () => {
                const res = await fetch("/api/auth/gmail/start");
                const json = await res.json();
                if (res.ok) window.location.href = json.data.url as string;
              }}
            >
              Connect Gmail
            </button>
          )}
        </div>
        <div className="mt-2 text-sm flex items-center gap-2">
          <span>Outlook:</span>
          {outlook.connected ? (
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-300">
              Connected{outlook.email ? ` (${outlook.email})` : ""}
            </span>
          ) : (
            <button
              className="rounded border px-3 py-1"
              onClick={async () => {
                const res = await fetch("/api/auth/outlook/start");
                const json = await res.json();
                if (res.ok) window.location.href = json.data.url as string;
              }}
            >
              Connect Outlook
            </button>
          )}
          <button
            className="ml-4 rounded border px-3 py-1"
            onClick={async () => {
              await fetch("/api/auth/health", { method: "POST" });
              const [g, o] = await Promise.all([
                fetch("/api/auth/gmail/status").then((r) => r.json()),
                fetch("/api/auth/outlook/status").then((r) => r.json()),
              ]);
              setGmail(g.data);
              setOutlook(o.data);
            }}
          >
            Refresh email health
          </button>
        </div>
      </div>

      {invoices.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-medium">Overdue Invoices</h2>
          <ul className="space-y-3">
            {invoices.map((inv) => (
              <li key={inv.id} className="border rounded p-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <div className="font-medium">
                      {inv.customerName} — {inv.number ?? inv.id}
                      {inv.stopped && (
                        <span className="ml-2 inline-block text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
                          stopped
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600">
                      {inv.currency} {inv.amountDue.toFixed(2)} ·{" "}
                      {inv.daysOverdue} days overdue
                      {inv.dueDateISO
                        ? ` · due ${new Date(
                            inv.dueDateISO
                          ).toLocaleDateString()}`
                        : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded bg-gray-900 text-white px-3 py-1"
                      onClick={() => generateDraft(inv)}
                    >
                      Generate Draft
                    </button>
                    <button
                      className="rounded border px-3 py-1"
                      onClick={async () => {
                        const action = inv.stopped ? "resume" : "stop";
                        const res = await fetch("/api/stops", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ invoiceId: inv.id, action }),
                        });
                        if (res.ok)
                          setInvoices((arr) =>
                            arr.map((x) =>
                              x.id === inv.id
                                ? { ...x, stopped: !inv.stopped }
                                : x
                            )
                          );
                      }}
                    >
                      {inv.stopped ? "Resume" : "Stop"}
                    </button>
                  </div>
                </div>
                {drafts[inv.id] && (
                  <div className="mt-3 text-sm">
                    <div className="font-medium">Subject</div>
                    <div className="whitespace-pre-wrap border rounded p-2 bg-gray-50">
                      {drafts[inv.id].subject}
                    </div>
                    <div className="font-medium mt-2">Body</div>
                    <textarea
                      className="w-full border rounded p-2"
                      rows={8}
                      value={drafts[inv.id].bodyText}
                      readOnly
                    />
                    <div className="mt-2">
                      <button
                        className="rounded bg-gray-800 text-white px-3 py-1"
                        onClick={() => copyDraft(inv.id)}
                      >
                        Copy to clipboard
                      </button>
                      {inv.customerEmail && (
                        <button
                          className="ml-2 rounded bg-blue-600 text-white px-3 py-1"
                          onClick={() => openEmail(inv.id)}
                        >
                          Open in email client
                        </button>
                      )}
                      {inv.customerEmail && (
                        <button
                          className="ml-2 rounded bg-green-600 text-white px-3 py-1"
                          onClick={() => sendEmail(inv.id)}
                        >
                          Send
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
