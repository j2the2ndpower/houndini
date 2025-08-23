"use client";
import { useEffect, useMemo, useState } from "react";
import { toCsv } from "@/lib/csv";

type Send = {
  id: string;
  invoiceId: string;
  stepId: string;
  to: string;
  atISO: string;
};

export default function ActivityPage() {
  const [rows, setRows] = useState<Send[]>([]);
  const [q, setQ] = useState("");
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (since) params.set("since", since);
    if (until) params.set("until", until);
    const res = await fetch(`/api/activity?${params.toString()}`);
    const json = await res.json();
    if (res.ok) setRows(json.data as Send[]);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const csv = useMemo(
    () => toCsv(rows as any, ["id", "invoiceId", "stepId", "to", "atISO"]),
    [rows]
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Activity</h1>
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-sm">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="email or invoice id"
          />
        </div>
        <div>
          <label className="block text-sm">Since (ISO)</label>
          <input
            value={since}
            onChange={(e) => setSince(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="2025-01-01"
          />
        </div>
        <div>
          <label className="block text-sm">Until (ISO)</label>
          <input
            value={until}
            onChange={(e) => setUntil(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="2025-12-31"
          />
        </div>
        <button
          className="rounded bg-black text-white px-3 py-1"
          onClick={load}
        >
          Apply
        </button>
        <a
          className="rounded border px-3 py-1"
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
          download={`activity-${new Date().toISOString().slice(0, 10)}.csv`}
        >
          Export CSV
        </a>
      </div>
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Time</th>
              <th className="text-left px-3 py-2">To</th>
              <th className="text-left px-3 py-2">Invoice</th>
              <th className="text-left px-3 py-2">Step</th>
              <th className="text-left px-3 py-2">ID</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap">
                  {new Date(r.atISO).toLocaleString()}
                </td>
                <td className="px-3 py-2">{r.to}</td>
                <td className="px-3 py-2">{r.invoiceId}</td>
                <td className="px-3 py-2">{r.stepId}</td>
                <td className="px-3 py-2 text-gray-500">{r.id}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={5}>
                  No activity
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
