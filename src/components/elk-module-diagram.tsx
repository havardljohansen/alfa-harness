"use client";

import { useEffect, useMemo, useState } from "react";
import { ReactFlow, Background, Controls, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ELK from "elkjs/lib/elk.bundled.js";
import { resolvedWires, allNodes } from "@/data/harness";
import { circuits } from "@/data/harness/circuits";
import { harnessModules, moduleConnectors } from "@/data/harness/modules";
import { relays, fuseBlocks } from "@/data/harness/relays";
import { fuses } from "@/data/harness/fuses";
import { connectors, logicalBulkheads } from "@/data/harness/connectors";
import { BlockGrid, ConnectorGrid } from "@/components/layout-grids";
import type { CircuitGroup } from "@/data/harness/types";

const elk = new ELK();
const circuitGroup = new Map(circuits.map((c) => [c.id, c.group]));
const node = new Map(allNodes.map((n) => [n.id, n]));
const moduleName = new Map(harnessModules.flatMap((m) => m.componentIds.map((c) => [c, m.name] as const)));
// A relay is shown as part of its block (the PDM/RTMR is one physical box).
const relayBlock = new Map(relays.map((r) => [r.id, r.mountedIn]));
const displayId = (comp: string) => relayBlock.get(comp) ?? comp;
const isBlock = (id: string) => { const k = node.get(id)?.kind; return k === "fuse-block" || k === "distribution"; };
// Connectors are the module boundary (a crossing wire terminates at its plug).
const connName = new Map(logicalBulkheads.map((c) => [c.id, c.name]));
const physForLogical = (id: string) => connectors.filter((c) => c.id === id || c.id.startsWith(id + "-"));
const isConnector = (id: string) => connName.has(id);
// Ground is a common rail, not a hub: routing every load into one gnd node makes
// a star that swamps the picture. Keep it OUT of the graph and show it as a rail.
const isGround = (id: string) => node.get(id)?.kind === "ground";
// Lane assignment via PARTITIONING (not FIRST/LAST layer constraints): the
// connectors are the left lane (0), end-of-line devices the right lane (2),
// power blocks + switches the middle (1). Partitioning enforces the left→right
// lane order WITHOUT the FIRST/LAST restriction that a constrained node's
// edges must go to a *_SEPARATE node — which the device→device jumpers (park
// L→R, tail L→R, side repeaters) were violating and crashing ELK.
const DEVICE_KINDS = new Set(["lamp", "warning-light", "horn", "motor", "pump", "gauge", "sender", "sensor"]);
const partitionOf = (id: string): string => {
  if (isConnector(id)) return "0";
  const k = node.get(id)?.kind;
  if (k && DEVICE_KINDS.has(k)) return "2";
  return "1";
};

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
    if (!mod) return { items: [] as { id: string; num: number }[], rfEdges: [] as Edge[], grounds: [] as string[] };
    const inModule = new Set(mod.componentIds);
    const ownedConn = new Set(moduleConnectors[moduleId] ?? []);
    // Resolve a wire end to its diagram node: in-module parts collapse relays
    // into their block; a part OUTSIDE the module resolves to the connector this
    // module plugs through (its boundary), else to the external part itself.
    const resolve = (comp: string, via?: string[]) => {
      if (inModule.has(comp)) return displayId(comp);
      const c = (via ?? []).find((v) => ownedConn.has(v));
      return c ?? comp;
    };
    const wires = resolvedWires.filter((w) => inModule.has(w.from.component) || inModule.has(w.to.component));
    const ids: string[] = [];
    const grounds = new Set<string>();
    const rfEdges: Edge[] = [];
    for (const w of wires) {
      const s = resolve(w.from.component, w.via);
      const t = resolve(w.to.component, w.via);
      if (s === t) continue; // inside a single block — see its layout below
      // Ground stays off the routed graph; collect it for the rail below.
      if (isGround(s)) { grounds.add(s); continue; }
      if (isGround(t)) { grounds.add(t); continue; }
      if (!ids.includes(s)) ids.push(s);
      if (!ids.includes(t)) ids.push(t);
      rfEdges.push({
        id: w.id, source: s, target: t, label: w.label,
        labelStyle: { fontSize: 8, fill: "#cdd0c4" }, labelBgStyle: { fill: "#0b0e13" },
        style: { stroke: GROUP_COLOR[circuitGroup.get(w.circuit)!] ?? "#888", strokeWidth: 1.4 },
      });
    }
    const items = ids.map((id, i) => ({ id, num: i + 1 }));
    return { items, rfEdges, grounds: [...grounds] };
  }, [moduleId]);

  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    const inModule = new Set(harnessModules.find((m) => m.id === moduleId)?.componentIds ?? []);
    const graph = {
      id: "root",
      layoutOptions: {
        "elk.algorithm": "layered", "elk.direction": "RIGHT",
        "elk.layered.spacing.nodeNodeBetweenLayers": "90", "elk.spacing.nodeNode": "24",
        "elk.edgeRouting": "ORTHOGONAL",
        // Lanes via partitioning (connectors 0 / blocks 1 / devices 2) — robust
        // to device→device jumpers, unlike FIRST/LAST. Let ELK reorder EDGES to
        // minimise crossings, spend more effort on it, and SPACE parallel wires
        // apart so they stop stacking (the edgeEdge/edgeNode spacings).
        "elk.partitioning.activate": "true",
        "elk.layered.considerModelOrder.strategy": "NODES",
        "elk.layered.thoroughness": "40",
        "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
        "elk.spacing.edgeEdge": "14",
        "elk.spacing.edgeNode": "18",
        "elk.layered.spacing.edgeEdgeBetweenLayers": "14",
        "elk.layered.spacing.edgeNodeBetweenLayers": "18",
      },
      children: base.items.map((it) => ({
        id: it.id,
        width: 132,
        height: 30,
        layoutOptions: { "elk.partitioning.partition": partitionOf(it.id) },
      })),
      edges: base.rfEdges.map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] })),
    };
    let live = true;
    elk.layout(graph).then((res) => {
      if (!live) return;
      const pos = new Map((res.children ?? []).map((c) => [c.id, { x: c.x ?? 0, y: c.y ?? 0 }]));
      setNodes(base.items.map((it) => {
        const conn = isConnector(it.id);
        const n = node.get(it.id);
        const external = !conn && !inModule.has(it.id);
        const label = conn ? `${it.num} · ${connName.get(it.id)}` : `${it.num} · ${shortName(n?.name ?? it.id)}`;
        return {
          id: it.id, position: pos.get(it.id) ?? { x: 0, y: 0 },
          data: { label },
          style: {
            fontSize: 9, width: 132, padding: 4, borderRadius: 7,
            border: conn ? "2px solid #5a6678" : external ? "1px dashed #3a4250" : "1px solid #2a323f",
            background: conn ? "#1c2530" : external ? "#10141b" : "#161d28",
            color: conn ? "#dfe4ea" : external ? "#7d8694" : "#e7ecf3",
          },
        };
      }));
    });
    return () => { live = false; };
  }, [base, moduleId]);

  const inModuleSet = new Set(harnessModules.find((m) => m.id === moduleId)?.componentIds ?? []);
  const connItems = base.items.filter((it) => isConnector(it.id));
  const blockItems = base.items.filter((it) => isBlock(it.id));
  const compItems = base.items.filter((it) => !isConnector(it.id) && !isBlock(it.id));

  return (
    <div>
      <div className="border rounded-lg" style={{ height: "22rem" }}>
        <ReactFlow nodes={nodes} edges={base.rfEdges} fitView minZoom={0.2} proOptions={{ hideAttribution: true }}>
          <Background color="#1b212c" gap={20} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {/* Ground rail — kept off the routed graph so it doesn't fan into a star. */}
      {base.grounds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] border rounded px-2 py-1 bg-panel">
          <span className="uppercase tracking-wide text-muted">Ground rail</span>
          <span aria-hidden className="text-base leading-none">⏚</span>
          {base.grounds.map((g) => (
            <span key={g} className="label-chip">{node.get(g)?.name ?? g}</span>
          ))}
          <span className="text-muted">— every load in this module lands here; one thick trunk to the hub.</span>
        </div>
      )}

      {/* Connector figures: the pin layout of each plug this module crosses */}
      {connItems.map((l) => (
        <div key={l.id} className="border rounded p-2 mt-2 bg-panel">
          <div className="text-xs font-semibold">
            <span className="font-mono">{l.num}</span> · {connName.get(l.id)}
            <span className="text-muted font-normal"> — connector pin layout</span>
          </div>
          {physForLogical(l.id).map((c) => (
            <div key={c.id} className="mt-1.5">
              <div className="text-[10px] text-muted">{c.name} · {c.pins.length}/{c.ways} pins</div>
              <ConnectorGrid connector={c} />
            </div>
          ))}
        </div>
      ))}

      {/* Power-block figures: the relay/fuse grid + where every pin goes */}
      {blockItems.map((l) => {
        const blk = fuseBlocks.find((b) => b.id === l.id)!;
        const bf = fuses.filter((f) => f.block === l.id);
        const br = relays.filter((r) => r.mountedIn === l.id);
        return (
          <div key={l.id} className="border rounded p-2 mt-2 bg-panel">
            <div className="text-xs font-semibold">
              <span className="font-mono">{l.num}</span> · {blk.name}
              {!inModuleSet.has(l.id) && <span className="text-muted"> · ↗ {moduleName.get(l.id)}</span>}
              <span className="text-muted font-normal"> — relay/fuse layout</span>
            </div>
            <div className="mt-1.5"><BlockGrid block={blk} blockFuses={bf} blockRelays={br} /></div>
            <div className="grid md:grid-cols-2 gap-x-4 gap-y-0.5 mt-2 text-[10px]">
              <div>
                <div className="uppercase tracking-wide text-muted">Relay pins → where</div>
                {br.map((r) => (
                  <div key={r.id}>
                    <span className="text-fg">{r.name.replace(/ relay.*/i, "")}</span>: coil← {r.coilTriggerLabel} · 30← {r.commonFrom} · 87→ {r.out87}
                    {r.out87a ? ` · 87a→ ${r.out87a}` : ""}
                  </div>
                ))}
              </div>
              <div>
                <div className="uppercase tracking-wide text-muted">Fuses → feeds</div>
                {bf.filter((f) => f.ratingA > 0).map((f) => (
                  <div key={f.id}>F{f.position} · {f.ratingA} A · {f.name} → {f.feeds}</div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Component figures: symbol + terminals */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5 mt-2">
        {compItems.map((l) => {
          const n = node.get(l.id);
          if (!n) return null;
          const external = !inModuleSet.has(l.id);
          return (
            <div key={l.id} className="flex items-center gap-2 text-xs border rounded px-2 py-1 bg-panel">
              <span className="font-mono font-semibold w-5 shrink-0 text-center">{l.num}</span>
              <KindGlyph kind={n.kind} />
              <span className="min-w-0">
                <span className={external ? "text-muted" : ""}>{n.name}</span>
                {external && <span className="text-[10px] text-muted"> · ↗ {moduleName.get(l.id)}</span>}
                <span className="block text-[10px] text-muted truncate">{n.terminals.map((t) => t.id).join(" · ")}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
