"use client";

import { useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { resolvedWires, allNodes } from "@/data/harness";
import { circuits } from "@/data/harness/circuits";
import { zones } from "@/data/harness/zones";
import type { CircuitGroup } from "@/data/harness/types";

const circuitGroup = new Map(circuits.map((c) => [c.id, c.group]));
const zoneOrder = zones.map((z) => z.id);

const GROUP_COLOR: Record<CircuitGroup, string> = {
  power: "#9aa7b8",
  charging: "#e8b04b",
  starting: "#c98a4b",
  ignition: "#e2554a",
  headlights: "#f5c451",
  "exterior-lights": "#8bd17c",
  signals: "#56b4e9",
  instruments: "#b07cd1",
  wipers: "#4bc0c0",
  cooling: "#7cd1c4",
  fuel: "#e87c7c",
  comfort: "#9a9a9a",
  future: "#566",
};

const allGroups = [...new Set(circuits.map((c) => c.group))] as CircuitGroup[];

// Deterministic layout: one column per zone, nodes stacked within.
function layout(): Record<string, { x: number; y: number }> {
  const pos: Record<string, { x: number; y: number }> = {};
  const perZone: Record<string, number> = {};
  for (const n of allNodes) {
    const zi = zoneOrder.indexOf(n.zone);
    const k = perZone[n.zone] ?? 0;
    perZone[n.zone] = k + 1;
    pos[n.id] = { x: zi * 300, y: k * 64 };
  }
  return pos;
}
const POS = layout();

export default function Explorer() {
  const [active, setActive] = useState<Set<CircuitGroup>>(new Set(allGroups));
  const [showFuture, setShowFuture] = useState(false);
  const [sel, setSel] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const visibleWires = resolvedWires.filter((w) => {
      if (!showFuture && w.future) return false;
      const g = circuitGroup.get(w.circuit);
      return g ? active.has(g) : false;
    });

    const touched = new Set<string>();
    for (const w of visibleWires) {
      touched.add(w.from.component);
      touched.add(w.to.component);
    }

    const nodes: Node[] = allNodes
      .filter((n) => touched.has(n.id))
      .map((n) => ({
        id: n.id,
        position: POS[n.id] ?? { x: 0, y: 0 },
        data: { label: n.name },
        style: {
          fontSize: 11,
          width: 180,
          padding: 6,
          borderRadius: 8,
          border: `1px solid ${sel === n.id ? "#f5c451" : "#2a323f"}`,
          background: n.kind === "relay" ? "#241c10" : n.kind === "fuse-block" || n.kind === "distribution" ? "#13201a" : "#141922",
          color: "#e7ecf3",
        },
      }));

    const edges: Edge[] = visibleWires.map((w) => {
      const g = circuitGroup.get(w.circuit)!;
      return {
        id: w.id,
        source: w.from.component,
        target: w.to.component,
        label: w.label,
        labelStyle: { fontSize: 9, fill: "#cdd0c4" },
        labelBgStyle: { fill: "#0b0e13" },
        style: { stroke: GROUP_COLOR[g], strokeWidth: sel === w.id ? 3 : 1.5 },
        animated: false,
      };
    });

    return { nodes, edges };
  }, [active, showFuture, sel]);

  const toggle = (g: CircuitGroup) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-bold">Circuit explorer</h1>
        <p className="text-muted text-sm mt-0.5">
          Columns are physical zones (battery → engine → dash → cabin → rear). Toggle sections to
          declutter. Edges are wires, coloured by circuit group; hover a node to drag.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 items-center no-print">
        <button
          onClick={() => setActive(new Set(allGroups))}
          className="text-xs px-2 py-1 rounded border bg-panel hover:bg-panel-2"
        >
          all
        </button>
        <button
          onClick={() => setActive(new Set())}
          className="text-xs px-2 py-1 rounded border bg-panel hover:bg-panel-2"
        >
          none
        </button>
        {allGroups.map((g) => (
          <button
            key={g}
            onClick={() => toggle(g)}
            className="text-xs px-2 py-1 rounded border flex items-center gap-1.5"
            style={{
              background: active.has(g) ? "#1b212c" : "#0d1117",
              opacity: active.has(g) ? 1 : 0.5,
            }}
          >
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: GROUP_COLOR[g] }} />
            {g}
          </button>
        ))}
        <label className="text-xs text-muted flex items-center gap-1.5 ml-2">
          <input type="checkbox" checked={showFuture} onChange={(e) => setShowFuture(e.target.checked)} />
          future
        </label>
      </div>

      <div className="border rounded-lg" style={{ height: "70vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={(_, n) => setSel(n.id)}
          onEdgeClick={(_, e) => setSel(e.id)}
          fitView
          minZoom={0.15}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1b212c" gap={20} />
          <Controls />
          <MiniMap pannable zoomable nodeColor="#2a323f" maskColor="#0b0e13cc" />
        </ReactFlow>
      </div>

      <div className="text-xs text-muted">
        {nodes.length} components · {edges.length} wires shown.
      </div>
    </div>
  );
}
