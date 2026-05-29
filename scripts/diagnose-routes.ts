/**
 * Diagnostic: run the circle-route algorithm on every harnessModule's
 * subgraph and print per-module metrics (circles used, total wire length,
 * crossings). Used to iterate on circle-route.ts — lower length + fewer
 * circles + zero crossings = better routing.
 *
 * Run: npx tsx scripts/diagnose-routes.ts
 *
 * NOT a permanent test — kept around for next time the routing needs tuning.
 */
import { resolvedWires, allNodes } from "../src/data/harness";
import { harnessModules, moduleConnectors } from "../src/data/harness/modules";
import { logicalBulkheads } from "../src/data/harness/connectors";
import { solveCircle, optimalOrder, type REdge } from "../src/lib/circle-route";

const node = new Map(allNodes.map((n) => [n.id, n]));
const isConnector = (id: string) => logicalBulkheads.some((c) => c.id === id);
const isGround = (id: string) => node.get(id)?.kind === "ground";

// Mirror of the circle-module-diagram.tsx subgraph builder.
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
  const idIndex = new Map<string, number>();
  const boxes: string[] = [];
  const addBox = (id: string) => { if (!idIndex.has(id)) { idIndex.set(id, boxes.length); boxes.push(id); } return idIndex.get(id)!; };
  const pairs = new Map<string, REdge>();
  for (const w of resolvedWires) {
    if (!(inModule.has(w.from.component) || inModule.has(w.to.component))) continue;
    if (w.module && w.module !== moduleId) continue;
    const s = resolve(w.from.component, w), t = resolve(w.to.component, w);
    if (s === t) continue;
    if (isGround(s) || isGround(t)) continue;
    const ai = addBox(s), bi = addBox(t);
    const a = Math.min(ai, bi), b = Math.max(ai, bi);
    const key = `${a}|${b}`;
    if (!pairs.has(key)) pairs.set(key, { a, b });
  }
  return { boxes, edges: [...pairs.values()] };
}

const SIZE = 600;
console.log("\nModule routing metrics (size=600px)\n" + "─".repeat(78));
console.log("module             boxes  wires  circles  crossings  length  avg/wire");
console.log("─".repeat(78));

let totalLen = 0, totalCircles = 0, totalCrossings = 0;
for (const mod of harnessModules) {
  const { boxes, edges } = buildSubgraph(mod.id);
  if (boxes.length === 0) continue;
  const n = boxes.length;
  const boxAtSlot = optimalOrder(n, edges);
  const slotOfSub = new Array(n).fill(0);
  boxAtSlot.forEach((subIdx, slot) => (slotOfSub[subIdx] = slot));
  const slotEdges = edges.map((e) => ({ a: slotOfSub[e.a], b: slotOfSub[e.b] }));
  const routed = solveCircle(n, slotEdges, edges.map((_, i) => i), SIZE);
  const m = edges.length;
  const avg = m > 0 ? Math.round(routed.length / m) : 0;
  console.log(
    `${mod.id.padEnd(18)} ${String(n).padStart(5)}  ${String(m).padStart(5)}  ${String(routed.circles).padStart(7)}  ${String(routed.crossings).padStart(9)}  ${String(Math.round(routed.length)).padStart(6)}  ${String(avg).padStart(8)}`,
  );
  totalLen += routed.length;
  totalCircles += routed.circles;
  totalCrossings += routed.crossings;
}
console.log("─".repeat(78));
console.log(`totals             ${" ".repeat(12)}  ${String(totalCircles).padStart(7)}  ${String(totalCrossings).padStart(9)}  ${String(Math.round(totalLen)).padStart(6)}`);
