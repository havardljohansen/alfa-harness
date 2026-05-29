/**
 * Per-module printable wire schedule. The circle diagram visualises
 * routing; this table is what you take to the bench — every wire that
 * belongs to this module's build, with the data you need WITHOUT
 * having to hover (hover doesn't survive print, and a paper schedule
 * is what stays clipped to the workbench).
 *
 * Columns picked for the crimp-and-cut workflow: Dymo label, where it
 * goes, gauge to buy, cut length, insulation colour, and the via
 * connector (so you know which housing the wire passes through). The
 * footer aggregates total cut-length per gauge so you can compare
 * against the wire reels you have in hand before starting.
 */
import { resolvedWires } from "@/data/harness";
import { modulesForWire } from "@/data/harness/modules";
import { logicalBulkheads } from "@/data/harness/connectors";
import { diodes } from "@/data/harness/diodes";
import { allNodes } from "@/data/harness";
import { parseWireColor, swatchBackground } from "@/data/harness/wire-colors";

const nodeName = new Map(allNodes.map((n) => [n.id, n.name]));
const bulkheadName = new Map(logicalBulkheads.map((b) => [b.id, b.name]));
const diodeWireIds = new Set(diodes.map((d) => d.onWire));

const endLabel = (comp: string, term: string) => {
  const name = nodeName.get(comp);
  return name ? `${name} · ${term}` : `${comp} · ${term}`;
};

export function ModuleWireSchedule({ moduleId }: { moduleId: string }) {
  const wires = resolvedWires.filter((w) => modulesForWire(w).includes(moduleId));
  if (wires.length === 0) return null;

  // Aggregate cut-length per buy-tier gauge for the materials summary.
  const byTier = new Map<string, { mm2: number; mm: number; count: number }>();
  for (const w of wires) {
    if (w.future) continue; // exclude future wires from material totals (not built yet)
    const cur = byTier.get(w.tierId) ?? { mm2: w.recMm2, mm: 0, count: 0 };
    cur.mm += w.lengthMm;
    cur.count += 1;
    byTier.set(w.tierId, cur);
  }
  const tiers = [...byTier.entries()].sort((a, b) => b[1].mm2 - a[1].mm2);

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between mb-1.5 gap-2 flex-wrap">
        <div className="text-[11px] uppercase tracking-wide text-muted">Wire schedule — every wire to crimp / cut for this module</div>
        <div className="text-[11px] text-muted">{wires.length} wires{wires.some((w) => w.future) && ` (${wires.filter((w) => w.future).length} future)`}</div>
      </div>
      <div className="overflow-auto border rounded">
        <table className="w-full text-xs">
          <thead className="bg-panel-2 text-muted">
            <tr>
              <th className="text-left px-2 py-1 font-medium">Label</th>
              <th className="text-left px-2 py-1 font-medium">From</th>
              <th className="text-left px-2 py-1 font-medium">To</th>
              <th className="text-left px-2 py-1 font-medium">Via</th>
              <th className="text-left px-2 py-1 font-medium">Gauge</th>
              <th className="text-right px-2 py-1 font-medium">Cut</th>
              <th className="text-left px-2 py-1 font-medium">Colour</th>
              <th className="text-left px-2 py-1 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {wires.map((w) => {
              const colour = parseWireColor(w.color);
              const bg = w.color ? swatchBackground(w.color) : undefined;
              const via = (w.via ?? []).map((v) => bulkheadName.get(v) ?? v).join(", ");
              return (
                <tr key={w.id} className="border-t" style={w.future ? { opacity: 0.55 } : undefined}>
                  <td className="px-2 py-1 font-mono whitespace-nowrap">{w.label}</td>
                  <td className="px-2 py-1 text-muted">{endLabel(w.from.component, w.from.terminal)}</td>
                  <td className="px-2 py-1 text-muted">{endLabel(w.to.component, w.to.terminal)}</td>
                  <td className="px-2 py-1 text-muted">{via}</td>
                  <td className="px-2 py-1 font-mono whitespace-nowrap"><span className="px-1 rounded bg-panel-2">{w.tierId}</span> {w.recMm2}<span className="text-muted">mm²</span></td>
                  <td className="px-2 py-1 font-mono text-right whitespace-nowrap">{(w.lengthMm / 1000).toFixed(2)}m</td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    {bg && <span className="inline-block w-3 h-3 rounded-sm border align-middle mr-1" style={{ background: bg }} />}
                    <span className="text-muted">{colour ? (colour.stripeName ? `${colour.baseName}/${colour.stripeName}` : colour.baseName) : (w.color ?? "—")}</span>
                  </td>
                  <td className="px-2 py-1 text-muted whitespace-nowrap">
                    {w.future && <span title="future / not yet built">⊘ future</span>}
                    {diodeWireIds.has(w.id) && <span title="signal diode inline" className="text-accent-2 ml-1">⬩ diode</span>}
                    {w.module && w.module !== moduleId && <span title={`owned by ${w.module}`} className="ml-1">↗ {w.module}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {tiers.length > 0 && (
            <tfoot>
              <tr className="bg-panel-2 text-xs">
                <td colSpan={5} className="px-2 py-1 text-right font-medium text-muted">Active-build cut totals per gauge:</td>
                <td colSpan={3} className="px-2 py-1 font-mono">
                  {tiers.map(([tierId, t]) => (
                    <span key={tierId} className="mr-3 whitespace-nowrap">
                      <span className="px-1 rounded bg-panel-3 border">{tierId}</span> {t.mm2}mm² · {(t.mm / 1000).toFixed(2)}m ({t.count} wire{t.count === 1 ? "" : "s"})
                    </span>
                  ))}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
