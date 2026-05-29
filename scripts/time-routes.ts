import { resolvedWires, allNodes } from "../src/data/harness";
import { harnessModules, moduleConnectors } from "../src/data/harness/modules";
import { logicalBulkheads } from "../src/data/harness/connectors";
import { solveCircle, optimalOrder, type REdge } from "../src/lib/circle-route";

const node = new Map(allNodes.map((n) => [n.id, n]));
const isGround = (id: string) => node.get(id)?.kind === "ground";

function buildSubgraph(moduleId: string) {
  const mod = harnessModules.find((m) => m.id === moduleId)!;
  const inModule = new Set(mod.componentIds);
  const ownedConn = new Set(moduleConnectors[moduleId] ?? []);
  const resolve = (comp: string, w: any) => {
    if (inModule.has(comp)) return comp;
    const fromVia = (w.via ?? []).find((v: string) => ownedConn.has(v));
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
    const k = `${Math.min(ai,bi)}|${Math.max(ai,bi)}`;
    if (!pairs.has(k)) pairs.set(k, { a: Math.min(ai,bi), b: Math.max(ai,bi) });
  }
  return { boxes, edges: [...pairs.values()] };
}

for (const mod of harnessModules) {
  const { boxes, edges } = buildSubgraph(mod.id);
  if (boxes.length === 0) continue;
  const n = boxes.length;
  const t0 = performance.now();
  const boxAtSlot = optimalOrder(n, edges);
  const t1 = performance.now();
  const slotOfSub = new Array(n).fill(0);
  boxAtSlot.forEach((subIdx, slot) => (slotOfSub[subIdx] = slot));
  const slotEdges = edges.map((e) => ({ a: slotOfSub[e.a], b: slotOfSub[e.b] }));
  const t2 = performance.now();
  solveCircle(n, slotEdges, edges.map((_, i) => i), Math.max(440, Math.min(720, 380 + n * 13)));
  const t3 = performance.now();
  console.log(`${mod.id.padEnd(18)} n=${String(n).padStart(3)} m=${String(edges.length).padStart(3)}  optimalOrder=${(t1-t0).toFixed(0)}ms  solveCircle=${(t3-t2).toFixed(0)}ms  total=${(t3-t0).toFixed(0)}ms`);
}
