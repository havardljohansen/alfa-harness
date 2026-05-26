import { complianceNotes } from "@/data/harness/compliance";

const sev: Record<string, { label: string; color: string; bg: string }> = {
  info: { label: "INFO", color: "var(--muted)", bg: "#1b212c" },
  caution: { label: "CHECK", color: "var(--warn)", bg: "#241c10" },
  check: { label: "REQUIRED", color: "var(--err)", bg: "#241414" },
};

export default function CompliancePage() {
  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold">EU / Norway veteran-vehicle compliance</h1>
        <p className="text-muted text-sm mt-0.5">
          Advisory only — not legal advice. The authorities are Statens vegvesen and the
          kjøretøyforskrift. A 1969 car (&gt;50 yrs) classified <em>bevaringsverdig</em> is exempt
          from periodic EU-kontroll, but must stay roadworthy and keep the lighting/signalling that
          was required when first registered. Verify anything load-bearing before a kontroll.
        </p>
      </div>

      <div className="space-y-3">
        {complianceNotes.map((n) => {
          const s = sev[n.severity];
          return (
            <div key={n.id} className="rounded-lg border p-3" style={{ background: s.bg }}>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{ color: "#0b0e13", background: s.color }}
                >
                  {s.label}
                </span>
                <span className="font-semibold">{n.topic}</span>
              </div>
              <p className="text-sm mt-1.5">{n.text}</p>
              <div className="text-xs text-muted mt-1.5 font-mono">↪ {n.ref}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
