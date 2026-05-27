import { circuits } from "@/data/harness/circuits";
import { resolvedWires, allNodes } from "@/data/harness";
import { diodes } from "@/data/harness/diodes";
import { complianceNotes } from "@/data/harness/compliance";
import { buildOrder } from "@/data/harness/build-order";
import { harnessModules } from "@/data/harness/modules";

const nodeName = new Map(allNodes.map((n) => [n.id, n.name]));
const compById = new Map(complianceNotes.map((c) => [c.id, c]));

export default function BuildSheets() {
  return (
    <div className="space-y-6">
      <div className="no-print">
        <h1 className="text-xl font-bold">Build order & sheets</h1>
        <p className="text-muted text-sm mt-0.5">
          The recommended sequence to assemble the harness (with the parts each step needs),
          followed by one wiring sheet per circuit. Print (Cmd/Ctrl-P) to take into the garage.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recommended build order</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {buildOrder.map((p) => (
            <div key={p.id} className="rounded-lg border bg-panel p-3 break-inside-avoid">
              <div className="font-semibold">{p.title}</div>
              <div className="text-xs text-muted italic mt-0.5">{p.why}</div>
              <ol className="mt-2 space-y-1 text-sm list-decimal list-inside">
                {p.steps.map((s, i) => (
                  <li key={i}>{s.text}</li>
                ))}
              </ol>
              <div className="mt-2 pt-2 border-t">
                <div className="text-[11px] uppercase tracking-wide text-muted mb-1">Parts for this step</div>
                <div className="flex flex-wrap gap-1">
                  {p.parts.map((part, i) => (
                    <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-panel-2">
                      {part}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Build by detachable module</h2>
          <p className="text-muted text-sm mt-0.5 max-w-3xl">
            The harness builds as separable sub-assemblies that plug together at the bulkheads — each can be
            built on the bench and dropped in or pulled out as a unit.{" "}
            <span className="text-warn">
              When the harness model changes, revise the affected module&apos;s sheet here — pinpoint it from the
              changed component (every part belongs to exactly one module; a cross-bulkhead wire touches two).
            </span>
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-3">
          {harnessModules.map((m) => (
            <div key={m.id} className="rounded-lg border bg-panel p-3 break-inside-avoid">
              <div className="font-semibold">{m.name}</div>
              <div className="text-xs text-muted italic mt-0.5">{m.summary}</div>

              <div className="mt-2 text-[11px] uppercase tracking-wide text-muted">Interfaces</div>
              <ul className="text-xs list-disc list-inside text-muted">
                {m.interfaces.map((x, i) => <li key={i}>{x}</li>)}
              </ul>
              <div className="text-xs mt-1"><span className="text-muted">Ground:</span> {m.ground}</div>

              <div className="mt-2 text-[11px] uppercase tracking-wide text-muted">Build steps</div>
              <ol className="mt-0.5 space-y-1 text-sm list-decimal list-inside">
                {m.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>

              <div className="mt-2 pt-2 border-t">
                <div className="text-[11px] uppercase tracking-wide text-muted mb-1">Parts</div>
                <div className="flex flex-wrap gap-1">
                  {m.parts.map((p, i) => (
                    <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-panel-2">{p}</span>
                  ))}
                </div>
              </div>
              <div className="mt-1.5 text-[10px] text-muted">{m.componentIds.length} components in this module</div>
            </div>
          ))}
        </div>
      </section>

      <h2 className="text-lg font-semibold no-print">Per-circuit wiring sheets</h2>

      {circuits.map((c) => {
        const ws = resolvedWires.filter((w) => w.circuit === c.id);
        if (ws.length === 0) return null;
        return (
          <section key={c.id} className="rounded-lg border bg-panel p-3 break-inside-avoid">
            <div className="flex items-baseline justify-between gap-2 border-b pb-1.5 mb-2">
              <h2 className="font-semibold">
                {c.name}{" "}
                {c.originalFuse && (
                  <span className="text-xs text-muted font-normal">· factory fuse {c.originalFuse}</span>
                )}
              </h2>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-panel-2 text-muted">
                {c.status}
              </span>
            </div>
            <p className="text-sm text-muted mb-2">{c.description}</p>
            {(c.compliance ?? []).map((id) => {
              const note = compById.get(id);
              return note ? (
                <div key={id} className="text-xs text-warn mb-1">
                  ⚠ {note.topic}: {note.text}
                </div>
              ) : null;
            })}
            <table className="wtable">
              <thead>
                <tr>
                  <th className="w-32">Label</th>
                  <th>From → To</th>
                  <th className="w-20">Gauge</th>
                  <th className="w-16">Length</th>
                </tr>
              </thead>
              <tbody>
                {ws.map((w) => (
                  <tr key={w.id} style={w.future ? { opacity: 0.6 } : undefined}>
                    <td>
                      <span className="label-chip">{w.label}</span>
                      {diodes.some((d) => d.onWire === w.id) && <span className="ml-1 text-accent-2">⬩</span>}
                    </td>
                    <td className="text-xs">
                      {nodeName.get(w.from.component)} <span className="font-mono text-muted">{w.from.terminal}</span>
                      {" → "}
                      {nodeName.get(w.to.component)} <span className="font-mono text-muted">{w.to.terminal}</span>
                    </td>
                    <td className="font-mono text-xs">
                      {w.recMm2} mm²
                    </td>
                    <td className="font-mono text-xs">{(w.lengthMm / 1000).toFixed(2)} m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}
