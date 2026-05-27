/**
 * Graphviz `dot` per-module diagram — an ALTERNATIVE layout to the in-app ELK
 * one, to compare edge routing / crossing reduction (dot is the gold standard
 * for non-overlapping layered diagrams + spline routing).
 *
 *   npx tsx scripts/gen-dot-module.ts front-clip      # -> harness/dot-front-clip.dot
 *   dot -Tsvg harness/dot-front-clip.dot -o public/diagrams/dot-front-clip.svg
 *
 * Mirrors elk-module-diagram.tsx: relays collapse into their block (one box),
 * a wire that leaves the module ends at the connector it plugs through (the
 * boundary), ground stays off the graph, and connectors are pinned to the left
 * lane / end-devices to the right lane (dot rank=min / rank=max).
 */
import { writeFileSync } from "node:fs";
import { resolvedWires, allNodes } from "../src/data/harness/index";
import { harnessModules, moduleConnectors } from "../src/data/harness/modules";
import { relays } from "../src/data/harness/relays";
import { circuits } from "../src/data/harness/circuits";
import { logicalBulkheads } from "../src/data/harness/connectors";

const GROUP_COLOR: Record<string, string> = {
  power: "#9aa7b8", charging: "#e8b04b", starting: "#c98a4b", ignition: "#e2554a",
  headlights: "#f5c451", "exterior-lights": "#8bd17c", signals: "#56b4e9",
  instruments: "#b07cd1", wipers: "#4bc0c0", cooling: "#7cd1c4", fuel: "#e87c7c",
  comfort: "#9a9a9a", future: "#566",
};
const DEVICE = new Set(["lamp", "warning-light", "horn", "motor", "pump", "gauge", "sender", "sensor"]);

const moduleId = process.argv[2] ?? "front-clip";
const mod = harnessModules.find((m) => m.id === moduleId);
if (!mod) throw new Error(`unknown module '${moduleId}'`);

const inModule = new Set(mod.componentIds);
const ownedConn = new Set(moduleConnectors[moduleId] ?? []);
const node = new Map(allNodes.map((n) => [n.id, n]));
const relayBlock = new Map(relays.map((r) => [r.id, r.mountedIn]));
const circuitGroup = new Map(circuits.map((c) => [c.id, c.group]));
const connName = new Map(logicalBulkheads.map((c) => [c.id, c.name]));

const displayId = (c: string) => relayBlock.get(c) ?? c;
const isConnector = (id: string) => connName.has(id);
const isGround = (id: string) => node.get(id)?.kind === "ground";
const isBlock = (id: string) => {
  const k = node.get(id)?.kind;
  return k === "fuse-block" || k === "distribution";
};
const resolve = (comp: string, via?: string[]) => {
  if (inModule.has(comp)) return displayId(comp);
  return (via ?? []).find((v) => ownedConn.has(v)) ?? comp;
};
const esc = (s: string) => s.replace(/"/g, "'");
const shortName = (id: string) =>
  isConnector(id)
    ? id.toUpperCase()
    : esc((node.get(id)?.name ?? id).replace(/\s*\(.*?\)\s*/g, " ").replace(/ — .*/, "").replace(/ relay.*/i, " relay").trim());

const ids = new Set<string>();
const edges: { s: string; t: string; label: string; color: string }[] = [];
for (const w of resolvedWires) {
  if (!(inModule.has(w.from.component) || inModule.has(w.to.component)) || w.future) continue;
  const s = resolve(w.from.component, w.via);
  const t = resolve(w.to.component, w.via);
  if (s === t || isGround(s) || isGround(t)) continue;
  ids.add(s);
  ids.add(t);
  edges.push({ s, t, label: esc(w.label), color: GROUP_COLOR[circuitGroup.get(w.circuit)!] ?? "#888" });
}

const nodeStyle = (id: string) => {
  if (isConnector(id)) return `fillcolor="#1c2530", color="#5a6678", penwidth=2`;
  if (isBlock(id)) return `fillcolor="#13201a"`;
  return `fillcolor="#161d28"`;
};

const conns = [...ids].filter(isConnector);
const devs = [...ids].filter((id) => DEVICE.has(node.get(id)?.kind ?? ""));

const L: string[] = [];
L.push(`digraph "${moduleId}" {`);
// splines=ortho gives the cleanest right-angle "wiring diagram" routing; it
// can't place inline edge labels, so wire labels go on xlabels (forced on).
L.push(`  rankdir=LR; bgcolor="transparent"; splines=ortho; forcelabels=true; nodesep=0.45; ranksep=1.1;`);
L.push(`  node [shape=box, style="rounded,filled", color="#2a323f", fontcolor="#e7ecf3", fontsize=10, fontname="Helvetica"];`);
L.push(`  edge [dir=none, fontsize=8, fontname="Helvetica", fontcolor="#cdd0c4"];`);
for (const id of ids) L.push(`  "${id}" [label="${shortName(id)}", ${nodeStyle(id)}];`);
if (conns.length) L.push(`  { rank=min; ${conns.map((c) => `"${c}"`).join("; ")}; }`);
if (devs.length) L.push(`  { rank=max; ${devs.map((d) => `"${d}"`).join("; ")}; }`);
for (const e of edges) L.push(`  "${e.s}" -> "${e.t}" [xlabel="${e.label}", color="${e.color}", fontcolor="${e.color}"];`);
L.push(`}`);

writeFileSync(`harness/dot-${moduleId}.dot`, L.join("\n") + "\n");
console.log(`wrote harness/dot-${moduleId}.dot (${ids.size} nodes, ${edges.length} edges)`);
