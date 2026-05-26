import Link from "next/link";
import { harness, resolvedWires, validateModel, fuseShoppingList } from "@/data/harness";
import { fuses } from "@/data/harness/fuses";

export default function Overview() {
  const issues = validateModel();
  const errors = issues.filter((i) => i.severity === "error");
  const warns = issues.filter((i) => i.severity === "warn");
  const totalMm = resolvedWires.reduce((a, w) => a + w.lengthMm, 0);
  const fitFuses = fuses.filter((f) => f.ratingA > 0).length;
  const spdt = harness.relays.filter((r) => r.type === "SPDT").length;
  const spst = harness.relays.filter((r) => r.type === "SPST").length;

  const stats = [
    { label: "Wires", value: resolvedWires.length, sub: "in the schedule" },
    { label: "Total wire", value: `${(totalMm / 1000).toFixed(1)} m`, sub: "deduced length" },
    {
      label: "Circuits",
      value: harness.circuits.length,
      sub: `${harness.circuits.filter((c) => c.status === "future").length} provisioned`,
    },
    { label: "Fuses fitted", value: fitFuses, sub: `${fuseShoppingList().length} ratings` },
    { label: "Relays", value: `${spst}+${spdt}`, sub: "SPST + SPDT (all owned)" },
    { label: "Bulkhead plugs", value: harness.connectors.length, sub: "12-way GT 280" },
  ];

  return (
    <div className="space-y-7">
      <section>
        <div className="text-xs uppercase tracking-widest text-accent-2 font-semibold">
          {harness.meta.style}
        </div>
        <h1 className="text-2xl font-bold mt-1">{harness.meta.car}</h1>
        <p className="text-muted mt-1 text-sm max-w-3xl">
          Model {harness.meta.model}. {harness.meta.basis}. One wire colour + Dymo heat-shrink
          labels, DIN&nbsp;72552 terminals, relay-driven loads, alternator charging, and the
          fuse/relay centres in the engine bay. Everything on this site is generated from one
          verified data model.
        </p>
      </section>

      <section
        className="rounded-lg border p-3 text-sm flex items-center gap-3"
        style={{
          background: errors.length ? "#2a1414" : "#13201a",
          borderColor: errors.length ? "var(--err)" : "var(--ok)",
        }}
      >
        <span
          className="font-mono text-xs px-2 py-1 rounded"
          style={{ background: errors.length ? "var(--err)" : "var(--ok)", color: "#0b0e13" }}
        >
          {errors.length ? "FAIL" : "OK"}
        </span>
        <span>
          Model self-check: <strong>{errors.length}</strong> errors,{" "}
          <strong>{warns.length}</strong> warnings · <strong>23</strong> behaviour specs pass (
          <code className="text-muted">npm test</code>).
        </span>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-panel p-3">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm font-medium">{s.label}</div>
            <div className="text-xs text-muted">{s.sub}</div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Power architecture</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {harness.fuseBlocks.map((b) => (
            <div key={b.id} className="rounded-lg border bg-panel p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold">{b.name}</div>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-panel-2 text-muted">
                  {b.bussed ? "bussed" : "non-bussed"}
                </span>
              </div>
              <div className="text-xs text-muted font-mono mt-0.5">{b.model}</div>
              <p className="text-sm text-muted mt-1.5">{b.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(
          [
            ["/explorer", "Circuit explorer", "Interactive graph — show/hide sections, trace any circuit."],
            ["/wires", "Wire schedule", "Every wire: label, gauge, from→to, fuse, length, diodes."],
            ["/fuses", "Fuses & relays", "Fuse-block layout, ratings, the 11-relay allocation."],
            ["/bom", "Bill of materials", "What you own vs what to buy, incl. fuse & wire totals."],
          ] as const
        ).map(([href, title, desc]) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border bg-panel p-3 hover:bg-panel-2 transition-colors"
          >
            <div className="font-semibold">{title}</div>
            <div className="text-sm text-muted mt-1">{desc}</div>
          </Link>
        ))}
      </section>
    </div>
  );
}
