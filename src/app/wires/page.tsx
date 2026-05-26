"use client";

import { useMemo, useState } from "react";
import { resolvedWires, allNodes } from "@/data/harness";
import { circuits } from "@/data/harness/circuits";
import { diodes } from "@/data/harness/diodes";

const nodeName = new Map(allNodes.map((n) => [n.id, n.name]));
const circuit = new Map(circuits.map((c) => [c.id, c]));
const diodeWire = new Set(diodes.map((d) => d.onWire));
const groups = [...new Set(circuits.map((c) => c.group))].sort();

function endLabel(comp: string, term: string) {
  return `${nodeName.get(comp) ?? comp} · ${term}`;
}

export default function WiresPage() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<string>("all");
  const [showFuture, setShowFuture] = useState(true);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return resolvedWires.filter((w) => {
      if (!showFuture && w.future) return false;
      if (group !== "all" && circuit.get(w.circuit)?.group !== group) return false;
      if (!needle) return true;
      return (
        w.label.toLowerCase().includes(needle) ||
        w.name.toLowerCase().includes(needle) ||
        w.from.component.includes(needle) ||
        w.to.component.includes(needle)
      );
    });
  }, [q, group, showFuture]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Wire schedule</h1>
        <p className="text-muted text-sm mt-0.5">
          Every wire with its Dymo label (printed both ends), ideal gauge, the consolidated gauge
          you actually buy/cut, endpoints with DIN terminals, and deduced length. ⬩ = carries a
          signal diode.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center no-print">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search label, name, component…"
          className="bg-panel border rounded px-3 py-1.5 text-sm w-64 outline-none focus:border-accent-2"
        />
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="bg-panel border rounded px-2 py-1.5 text-sm"
        >
          <option value="all">All groups</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <label className="text-sm text-muted flex items-center gap-1.5">
          <input type="checkbox" checked={showFuture} onChange={(e) => setShowFuture(e.target.checked)} />
          show future
        </label>
        <span className="text-sm text-muted ml-auto">{rows.length} wires</span>
      </div>

      <div className="overflow-auto border rounded-lg">
        <table className="wtable">
          <thead>
            <tr>
              <th>Label</th>
              <th>Purpose</th>
              <th>From</th>
              <th>To</th>
              <th>Ideal</th>
              <th>Buy</th>
              <th>Length</th>
              <th>Fuse</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.id} style={w.future ? { opacity: 0.55 } : undefined}>
                <td>
                  <span className="label-chip">{w.label}</span>
                  {diodeWire.has(w.id) && <span title="signal diode" className="ml-1 text-accent-2">⬩</span>}
                </td>
                <td>{w.name}</td>
                <td className="text-muted">{endLabel(w.from.component, w.from.terminal)}</td>
                <td className="text-muted">{endLabel(w.to.component, w.to.terminal)}</td>
                <td className="font-mono whitespace-nowrap">
                  {w.mm2} <span className="text-muted">mm²</span>
                </td>
                <td className="font-mono whitespace-nowrap">
                  <span className="px-1 rounded bg-panel-2">{w.tierId}</span> {w.recMm2}
                  <span className="text-muted"> mm²</span>
                </td>
                <td className="font-mono whitespace-nowrap">{(w.lengthMm / 1000).toFixed(2)} m</td>
                <td className="text-muted text-xs">{circuit.get(w.circuit)?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
