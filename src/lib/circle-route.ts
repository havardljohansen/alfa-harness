// Circular routing engine (generalised from the /circle-test concept).
//
// Boxes are placed evenly on a ring; each connection (an undirected box pair)
// is routed as: spoke out → arc around a concentric circle → spoke in, OR a
// straight chord through the centre when the boxes are exactly opposite and it
// crosses nothing. Circles are free (arc-vs-arc overlap → add a circle). We
// minimise (a) total length and (b) non-circular crossings (spokes/chords),
// then optimise the exit-point ORDER per box (the biggest lever on crossings).
//
// solveCircle(n, edges, active) routes the `active` subset and returns the
// box positions, ring radii and an SVG path per active edge.

export type REdge = { a: number; b: number };
export type Routed = {
  size: number;
  box: number;
  boxR: number;
  positions: { x: number; y: number; rot: number; labelRot: number }[];
  circles: number;
  rings: number[];
  paths: Record<number, string>;
  crossings: number;
};

const TWO_PI = Math.PI * 2;

// Deterministic RNG (seeded off the graph) so the layout is reproducible and
// identical on server prerender + client hydration (no mismatch).
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function hashEdges(n: number, edges: REdge[]) {
  let h = (n * 2654435761) >>> 0;
  for (const e of edges) { h = (h ^ Math.imul(e.a + 1, 73856093) ^ Math.imul(e.b + 1, 19349663)) >>> 0; h = Math.imul(h, 2246822519) >>> 0; }
  return h >>> 0;
}
const norm = (x: number) => { let v = x % TWO_PI; if (v <= -Math.PI) v += TWO_PI; if (v > Math.PI) v -= TWO_PI; return v; };
const norm90 = (a: number) => { let v = ((a % 180) + 180) % 180; if (v > 90) v -= 180; return v; };
const readableAngle = (rot: number) => { const c1 = norm90(rot), c2 = norm90(rot + 90); return Math.abs(c1) <= Math.abs(c2) ? c1 : c2; };

type State = { dir: number[]; rank: number[] }; // dir 0=CW arc, 1=CCW arc, 2=chord
type Order = Record<number, number[]>;

function perms<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const p of perms(rest)) out.push([arr[i], ...p]);
  }
  return out;
}

// Choose which box sits in which slot around the ring to MINIMISE total
// connection length (sum of shorter-arc spans). Adjacent slots end up holding
// closely-connected boxes, so the ring also reads as a proximity map.
// Returns boxAtSlot: slot index → original box index.
export function optimalOrder(n: number, edges: REdge[]): number[] {
  if (n <= 2) return Array.from({ length: n }, (_, i) => i);
  const rng = makeRng(hashEdges(n, edges) ^ 0x9e3779b9);
  const cdist = (p: number, q: number) => { const d = Math.abs(p - q); return Math.min(d, n - d); };
  // slot[orig] = slot position; cost = Σ edges circular slot distance
  const cost = (slot: number[]) => edges.reduce((a, e) => a + cdist(slot[e.a], slot[e.b]), 0);
  let bestSlot: number[] | null = null, bestCost = Infinity;
  for (let r = 0; r < 8; r++) {
    const slot = Array.from({ length: n }, (_, i) => i);
    if (r > 0) for (let i = n - 1; i > 0; i--) { const k = (rng() * (i + 1)) | 0;[slot[i], slot[k]] = [slot[k], slot[i]]; }
    let cur = cost(slot), improved = true;
    while (improved) {
      improved = false;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        [slot[i], slot[j]] = [slot[j], slot[i]];
        const c = cost(slot);
        if (c < cur - 1e-9) { cur = c; improved = true; } else [slot[i], slot[j]] = [slot[j], slot[i]];
      }
    }
    if (cur < bestCost) { bestCost = cur; bestSlot = slot.slice(); }
  }
  const boxAtSlot = new Array(n).fill(0);
  bestSlot!.forEach((s, orig) => (boxAtSlot[s] = orig));
  return boxAtSlot;
}

export function solveCircle(n: number, edges: REdge[], active: number[], size = 600): Routed {
  const rng = makeRng(hashEdges(n, edges));
  const CX = size / 2, CY = size / 2;
  const BOX = Math.max(22, Math.min(48, Math.floor((TWO_PI * (size * 0.34)) / Math.max(1, n) * 0.78)));
  const HALF_DIAG = (BOX * Math.SQRT2) / 2;
  const BOX_GAP = 10;
  const R_BOX = size / 2 - HALF_DIAG - 4;
  const R_INNER = R_BOX - BOX / 2;
  const R_OUTER = Math.max(40, R_INNER - BOX_GAP);
  const HALF_W = ((BOX / 2) / R_INNER) * 0.8;
  const angOf = (i: number) => (i / n) * TWO_PI - Math.PI / 2;
  const pt = (ang: number, r: number): [number, number] => [CX + r * Math.cos(ang), CY + r * Math.sin(ang)];
  const radiusOf = (k: number, K: number) => (R_OUTER * (K - k)) / (K + 1);

  const WB = edges.map((w) => {
    const inc = (w.b - w.a + n) % n;
    const goInc = inc <= n - inc;
    const nShort = goInc ? inc : n - inc;
    const baseShort = (goInc ? 1 : -1) * nShort * (TWO_PI / n);
    return { a: w.a, b: w.b, baseShort, baseLong: baseShort - Math.sign(baseShort || 1) * TWO_PI };
  });
  const DIAMETRIC = WB.map((w) => n % 2 === 0 && (w.b - w.a + n) % n === n / 2);

  const departKey = (i: number, box: number, st: State) => {
    const w = WB[i], atA = w.a === box;
    if (st.dir[i] === 2) return norm(angOf(atA ? w.b : w.a) - angOf(box));
    const base = st.dir[i] === 0 ? w.baseShort : w.baseLong;
    return atA ? base : -base;
  };
  const incidentByBox = (act: number[]): Order => {
    const m: Order = {};
    for (const i of act) { (m[WB[i].a] ??= []).push(i); (m[WB[i].b] ??= []).push(i); }
    return m;
  };
  const heuristicOrder = (act: number[], st: State): Order => {
    const inc = incidentByBox(act), ord: Order = {};
    for (const b in inc) { const box = +b; ord[box] = inc[box].slice().sort((x, y) => departKey(x, box, st) - departKey(y, box, st)); }
    return ord;
  };

  type Geo = { phiA: number; phiB: number; PA: [number, number]; PB: [number, number]; delta: number; sweep: number; ivStart: number; ivLen: number; chordLen: number };
  const buildGeometry = (act: number[], st: State, order?: Order): Record<number, Geo> => {
    const ord = order ?? heuristicOrder(act, st);
    const laneA: Record<number, number> = {}, laneB: Record<number, number> = {};
    for (const b in ord) {
      const arr = ord[b], m = arr.length;
      arr.forEach((i, j) => {
        const off = (m === 1 ? 0 : j / (m - 1) - 0.5) * 2 * HALF_W;
        if (WB[i].a === +b) laneA[i] = off; else laneB[i] = off;
      });
    }
    const geo: Record<number, Geo> = {};
    for (const i of act) {
      const w = WB[i];
      const phiA = angOf(w.a) + (laneA[i] ?? 0);
      const phiB = angOf(w.b) + (laneB[i] ?? 0);
      const PA = pt(phiA, R_INNER), PB = pt(phiB, R_INNER);
      let delta = 0;
      if (st.dir[i] !== 2) delta = (st.dir[i] === 0 ? w.baseShort : w.baseLong) + ((laneB[i] ?? 0) - (laneA[i] ?? 0));
      const ivStart = ((delta >= 0 ? phiA : phiA + delta) % TWO_PI + TWO_PI) % TWO_PI;
      geo[i] = { phiA, phiB, PA, PB, delta, sweep: Math.abs(delta), ivStart, ivLen: Math.abs(delta), chordLen: Math.hypot(PA[0] - PB[0], PA[1] - PB[1]) };
    }
    return geo;
  };

  const orient = (a: [number, number], b: [number, number], c: [number, number]) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const segSeg = (p1: [number, number], p2: [number, number], p3: [number, number], p4: [number, number]) => {
    const d1 = orient(p3, p4, p1), d2 = orient(p3, p4, p2), d3 = orient(p1, p2, p3), d4 = orient(p1, p2, p4);
    return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
  };
  const onArc = (ang: number, phiA: number, delta: number) => {
    const rel = delta >= 0 ? ((ang - phiA) % TWO_PI + TWO_PI) % TWO_PI : ((phiA - ang) % TWO_PI + TWO_PI) % TWO_PI;
    return rel > 1e-6 && rel < Math.abs(delta) - 1e-6;
  };
  const segArc = (p1: [number, number], p2: [number, number], r: number, phiA: number, delta: number) => {
    const dx = p2[0] - p1[0], dy = p2[1] - p1[1], fx = p1[0] - CX, fy = p1[1] - CY;
    const a = dx * dx + dy * dy, b = 2 * (fx * dx + fy * dy), c = fx * fx + fy * fy - r * r;
    let disc = b * b - 4 * a * c; if (disc < 0 || a === 0) return 0; disc = Math.sqrt(disc);
    let cnt = 0;
    for (const t of [(-b - disc) / (2 * a), (-b + disc) / (2 * a)]) {
      if (t <= 1e-6 || t >= 1 - 1e-6) continue;
      const x = p1[0] + t * dx, y = p1[1] + t * dy;
      if (onArc(Math.atan2(y - CY, x - CX), phiA, delta)) cnt++;
    }
    return cnt;
  };
  const arcOverlap = (s1: number, l1: number, s2: number, l2: number) => { const d = ((s2 - s1) % TWO_PI + TWO_PI) % TWO_PI; return d < l1 - 1e-9 || d + l2 > TWO_PI + 1e-9; };
  type Seg = { kind: 0; p1: [number, number]; p2: [number, number] };
  type Arc = { kind: 1; r: number; phiA: number; delta: number };
  const elements = (i: number, st: State, K: number, g: Geo): (Seg | Arc)[] => {
    if (st.dir[i] === 2) return [{ kind: 0, p1: g.PA, p2: g.PB }];
    const r = radiusOf(st.rank[i], K);
    return [{ kind: 0, p1: g.PA, p2: pt(g.phiA, r) }, { kind: 0, p1: g.PB, p2: pt(g.phiB, r) }, { kind: 1, r, phiA: g.phiA, delta: g.delta }];
  };
  const elemCross = (a: Seg | Arc, b: Seg | Arc) => {
    if (a.kind === 0 && b.kind === 0) return segSeg(a.p1, a.p2, b.p1, b.p2) ? 1 : 0;
    if (a.kind === 0 && b.kind === 1) return segArc(a.p1, a.p2, b.r, b.phiA, b.delta);
    if (a.kind === 1 && b.kind === 0) return segArc(b.p1, b.p2, a.r, a.phiA, a.delta);
    return 0;
  };
  const evaluate = (act: number[], st: State, geo: Record<number, Geo>) => {
    let maxRank = 0;
    for (const i of act) if (st.dir[i] !== 2 && st.rank[i] > maxRank) maxRank = st.rank[i];
    const circles = act.some((i) => st.dir[i] !== 2) ? maxRank + 1 : 0;
    let length = 0;
    for (const i of act) {
      if (st.dir[i] === 2) length += geo[i].chordLen;
      else { const r = radiusOf(st.rank[i], circles); length += 2 * (R_INNER - r) + r * geo[i].sweep; }
    }
    let violations = 0, crossings = 0;
    for (const i of act) if (st.dir[i] === 2 && !DIAMETRIC[i]) violations++;
    const elems = act.map((i) => elements(i, st, circles, geo[i]));
    for (let x = 0; x < act.length; x++) {
      const i = act[x];
      for (let y = x + 1; y < act.length; y++) {
        const j = act[y];
        if (st.dir[i] !== 2 && st.dir[j] !== 2 && st.rank[i] === st.rank[j]) {
          if (arcOverlap(geo[i].ivStart, geo[i].ivLen, geo[j].ivStart, geo[j].ivLen)) violations++;
        }
        let pc = 0;
        for (const ea of elems[x]) for (const eb of elems[y]) pc += elemCross(ea, eb);
        if (pc) { if (st.dir[i] === 2 || st.dir[j] === 2) violations += pc; else crossings += pc; }
      }
    }
    return { cost: 1e9 * violations + 1000 * crossings + length + 80 * circles, crossings, length, violations, circles };
  };

  const seed = (act: number[]): State => {
    const dir = edges.map(() => 0), rank = edges.map(() => 0);
    const geo = buildGeometry(act, { dir, rank });
    const order = [...act].sort((x, y) => geo[y].sweep - geo[x].sweep);
    const placed: { k: number; s: number; l: number }[] = [];
    for (const i of order) {
      const iv = geo[i]; let k = 0;
      for (; ; k++) { let clash = false; for (const p of placed) if (p.k === k && arcOverlap(p.s, p.l, iv.ivStart, iv.ivLen)) { clash = true; break; } if (!clash) break; }
      placed.push({ k, s: iv.ivStart, l: iv.ivLen }); rank[i] = k;
    }
    return { dir, rank };
  };
  const localDescent = (act: number[], st0: State): State => {
    const st = { dir: st0.dir.slice(), rank: st0.rank.slice() };
    let cur = evaluate(act, st, buildGeometry(act, st));
    const maxRank = Math.max(1, act.length - 1);
    let improved = true;
    while (improved) {
      improved = false;
      for (const i of act) {
        let bC = cur, bD = st.dir[i], bR = st.rank[i];
        const dirs = DIAMETRIC[i] ? [0, 1, 2] : [0, 1];
        for (const dv of dirs) {
          const ranks = dv === 2 ? [st.rank[i]] : Array.from({ length: maxRank + 1 }, (_, k) => k);
          for (const rv of ranks) { st.dir[i] = dv; st.rank[i] = rv; const e = evaluate(act, st, buildGeometry(act, st)); if (e.cost < bC.cost - 1e-9) { bC = e; bD = dv; bR = rv; } }
        }
        st.dir[i] = bD; st.rank[i] = bR;
        if (bC.cost < cur.cost - 1e-9) { cur = bC; improved = true; }
      }
    }
    return st;
  };
  const anneal = (act: number[], iters: number): State => {
    let st = seed(act);
    let cur = evaluate(act, st, buildGeometry(act, st));
    let best = st, bestCost = cur.cost;
    const maxRank = Math.max(1, act.length - 1);
    let T = 2000;
    for (let it = 0; it < iters; it++) {
      T *= 1 - 3 / iters;
      const i = act[(rng() * act.length) | 0];
      const nd = st.dir.slice(), nr = st.rank.slice();
      if (rng() < 0.45) nd[i] = DIAMETRIC[i] ? (rng() * 3) | 0 : (rng() * 2) | 0;
      else nr[i] = (rng() * (maxRank + 1)) | 0;
      const cand = { dir: nd, rank: nr };
      const e = evaluate(act, cand, buildGeometry(act, cand));
      if (e.cost < cur.cost || rng() < Math.exp((cur.cost - e.cost) / Math.max(1, T))) { st = cand; cur = e; if (e.cost < bestCost) { best = cand; bestCost = e.cost; } }
    }
    return best;
  };
  // optimise the exit-point ORDER per box (full perms ≤6, else adjacent-swap)
  const polish = (act: number[], st: State) => {
    const order = heuristicOrder(act, st);
    const inc = incidentByBox(act);
    let best = evaluate(act, st, buildGeometry(act, st, order));
    const costWith = (b: number, perm: number[]) => { const prev = order[b]; order[b] = perm; const e = evaluate(act, st, buildGeometry(act, st, order)); order[b] = prev; return e; };
    let improved = true;
    while (improved) {
      improved = false;
      for (const b in inc) {
        const box = +b, wires = order[box];
        if (wires.length < 2) continue;
        let bestPerm = wires, bestCost = best.cost;
        if (wires.length <= 6) {
          for (const p of perms(wires)) { const e = costWith(box, p); if (e.cost < bestCost - 1e-9) { bestCost = e.cost; bestPerm = p; } }
        } else { // adjacent-swap hill climb for high-degree hubs
          let cur = wires.slice(), curCost = best.cost, imp2 = true;
          while (imp2) { imp2 = false; for (let k = 0; k + 1 < cur.length; k++) { const t = cur.slice(); [t[k], t[k + 1]] = [t[k + 1], t[k]]; const e = costWith(box, t); if (e.cost < curCost - 1e-9) { cur = t; curCost = e.cost; imp2 = true; } } }
          bestPerm = cur; bestCost = curCost;
        }
        order[box] = bestPerm.slice();
        if (bestCost < best.cost - 1e-9) { best = evaluate(act, st, buildGeometry(act, st, order)); improved = true; }
      }
    }
    return { order, stats: best };
  };

  // Final outward-compaction: for each non-chord wire (innermost first), try
  // every smaller rank and accept the OUTERMOST one that doesn't add
  // violations / crossings and strictly shortens the wire's length. Catches
  // cases where anneal landed a short-arc wire on a deep inner ring even
  // though the outer rings have angular room — most visible on dashboard
  // (where active.length > 14 so localDescent doesn't run at all). Cheap
  // (O(M·R) evaluations per sweep, iterated to a fixed point — typically 1–2
  // sweeps).
  const compactOutward = (act: number[], st0: State, ord: Order): State => {
    const result: State = { dir: st0.dir.slice(), rank: st0.rank.slice() };
    let changed = true;
    let guard = 0;
    while (changed && guard++ < 4) {
      changed = false;
      const innermostFirst = [...act]
        .filter((i) => result.dir[i] !== 2)
        .sort((x, y) => result.rank[y] - result.rank[x]);
      for (const i of innermostFirst) {
        const oldRank = result.rank[i];
        if (oldRank === 0) continue;
        const baseline = evaluate(act, result, buildGeometry(act, result, ord));
        for (let k = 0; k < oldRank; k++) {
          result.rank[i] = k;
          const e = evaluate(act, result, buildGeometry(act, result, ord));
          if (e.violations <= baseline.violations && e.crossings <= baseline.crossings && e.length < baseline.length - 1e-6) {
            changed = true;
            break;
          }
          result.rank[i] = oldRank;
        }
      }
    }
    return result;
  };

  // ---- run the pipeline on the active subset ----
  let st: State = { dir: edges.map(() => 0), rank: edges.map(() => 0) };
  let order: Order = {};
  let stats = { crossings: 0, circles: 0 };
  if (active.length) {
    const iters = Math.max(400, Math.min(1600, active.length * 45));
    let s = anneal(active, iters);
    if (active.length <= 14) s = localDescent(active, s); // exhaustive rank search only when cheap
    st = s;
    const p = polish(active, st);
    order = p.order;
    // outward-compact every wire to the smallest rank that doesn't create
    // conflicts — runs ALWAYS, including past the localDescent threshold,
    // since this is where dashboards with many wires accumulate stuck-inner
    // routes.
    st = compactOutward(active, st, order);
    const after = evaluate(active, st, buildGeometry(active, st, order));
    stats = { crossings: after.crossings, circles: after.circles };
    // compact circle ranks to 0..k-1 — drop unused rings (gaps left by the
    // search). Monotonic remap preserves the radius ORDER, so crossings are
    // unchanged; it only tightens the ring spacing.
    const used = [...new Set(active.filter((i) => st.dir[i] !== 2).map((i) => st.rank[i]))].sort((x, y) => x - y);
    if (used.length && used.length < stats.circles) {
      const remap = new Map(used.map((r, k) => [r, k]));
      for (const i of active) if (st.dir[i] !== 2) st.rank[i] = remap.get(st.rank[i])!;
      const fin = evaluate(active, st, buildGeometry(active, st, order));
      stats = { crossings: fin.crossings, circles: fin.circles };
    }
  }

  // ---- build draw output ----
  const geo = buildGeometry(active, st, order);
  const f = (x: number) => x.toFixed(1);
  const P = (ang: number, rr: number) => { const [x, y] = pt(ang, rr); return `${f(x)} ${f(y)}`; };
  const pathFor = (i: number): string => {
    const g = geo[i];
    if (st.dir[i] === 2) return `M ${P(g.phiA, R_INNER)} L ${P(g.phiB, R_INNER)}`;
    const r = radiusOf(st.rank[i], stats.circles);
    const { phiA, delta } = g;
    const radialLen = Math.max(0, R_INNER - r);
    const fr = Math.max(0, Math.min(14, radialLen * 0.6, r * Math.abs(delta) * 0.45));
    const dAng = r > 0 ? Math.sign(delta || 1) * Math.min(Math.abs(delta) * 0.45, fr / r) : 0;
    const aStart = phiA + dAng, aEnd = phiA + delta - dAng;
    const P1 = pt(phiA, r), P2 = pt(phiA + delta, r);
    const M = Math.max(2, Math.round((Math.abs(aEnd - aStart) / TWO_PI) * 140));
    let d = `M ${P(phiA, R_INNER)} L ${P(phiA, r + fr)} Q ${f(P1[0])} ${f(P1[1])} ${P(aStart, r)}`;
    for (let t = 1; t <= M; t++) d += ` L ${P(aStart + (aEnd - aStart) * (t / M), r)}`;
    d += ` Q ${f(P2[0])} ${f(P2[1])} ${P(phiA + delta, r + fr)} L ${P(g.phiB, R_INNER)}`;
    return d;
  };
  const paths: Record<number, string> = {};
  for (const i of active) paths[i] = pathFor(i);

  const positions = Array.from({ length: n }, (_, i) => {
    const ang = angOf(i);
    const rot = readableAngle((i / n) * 360); // most-horizontal edge for labels
    return { x: CX + R_BOX * Math.cos(ang) - BOX / 2, y: CY + R_BOX * Math.sin(ang) - BOX / 2, rot: (i / n) * 360, labelRot: rot - (i / n) * 360 };
  });
  const rings = Array.from({ length: stats.circles }, (_, k) => radiusOf(k, stats.circles));

  return { size, box: BOX, boxR: R_BOX, positions, circles: stats.circles, rings, paths, crossings: stats.crossings };
}
