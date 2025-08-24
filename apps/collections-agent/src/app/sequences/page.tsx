"use client";
import { useEffect, useState } from "react";

type Channel = "email" | "sms" | "whatsapp";
type SequenceStep = {
  id: string;
  waitDays: number;
  channel: Channel;
  tone?: "friendly" | "professional" | "firm";
  template: string;
};
type Sequence = {
  id: string;
  name: string;
  steps: SequenceStep[];
  active: boolean;
};

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/sequences");
      const json = await res.json();
      setSequences(json.data as Sequence[]);
    })();
  }, []);

  function updateStep(
    seqIdx: number,
    stepIdx: number,
    patch: Partial<SequenceStep>
  ) {
    setSequences((arr) => {
      const copy = structuredClone(arr);
      Object.assign(copy[seqIdx].steps[stepIdx], patch);
      return copy;
    });
  }

  async function save(seq: Sequence) {
    setSaving(true);
    try {
      const res = await fetch("/api/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequence: seq }),
      });
      if (!res.ok) throw new Error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Sequences</h1>
      {sequences.map((seq, seqIdx) => (
        <div key={seq.id} className="border rounded p-4 space-y-3">
          <div className="flex items-center gap-3">
            <input
              value={seq.name}
              onChange={(e) =>
                setSequences((arr) => {
                  const c = structuredClone(arr);
                  c[seqIdx].name = e.target.value;
                  return c;
                })
              }
              className="border rounded px-2 py-1 w-full"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={seq.active}
                onChange={(e) =>
                  setSequences((arr) => {
                    const c = structuredClone(arr);
                    c[seqIdx].active = e.target.checked;
                    return c;
                  })
                }
              />{" "}
              Active
            </label>
            <button
              className="rounded bg-black text-white px-3 py-1"
              onClick={() => save(seq)}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
          <div className="space-y-2">
            {seq.steps.map((step, stepIdx) => (
              <div
                key={step.id}
                className="grid grid-cols-1 md:grid-cols-5 gap-2 items-start"
              >
                <input
                  type="number"
                  min={0}
                  className="border rounded px-2 py-1"
                  value={step.waitDays}
                  onChange={(e) =>
                    updateStep(seqIdx, stepIdx, {
                      waitDays: Number(e.target.value),
                    })
                  }
                />
                <select
                  className="border rounded px-2 py-1"
                  value={step.channel}
                  onChange={(e) =>
                    updateStep(seqIdx, stepIdx, {
                      channel: e.target.value as Channel,
                    })
                  }
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
                <select
                  className="border rounded px-2 py-1"
                  value={step.tone ?? "professional"}
                  onChange={(e) =>
                    updateStep(seqIdx, stepIdx, {
                      tone: e.target.value as
                        | "friendly"
                        | "professional"
                        | "firm",
                    })
                  }
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="firm">Firm</option>
                </select>
                <div className="md:col-span-2">
                  <textarea
                    className="w-full border rounded px-2 py-1"
                    rows={3}
                    value={step.template}
                    onChange={(e) =>
                      updateStep(seqIdx, stepIdx, { template: e.target.value })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
