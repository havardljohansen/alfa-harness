"use client";

import { useEffect, useMemo, useState } from "react";
import { ReactFlow, Background, Controls, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ELK from "elkjs/lib/elk.bundled.js";
import { resolvedWires, allNodes } from "@/data/harness";
import { circuits } from "@/data/harness/circuits";
import { harnessModules } from "@/data/harness/modules";
import type { CircuitGroup } from "@/data/harness/types";

const elk = new ELK();
const circuitGroup = new Map(circuits.map((c) => [c.id, c.group]));
const node = new Map(allNodes.map((n) => [n.id, n]));
const moduleName = new Map(harnessModules.flatMap((m) => m.componentIds.map((c) => [c, m.name] as const)));

const GROUP_COLOR: Record<CircuitGroup, string> = {
  power: "#9aa7b8", charging: "#e8b04b", starting: "#c98a4b", ignition: "#e2554a",
  headlights: "#f5c451", "exterior-lights": "#8bd17c", signals: "#56b4e9",
  instruments: "#b07cd1", wipers: "#4bc0c0", cooling: "#7cd1c4", fuel: "#e87c7c",
  comfort: "#9a9a9a", future: "#566",
};

// Compact glyph per component kind — "how it looks" at a glance.
function KindGlyph({ kind }: { kind: string }) {
  const s = { width: 22, height: 18, stroke: "#cdd0c4", fill: "none", strokeWidth: 1.3 };
  switch (kind) {
    case "lamp": case "warning-light":
      return (<svg {...s} viewBox="0 0 22 18"><circle cx="11" cy="9" r="6" /><path d="M7 5l8 8M15 5l-8 8" /></svg>);
    case "relay":
      return (<svg {...s} viewBox="0 0 22 18"><rect x="2" y="3" width="18" height="12" /><path d="M6 4v10M9 4v10" /><path d="M13 5l5 3" /></svg>);
    case "fuse-block": case "distribution":
      return (<svg {...s} viewBox="0 0 22 18"><rect x="2" y="3" width="18" height="12" /><rect x="6" y="7" width="10" height="4" /></svg>);
    case "switch": case "ignition-switch":
      return (<svg {...s} viewBox="0 0 22 18"><circle cx="4" cy="13" r="1.5" /><circle cx="18" cy="13" r="1.5" /><path d="M4 13L15 5" /></svg>);
    case "gauge":
      return (<svg {...s} viewBox="0 0 22 18"><circle cx="11" cy="9" r="6" /><path d="M11 9l3-3" /></svg>);
    case "motor": case "pump":
      return (<svg {...s} viewBox="0 0 22 18"><circle cx="11" cy="9" r="6" /><text x="11" y="12" fontSize="8" fill="#cdd0c4" stroke="none" textAnchor="middle">M</text></svg>);
    case "ground":
      return (<svg {...s} viewBox="0 0 22 18"><path d="M11 3v6M5 9h12M7 12h8M9 15h4" /></svg>);
    case "battery":
      return (<svg {...s} viewBox="0 0 22 18"><path d="M6 5v8M9 7v4M13 5v8M16 7v4M6 9H3M16 9h3" /></svg>);
    case "horn":
      return (<svg {...s} viewBox="0 0 22 18"><path d="M4 6v6h4l6 4V2l-6 4H4z" /></svg>);
    case "flasher": case "resistor":
      return (<svg {...s} viewBox="0 0 22 18"><path d="M2 9h3l2-4 4 8 4-8 2 4h3" /></svg>);
    case "sender": case "sensor":
      return (<svg {...s} viewBox="0 0 22 18"><circle cx="11" cy="9" r="6" /><text x="11" y="12" fontSize="7" fill="#cdd0c4" stroke="none" textAnchor="middle">S</text></svg>);
    default:
      return (<svg {...s} viewBox="0 0 22 18"><rect x="3" y="4" width="16" height="10" /></svg>);
  }
}

function shortName(name: string) {
  return name.replace(/\s*\(.*?\)\s*/g, " ").replace(/ — .*/, "").replace(/ relay.*/i, " relay").trim();
}

export function ElkModuleDiagram({ moduleId }: { moduleId: string }) {
  const base = useMemo(() => {
    const mod = harnessModules.find((m) => m.id === moduleId);
    if (!mod) return { items: [] as { id: string; num: number }[], rfEdges: [] as Edge[] };
    const inModule = new Set(mod.componentIds);
    const wires = resolvedWires.filter((w) => inModule.has(w.from.component) || inModule.has(w.to.component));
    const ids: string[] = [];
    for (const w of wires) for (const c of [w.from.component, w.to.component]) if (!ids.includes(c)) ids.push(c);
    const items = ids.map((id, i) => ({ id, num: i + 1 }));
    const rfEdges: Edge[] = wires.map((w) => ({
      id: w.id, source: w.from.component, target: w.to.component, label: w.label,
      labelStyle: { fontSize: 8, fill: "#cdd0c4" }, labelBgStyle: { fill: "#0b0e13" },
      style: { stroke: GROUP_COLOR[circuitGroup.get(w.circuit)!] ?? "#888", strokeWidth: 1.4 },
    }));
    return { items, rfEdges };
  }, [moduleId]);

  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    const inModule = new Set(harnessModules.find((m) => m.id === moduleId)?.componentIds ?? []);
    const graph = {
      id: "root",
      layoutOptions: {
        "elk.algorithm": "layered", "elk.direction": "RIGHT",
        "elk.layered.spacing.nodeNodeBetweenLayers": "55", "elk.spacing.nodeNode": "22",
        "elk.edgeRouting": "ORTHOGONAL",
      },
      children: base.items.map((it) => ({ id: it.id, width: 132, height: 30 })),
      edges: base.rfEdges.map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] })),
    };
    let live = true;
    elk.layout(graph).then((res) => {
      if (!live) return;
      const pos = new Map((res.children ?? []).map((c) => [c.id, { x: c.x ?? 0, y: c.y ?? 0 }]));
      setNodes(base.items.map((it) => {
        const n = node.get(it.id)!;
        const external = !inModule.has(it.id);
        return {
          id: it.id, position: pos.get(it.id) ?? { x: 0, y: 0 },
          data: { label: `${it.num} · ${shortName(n.name)}` },
          style: {
            fontSize: 9, width: 132, padding: 4, borderRadius: 7,
            border: external ? "1px dashed #3a4250" : "1px solid #2a323f",
            background: external ? "#10141b" : "#161d28", color: external ? "#7d8694" : "#e7ecf3",
          },
        };
      }));
    });
    return () => { live = false; };
  }, [base, moduleId]);

  const legend = base.items.map((it) => ({ ...it, n: node.get(it.id)! }));

  return (
    <div>
      <div className="border rounded-lg" style={{ height: "22rem" }}>
        <ReactFlow nodes={nodes} edges={base.rfEdges} fitView minZoom={0.2} proOptions={{ hideAttribution: true }}>
          <Background color="#1b212c" gap={20} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5 mt-2">
        {legend.map((l) => {
          const external = !harnessModules.find((m) => m.id === moduleId)?.componentIds.includes(l.id);
          return (
            <div key={l.id} className="flex items-center gap-2 text-xs border rounded px-2 py-1 bg-panel">
              <span className="font-mono font-semibold w-5 shrink-0 text-center">{l.num}</span>
              <KindGlyph kind={l.n.kind} />
              <span className="min-w-0">
                <span className={external ? "text-muted" : ""}>{l.n.name}</span>
                {external && <span className="text-[10px] text-muted"> · ↗ {moduleName.get(l.id)}</span>}
                <span className="block text-[10px] text-muted truncate">{l.n.terminals.map((t) => t.id).join(" · ")}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
