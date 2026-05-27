"use client";

import { useMemo } from "react";
import { ReactFlow, Background, Controls, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { resolvedWires, allNodes } from "@/data/harness";
import { circuits } from "@/data/harness/circuits";
import { zones } from "@/data/harness/zones";
import { harnessModules } from "@/data/harness/modules";
import type { CircuitGroup } from "@/data/harness/types";

const circuitGroup = new Map(circuits.map((c) => [c.id, c.group]));
const zoneOrder = zones.map((z) => z.id);
const nameById = new Map(allNodes.map((n) => [n.id, n.name]));
const moduleOfComp = new Map(harnessModules.flatMap((m) => m.componentIds.map((c) => [c, m] as const)));

const GROUP_COLOR: Record<CircuitGroup, string> = {
  power: "#9aa7b8", charging: "#e8b04b", starting: "#c98a4b", ignition: "#e2554a",
  headlights: "#f5c451", "exterior-lights": "#8bd17c", signals: "#56b4e9",
  instruments: "#b07cd1", wipers: "#4bc0c0", cooling: "#7cd1c4", fuel: "#e87c7c",
  comfort: "#9a9a9a", future: "#566",
};

/** Interactive, compact per-module wiring view — fits the container (pan/zoom),
 *  shows the module's parts solid and the off-module parts it plugs into dimmed. */
export function ModuleDiagram({ moduleId }: { moduleId: string }) {
  const { nodes, edges } = useMemo(() => {
    const mod = harnessModules.find((m) => m.id === moduleId);
    if (!mod) return { nodes: [], edges: [] };
    const inModule = new Set(mod.componentIds);

    const wires = resolvedWires.filter(
      (w) => inModule.has(w.from.component) || inModule.has(w.to.component),
    );

    // Components touched, laid out in compact zone columns (internal stacked
    // first, external below), then fit-to-view does the rest.
    const touched = new Set<string>();
    for (const w of wires) {
      touched.add(w.from.component);
      touched.add(w.to.component);
    }
    const perCol: Record<number, number> = {};
    const nodes: Node[] = [...touched].map((id) => {
      const z = allNodes.find((n) => n.id === id)?.zone ?? "dash";
      const col = Math.max(0, zoneOrder.indexOf(z));
      const row = (perCol[col] = (perCol[col] ?? 0) + 1) - 1;
      const external = !inModule.has(id);
      return {
        id,
        position: { x: col * 230, y: row * 66 },
        data: { label: external ? `↗ ${nameById.get(id)}` : nameById.get(id) },
        style: {
          fontSize: 10,
          width: 160,
          padding: 5,
          borderRadius: 8,
          border: external ? "1px dashed #3a4250" : "1px solid #2a323f",
          background: external ? "#10141b" : "#161d28",
          color: external ? "#7d8694" : "#e7ecf3",
        },
      };
    });

    const edges: Edge[] = wires.map((w) => ({
      id: w.id,
      source: w.from.component,
      target: w.to.component,
      label: w.label,
      labelStyle: { fontSize: 8, fill: "#cdd0c4" },
      labelBgStyle: { fill: "#0b0e13" },
      style: { stroke: GROUP_COLOR[circuitGroup.get(w.circuit)!] ?? "#888", strokeWidth: 1.5 },
    }));

    return { nodes, edges };
  }, [moduleId]);

  return (
    <div className="border rounded-lg" style={{ height: "26rem" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView minZoom={0.2} proOptions={{ hideAttribution: true }}>
        <Background color="#1b212c" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
