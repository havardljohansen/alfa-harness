/**
 * Precompute solveCircle outputs for every harnessModule's default (full)
 * subgraph. The model is static — the routes don't depend on user
 * interaction — so paying the heavy solveCircle cost at build time and
 * shipping the result as JSON is the right trade-off. The browser reads
 * a tiny static file instead of running ~8 s of JS on every page load.
 *
 * Interactive isolation subgraphs (when the user clicks to filter to a
 * subset of components) still solve at runtime — those are smaller graphs
 * and aren't pre-known.
 *
 * Run after any model change that affects the visualisation:
 *   npx tsx scripts/precompute-routes.ts
 *
 * Output: src/data/precomputed-routes.json — imported by the React component.
 */
import { writeFileSync } from "node:fs";
import { resolvedWires, allNodes } from "../src/data/harness";
import { harnessModules, moduleConnectors } from "../src/data/harness/modules";
import { solveCircleUncached, optimalOrder, type REdge, type Routed } from "../src/lib/circle-route";

const node = new Map(allNodes.map((n) => [n.id, n]));
const isGround = (id: string) => node.get(id)?.kind === "ground";

function buildSubgraph(moduleId: string) {
  const mod = harnessModules.find((m) => m.id === moduleId)!;
  const inModule = new Set(mod.componentIds);
  const ownedConn = new Set(moduleConnectors[moduleId] ?? []);
  const resolve = (comp: string, w: { from: { component: string }; to: { component: string }; via?: string[] }) => {
    if (inModule.has(comp)) return comp;
    const fromVia = (w.via ?? []).find((v) => ownedConn.has(v));
    if (fromVia) return fromVia;
    const other = w.from.component === comp ? w.to.component : w.from.component;
    if (ownedConn.has(other)) return other;
    return comp;
  };
  const idx = new Map<string, number>();
  const boxes: string[] = [];
  const addBox = (id: string) => { if (!idx.has(id)) { idx.set(id, boxes.length); boxes.push(id); } return idx.get(id)!; };
  const pairs = new Map<string, REdge>();
  for (const w of resolvedWires) {
    if (!(inModule.has(w.from.component) || inModule.has(w.to.component))) continue;
    if (w.module && w.module !== moduleId) continue;
    const s = resolve(w.from.component, w), t = resolve(w.to.component, w);
    if (s === t || isGround(s) || isGround(t)) continue;
    const ai = addBox(s), bi = addBox(t);
    const k = `${Math.min(ai, bi)}|${Math.max(ai, bi)}`;
    if (!pairs.has(k)) pairs.set(k, { a: Math.min(ai, bi), b: Math.max(ai, bi) });
  }
  return { boxes, edges: [...pairs.values()] };
}

type Cached = {
  moduleId: string;
  // Inputs that determine the cache key in circle-route's routeCache.
  // Populated at module-load so the React component's solveCircle call
  // hits the cache instead of recomputing.
  n: number;
  size: number;
  slotEdges: { a: number; b: number }[];
  active: number[];
  // The cached output.
  routed: Routed;
  // Sidecar useful for the React component without re-running optimalOrder.
  boxes: string[];
  boxAtSlot: number[];
};

const SIZE_FOR = (n: number) => Math.max(440, Math.min(720, 380 + n * 13)); // mirror React component

const out: Cached[] = [];
let totalMs = 0;
for (const mod of harnessModules) {
  const { boxes, edges } = buildSubgraph(mod.id);
  if (boxes.length === 0) continue;
  const n = boxes.length;
  const size = SIZE_FOR(n);
  const t0 = performance.now();
  const boxAtSlot = optimalOrder(n, edges);
  const slotOfSub = new Array(n).fill(0);
  boxAtSlot.forEach((subIdx, slot) => (slotOfSub[subIdx] = slot));
  const slotEdges = edges.map((e) => ({ a: slotOfSub[e.a], b: slotOfSub[e.b] }));
  const active = edges.map((_, i) => i);
  const routed = solveCircleUncached(n, slotEdges, active, size);
  const ms = performance.now() - t0;
  totalMs += ms;
  console.log(`  ${mod.id.padEnd(18)}  n=${n}  circles=${routed.circles}  crossings=${routed.crossings}  length=${Math.round(routed.length)}  (${ms.toFixed(0)} ms)`);
  out.push({ moduleId: mod.id, n, size, slotEdges, active, routed, boxes, boxAtSlot });
}

const path = "src/data/precomputed-routes.json";
writeFileSync(path, JSON.stringify(out, null, 2));
console.log(`\nWrote ${out.length} module routes → ${path} (${totalMs.toFixed(0)} ms total compute)`);
