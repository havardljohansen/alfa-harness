"use client";

// Concept test: connection TYPE is irrelevant — every wire is just a box pair.
// Each wire picks one of three routes: arc clockwise, arc counter-clockwise, or
// a STRAIGHT CHORD through the middle (shortest for near-opposite boxes).
// Circles are free (arc-vs-arc overlap → just add a circle). We minimise the
// combination of (a) total route length and (b) non-circular crossings — spokes
// and chords cutting across arcs/each other. Re-optimised on every change.

import { useMemo, useState } from "react";

const COUNT = 6;
const SIZE = 600;
const BOX = 56;
const TWO_PI = Math.PI * 2;
const CX = SIZE / 2;
const CY = SIZE / 2;

const R_OUTER = 210; // outer edge of the routing disc (boxes sit just outside it)
const BOX_GAP = 12;
const R_BOX = R_OUTER + BOX_GAP + BOX / 2;
const R_INNER = R_BOX - BOX / 2;
// Circles evenly divide the radius INCLUDING the gaps to the centre and the
// outer edge: 1 circle → 50%, 2 → 33%/66%, K → k/(K+1). Re-spaces as K changes.
const radiusOf = (k: number, K: number) => (R_OUTER * (K - k)) / (K + 1);
const angOf = (i: number) => (i / COUNT) * TWO_PI - Math.PI / 2;
const pt = (ang: number, r: number): [number, number] => [CX + r * Math.cos(ang), CY + r * Math.sin(ang)];
// the box's most-horizontal edge orientation (deg, in (−90,90]) — so labels read
// level-ish instead of flipping upside down with the box rotation.
const norm90 = (a: number) => { let v = ((a % 180) + 180) % 180; if (v > 90) v -= 180; return v; };
const readableAngle = (rot: number) => { const c1 = norm90(rot), c2 = norm90(rot + 90); return Math.abs(c1) <= Math.abs(c2) ? c1 : c2; };

type Wire = { a: number; b: number };
// Raw connection list — may contain duplicates or both directions (x→y and y→x).
const RAW: [number, number][] = [];
for (let a = 0; a < COUNT; a++) for (let b = a + 1; b < COUNT; b++) RAW.push([a, b]);
// A connection is UNDIRECTED: x→y and y→x are the SAME wire. Canonicalise by the
// sorted pair and dedupe, so duplicates collapse to one route with one colour.
const WIRES: Wire[] = [];
{
  const seen = new Set<string>();
  for (const [p, q] of RAW) {
    const a = Math.min(p, q), b = Math.max(p, q);
    const key = `${a}-${b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    WIRES.push({ a, b });
  }
}

const COLORS = WIRES.map((_, i) => `hsl(${Math.round((i / WIRES.length) * 360)}, 85%, 62%)`);
const HALF_W = ((BOX / 2) / R_INNER) * 0.8; // angular half-width of a box's inner side
const norm = (x: number) => { let v = x % TWO_PI; if (v <= -Math.PI) v += TWO_PI; if (v > Math.PI) v -= TWO_PI; return v; };

// Per wire: the two base arc sweeps (CW short / CCW long), before exit-point offset.
type WireBase = { a: number; b: number; baseShort: number; baseLong: number };
const WBASE: WireBase[] = WIRES.map((w) => {
  const inc = (w.b - w.a + COUNT) % COUNT;
  const goInc = inc <= COUNT - inc;
  const nShort = goInc ? inc : COUNT - inc;
  const baseShort = (goInc ? 1 : -1) * nShort * (TWO_PI / COUNT);
  return { a: w.a, b: w.b, baseShort, baseLong: baseShort - Math.sign(baseShort || 1) * TWO_PI };
});

// A straight chord is only allowed when the two boxes are exactly OPPOSITE, so
// the line passes through the centre (and even then only if it crosses nothing).
const DIAMETRIC = WBASE.map((w) => COUNT % 2 === 0 && (w.b - w.a + COUNT) % COUNT === COUNT / 2);

type State = { dir: number[]; rank: number[] }; // dir 0=CW arc, 1=CCW arc, 2=chord

// The exit point (where a wire leaves a box's inner side) is CHOSEN. Each box
// holds an ORDER of its active wires; they spread evenly across the side in that
// order. A good order lets wires fan out without crossing at the box — so the
// order itself is optimised (see polish()), not left to a fixed heuristic.
type Order = Record<number, number[]>; // box → wires in exit-point order

// departure direction from a box toward the other end (CW negative, CCW positive)
function departKey(i: number, box: number, st: State): number {
  const w = WBASE[i];
  const atA = w.a === box;
  if (st.dir[i] === 2) return norm(angOf(atA ? w.b : w.a) - angOf(box));
  const base = st.dir[i] === 0 ? w.baseShort : w.baseLong;
  return atA ? base : -base;
}
function incidentByBox(active: number[]): Order {
  const m: Order = {};
  for (const i of active) { (m[WBASE[i].a] ??= []).push(i); (m[WBASE[i].b] ??= []).push(i); }
  return m;
}
// default order: sort each box's wires by departure direction (a good start)
function heuristicOrder(active: number[], st: State): Order {
  const inc = incidentByBox(active);
  const ord: Order = {};
  for (const b in inc) { const box = +b; ord[box] = inc[box].slice().sort((x, y) => departKey(x, box, st) - departKey(y, box, st)); }
  return ord;
}

type Geo = { phiA: number; phiB: number; PA: [number, number]; PB: [number, number]; delta: number; sweep: number; ivStart: number; ivLen: number; chordLen: number };
function buildGeometry(active: number[], st: State, order?: Order): Record<number, Geo> {
  const ord = order ?? heuristicOrder(active, st);
  const laneA: Record<number, number> = {};
  const laneB: Record<number, number> = {};
  for (const b in ord) {
    const arr = ord[b], m = arr.length;
    arr.forEach((i, j) => {
      const off = (m === 1 ? 0 : j / (m - 1) - 0.5) * 2 * HALF_W;
      if (WBASE[i].a === +b) laneA[i] = off; else laneB[i] = off;
    });
  }
  const geo: Record<number, Geo> = {};
  for (const i of active) {
    const w = WBASE[i];
    const phiA = angOf(w.a) + (laneA[i] ?? 0);
    const phiB = angOf(w.b) + (laneB[i] ?? 0);
    const PA = pt(phiA, R_INNER);
    const PB = pt(phiB, R_INNER);
    let delta = 0;
    if (st.dir[i] !== 2) delta = (st.dir[i] === 0 ? w.baseShort : w.baseLong) + ((laneB[i] ?? 0) - (laneA[i] ?? 0));
    const ivStart = ((delta >= 0 ? phiA : phiA + delta) % TWO_PI + TWO_PI) % TWO_PI;
    geo[i] = { phiA, phiB, PA, PB, delta, sweep: Math.abs(delta), ivStart, ivLen: Math.abs(delta), chordLen: Math.hypot(PA[0] - PB[0], PA[1] - PB[1]) };
  }
  return geo;
}

// ---- geometry primitives -------------------------------------------------
const orient = (a: [number, number], b: [number, number], c: [number, number]) =>
  (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
function segSeg(p1: [number, number], p2: [number, number], p3: [number, number], p4: [number, number]) {
  const d1 = orient(p3, p4, p1), d2 = orient(p3, p4, p2), d3 = orient(p1, p2, p3), d4 = orient(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}
function onArc(ang: number, phiA: number, delta: number) {
  const rel = delta >= 0 ? ((ang - phiA) % TWO_PI + TWO_PI) % TWO_PI : ((phiA - ang) % TWO_PI + TWO_PI) % TWO_PI;
  return rel > 1e-6 && rel < Math.abs(delta) - 1e-6;
}
// intersections of segment p1-p2 with the arc (centre CX,CY radius r, from phiA sweep delta)
function segArc(p1: [number, number], p2: [number, number], r: number, phiA: number, delta: number) {
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
  const fx = p1[0] - CX, fy = p1[1] - CY;
  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;
  let disc = b * b - 4 * a * c;
  if (disc < 0 || a === 0) return 0;
  disc = Math.sqrt(disc);
  let n = 0;
  for (const t of [(-b - disc) / (2 * a), (-b + disc) / (2 * a)]) {
    if (t <= 1e-6 || t >= 1 - 1e-6) continue;
    const x = p1[0] + t * dx, y = p1[1] + t * dy;
    if (onArc(Math.atan2(y - CY, x - CX), phiA, delta)) n++;
  }
  return n;
}
// two same-circle arcs overlap angularly?
function arcOverlap(s1: number, l1: number, s2: number, l2: number) {
  const d = ((s2 - s1) % TWO_PI + TWO_PI) % TWO_PI;
  return d < l1 - 1e-9 || d + l2 > TWO_PI + 1e-9;
}

// elements of one wire's route, for crossing tests
type Seg = { kind: "seg"; p1: [number, number]; p2: [number, number] };
type Arc = { kind: "arc"; r: number; phiA: number; delta: number };
function elements(i: number, st: State, K: number, g: Geo): (Seg | Arc)[] {
  if (st.dir[i] === 2) return [{ kind: "seg", p1: g.PA, p2: g.PB }];
  const r = radiusOf(st.rank[i], K);
  return [
    { kind: "seg", p1: g.PA, p2: pt(g.phiA, r) },
    { kind: "seg", p1: g.PB, p2: pt(g.phiB, r) },
    { kind: "arc", r, phiA: g.phiA, delta: g.delta },
  ];
}
function elemCross(a: Seg | Arc, b: Seg | Arc) {
  if (a.kind === "seg" && b.kind === "seg") return segSeg(a.p1, a.p2, b.p1, b.p2) ? 1 : 0;
  if (a.kind === "seg" && b.kind === "arc") return segArc(a.p1, a.p2, b.r, b.phiA, b.delta);
  if (a.kind === "arc" && b.kind === "seg") return segArc(b.p1, b.p2, a.r, a.phiA, a.delta);
  return 0; // arc-arc: concentric (different r → none; same r handled as violation)
}

function evaluate(active: number[], st: State, geo: Record<number, Geo>) {
  let maxRank = 0;
  for (const i of active) if (st.dir[i] !== 2 && st.rank[i] > maxRank) maxRank = st.rank[i];
  const hasArc = active.some((i) => st.dir[i] !== 2);
  const circles = hasArc ? maxRank + 1 : 0;

  let length = 0;
  for (const i of active) {
    if (st.dir[i] === 2) length += geo[i].chordLen;
    else {
      const r = radiusOf(st.rank[i], circles);
      length += 2 * (R_INNER - r) + r * geo[i].sweep;
    }
  }

  let violations = 0, crossings = 0;
  // a chord is only legal through the centre (diametric) AND crossing-free
  for (const i of active) if (st.dir[i] === 2 && !DIAMETRIC[i]) violations++;
  const elems = active.map((i) => elements(i, st, circles, geo[i]));
  for (let x = 0; x < active.length; x++) {
    const i = active[x];
    for (let y = x + 1; y < active.length; y++) {
      const j = active[y];
      // circular overlap: two arcs on the same circle whose angular spans meet
      if (st.dir[i] !== 2 && st.dir[j] !== 2 && st.rank[i] === st.rank[j]) {
        if (arcOverlap(geo[i].ivStart, geo[i].ivLen, geo[j].ivStart, geo[j].ivLen)) violations++;
      }
      let pc = 0;
      for (const ea of elems[x]) for (const eb of elems[y]) pc += elemCross(ea, eb);
      if (pc) {
        // any crossing that touches a chord is forbidden — chords must be clean
        if (st.dir[i] === 2 || st.dir[j] === 2) violations += pc;
        else crossings += pc;
      }
    }
  }
  const cost = 1e9 * violations + 1000 * crossings + length + 80 * circles;
  return { cost, crossings, length, violations, circles };
}

function seed(active: number[]): State {
  const dir = WIRES.map(() => 0);
  const rank = WIRES.map(() => 0);
  const geo = buildGeometry(active, { dir, rank });
  const order = [...active].sort((x, y) => geo[y].sweep - geo[x].sweep);
  const placed: { k: number; s: number; l: number }[] = [];
  for (const i of order) {
    const iv = geo[i];
    let k = 0;
    for (; ; k++) {
      let clash = false;
      for (const p of placed) if (p.k === k && arcOverlap(p.s, p.l, iv.ivStart, iv.ivLen)) { clash = true; break; }
      if (!clash) break;
    }
    placed.push({ k, s: iv.ivStart, l: iv.ivLen });
    rank[i] = k;
  }
  return { dir, rank };
}

// all permutations of a small array (box degree ≤ 5, so ≤ 120)
function perms<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const p of perms(rest)) out.push([arr[i], ...p]);
  }
  return out;
}

// route polish: coordinate descent over each wire's (dir, rank), holding the
// rest fixed — cleans up the length-suboptimal configs the anneal can leave.
function localDescent(active: number[], st0: State): State {
  const st = { dir: st0.dir.slice(), rank: st0.rank.slice() };
  let cur = evaluate(active, st, buildGeometry(active, st));
  const maxRank = Math.max(1, active.length - 1);
  let improved = true;
  while (improved) {
    improved = false;
    for (const i of active) {
      let bC = cur, bD = st.dir[i], bR = st.rank[i];
      const dirs = DIAMETRIC[i] ? [0, 1, 2] : [0, 1];
      for (const dv of dirs) {
        const ranks = dv === 2 ? [st.rank[i]] : Array.from({ length: maxRank + 1 }, (_, k) => k);
        for (const rv of ranks) {
          st.dir[i] = dv; st.rank[i] = rv;
          const e = evaluate(active, st, buildGeometry(active, st));
          if (e.cost < bC.cost - 1e-9) { bC = e; bD = dv; bR = rv; }
        }
      }
      st.dir[i] = bD; st.rank[i] = bR;
      if (bC.cost < cur.cost - 1e-9) { cur = bC; improved = true; }
    }
  }
  return st;
}

// port polish: optimise the exit-point ORDER per box (coordinate descent over
// permutations) — the single biggest lever on crossings (≈ halves them).
function polish(active: number[], st: State) {
  const order = heuristicOrder(active, st);
  const inc = incidentByBox(active);
  let best = evaluate(active, st, buildGeometry(active, st, order));
  let improved = true;
  while (improved) {
    improved = false;
    for (const b in inc) {
      const wires = order[+b];
      if (wires.length < 2) continue;
      let bestPerm = wires.slice(), bestCost = best.cost;
      for (const p of perms(wires)) {
        order[+b] = p;
        const e = evaluate(active, st, buildGeometry(active, st, order));
        if (e.cost < bestCost - 1e-9) { bestCost = e.cost; bestPerm = p.slice(); }
      }
      order[+b] = bestPerm;
      const e2 = evaluate(active, st, buildGeometry(active, st, order));
      if (e2.cost < best.cost - 1e-9) { best = e2; improved = true; }
    }
  }
  return { order, stats: best };
}

function optimise(active: number[]) {
  if (active.length === 0)
    return { st: { dir: WIRES.map(() => 0), rank: WIRES.map(() => 0) }, order: {} as Order, stats: { cost: 0, crossings: 0, length: 0, violations: 0, circles: 0 } };
  // 1. anneal the routes (dir / rank) with the heuristic exit-point order
  let st = seed(active);
  let cur = evaluate(active, st, buildGeometry(active, st));
  let best = st, bestCost = cur.cost;
  const maxRank = Math.max(1, active.length - 1);
  let T = 2000;
  for (let it = 0; it < 3500; it++) {
    T *= 0.9988;
    const i = active[(Math.random() * active.length) | 0];
    const nd = st.dir.slice(), nr = st.rank.slice();
    if (Math.random() < 0.45) nd[i] = DIAMETRIC[i] ? (Math.random() * 3) | 0 : (Math.random() * 2) | 0; // chord only if diametric
    else nr[i] = (Math.random() * (maxRank + 1)) | 0;
    const cand = { dir: nd, rank: nr };
    const e = evaluate(active, cand, buildGeometry(active, cand));
    if (e.cost < cur.cost || Math.random() < Math.exp((cur.cost - e.cost) / Math.max(1, T))) {
      st = cand; cur = e;
      if (e.cost < bestCost) { best = cand; bestCost = e.cost; }
    }
  }
  // 2. coordinate-descent route polish, then 3. exit-point ORDER polish
  const routes = localDescent(active, best);
  const { order, stats } = polish(active, routes);
  return { st: routes, order, stats };
}

function pathFor(i: number, st: State, K: number, g: Geo): string {
  const f = (n: number) => n.toFixed(1);
  const P = (ang: number, rr: number) => { const [x, y] = pt(ang, rr); return `${f(x)} ${f(y)}`; };
  if (st.dir[i] === 2) return `M ${P(g.phiA, R_INNER)} L ${P(g.phiB, R_INNER)}`; // chord: straight, no corners
  const r = radiusOf(st.rank[i], K);
  const { phiA, delta } = g;
  // Fillet the two spoke↔arc corners: pull back along the radial by `fr` and
  // round into the arc over `dAng`, easing the ~90° turn with a quadratic.
  const radialLen = Math.max(0, R_INNER - r);
  const fr = Math.max(0, Math.min(16, radialLen * 0.6, r * Math.abs(delta) * 0.45));
  const dAng = r > 0 ? Math.sign(delta || 1) * Math.min(Math.abs(delta) * 0.45, fr / r) : 0;
  const aStart = phiA + dAng;
  const aEnd = phiA + delta - dAng;
  const P1 = pt(phiA, r), P2 = pt(phiA + delta, r); // the sharp corners (curve control points)
  const M = Math.max(2, Math.round((Math.abs(aEnd - aStart) / TWO_PI) * 160));
  let d = `M ${P(phiA, R_INNER)} L ${P(phiA, r + fr)}`; // box A → down the spoke (stop short)
  d += ` Q ${f(P1[0])} ${f(P1[1])} ${P(aStart, r)}`; // round into the arc
  for (let t = 1; t <= M; t++) d += ` L ${P(aStart + (aEnd - aStart) * (t / M), r)}`;
  d += ` Q ${f(P2[0])} ${f(P2[1])} ${P(phiA + delta, r + fr)}`; // round out of the arc
  d += ` L ${P(g.phiB, R_INNER)}`; // spoke → box B
  return d;
}

export default function CircleTestPage() {
  const [onSet, setOnSet] = useState<boolean[]>(() => WIRES.map(() => false));
  const toggle = (i: number) => setOnSet((p) => p.map((v, j) => (j === i ? !v : v)));
  const setAll = (v: boolean) => setOnSet(WIRES.map(() => v));

  const selected = useMemo(() => WIRES.map((_, i) => i).filter((i) => onSet[i]), [onSet]);
  const showingAll = selected.length === 0; // nothing picked → show everything
  const active = useMemo(() => (showingAll ? WIRES.map((_, i) => i) : selected), [showingAll, selected]);
  const { st, order, stats } = useMemo(() => optimise(active), [active]);
  const geo = useMemo(() => buildGeometry(active, st, order), [active, st, order]);
  const drawn = useMemo(() => active.map((i) => ({ i, d: pathFor(i, st, stats.circles, geo[i]) })), [active, st, stats.circles, geo]);

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold mb-1">Circle layout — routes (arc / chord) optimiser</h1>
      <p className="text-sm mb-3">
        {showingAll ? <>Showing <strong>all {active.length}</strong> (none selected)</> : <>Active: <strong>{active.length}</strong></>}{" "}
        · circles: <strong className="text-sky-300">{stats.circles}</strong>{" "}
        · crossings: <strong className="text-amber-400">{stats.crossings}</strong>{" "}
        · length: <strong>{Math.round(stats.length)}</strong>px{" "}
        <span className="text-muted text-xs">(arc×arc forced to 0; a straight chord only for opposite boxes when it crosses nothing)</span>
      </p>
      <div className="flex gap-2 mb-3">
        <button onClick={() => setAll(true)} className="text-xs px-2 py-1 rounded border border-white/30 hover:bg-white/10">all</button>
        <button onClick={() => setAll(false)} className="text-xs px-2 py-1 rounded border border-white/30 hover:bg-white/10">none</button>
      </div>

      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg className="absolute inset-0 pointer-events-none" width={SIZE} height={SIZE}>
          {Array.from({ length: stats.circles }).map((_, k) => (
            <circle key={`c-${k}`} cx={CX} cy={CY} r={radiusOf(k, stats.circles)} fill="none" stroke="rgba(125,211,252,0.15)" strokeWidth={1} />
          ))}
          {drawn.map(({ i, d }) => (
            <path key={`w-${i}`} d={d} fill="none" stroke={COLORS[i]} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          ))}
        </svg>

        {Array.from({ length: COUNT }).map((_, i) => {
          const ang = angOf(i);
          const x = CX + R_BOX * Math.cos(ang) - BOX / 2;
          const y = CY + R_BOX * Math.sin(ang) - BOX / 2;
          const rot = (i / COUNT) * 360;
          return (
            <div key={i} className="absolute flex items-center justify-center rounded-md border border-white/40 bg-neutral-900 text-sm font-medium"
              style={{ left: x, top: y, width: BOX, height: BOX, transform: `rotate(${rot}deg)` }}>
              {/* counter-rotate the label to the box's most-horizontal edge for readability */}
              <span style={{ display: "inline-block", transform: `rotate(${readableAngle(rot) - rot}deg)` }}>{i + 1}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <h2 className="text-sm font-semibold mb-1">Connections — click to add / remove</h2>
        <ol className="text-sm grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
          {WIRES.map((w, i) => {
            const shown = onSet[i] || showingAll;
            return (
              <li key={i}>
                <button onClick={() => toggle(i)}
                  className={`flex items-center gap-2 w-full text-left px-1.5 py-0.5 rounded ${onSet[i] ? "bg-white/10" : "opacity-60 hover:opacity-100"}`}>
                  <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ background: shown ? COLORS[i] : "transparent", border: `1px solid ${COLORS[i]}` }} />
                  Box {w.a + 1} → Box {w.b + 1}
                  {shown && <span className="text-muted text-xs">· {st.dir[i] === 2 ? "chord" : `c${st.rank[i] + 1}`}</span>}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
