import { circuits } from "@/data/harness/circuits";
import { resolvedWires, allNodes } from "@/data/harness";
import { diodes } from "@/data/harness/diodes";
import { complianceNotes } from "@/data/harness/compliance";

const nodeName = new Map(allNodes.map((n) => [n.id, n.name]));
const compById = new Map(complianceNotes.map((c) => [c.id, c]));

export default function BuildSheets() {
  return (
    <div className="space-y-6">
      <div className="no-print">
        <h1 className="text-xl font-bold">Build sheets</h1>
        <p className="text-muted text-sm mt-0.5">
          One section per circuit — the wires to make, with labels and gauges. Print this page
          (Cmd/Ctrl-P) to take into the garage.
        </p>
      </div>

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
