// =============================================================================
// Propagation engine — "what gets power".
// -----------------------------------------------------------------------------
// Pure function. Given an ignition position and switch states, it propagates
// +12 V from the battery through closed switch contacts and energised relay
// contacts, and works out which terminals are LIVE, which can reach GROUND,
// which relays are energised, and therefore which wires/components are powered.
//
// This is BOTH the test backbone (scenarios.ts assert against it) and the core
// the in-app power-state simulator (task #6) will reuse.
// =============================================================================
import { wires } from "./wires";
import { diodes } from "./diodes";
import { relays, fuseBlocks } from "./relays";
import { fuses } from "./fuses";
import { switchComponents } from "./components";

export type IgnitionPos = "off" | "run" | "start";

export interface SimState {
  ignition: IgnitionPos;
  /** switch component id -> selected position name. Missing = first position. */
  switches: Record<string, string>;
  /** Inertia / oil-pressure cut-off open (engine stopped / crash). */
  fuelSafetyOpen?: boolean;
  /** Fuse id (e.g. "f-ign-3") to simulate as open-circuit / blown. Removes all
   * edges touching that fuse position — bus side, downstream wires, and any
   * PDM explicit edges land on the same endpoint. Boolean outcome: every load
   * fed exclusively through that fuse goes dark. */
  blownFuse?: string;
  /** Wire id to simulate as physically broken / open-circuit. Use for ground-
   * strap fault tests (e.g. "w-gnd-dash" simulates the dash-to-engine ground
   * trunk failing). Also useful for any "what dies if this single wire is cut"
   * coverage. */
  brokenWire?: string;
}

export interface SimResult {
  live: Set<string>; // endpoints "comp.term" carrying +12 V
  ground: Set<string>; // endpoints that can reach ground
  energizedRelays: Set<string>;
  liveWires: Set<string>;
  poweredComponents: Set<string>;
}

const ep = (comp: string, term: string) => `${comp}.${term}`;

// Ground seed = battery negative only. The four chassis ground studs (gnd-eng,
// gnd-dash, gnd-rear, gnd-front) reach battery.- via their explicit strap
// wires (w-bat-gnd, w-gnd-dash, w-gnd-rear, w-gnd-front). Listing them here
// as additional ground sinks would be redundant in normal operation AND would
// silently mask ground-strap fault tests: if we broke w-gnd-dash, the dash
// stud would still register as 'ground' just because it appears in this list,
// and dash-grounded components would falsely propagate. Seed only at the real
// sink (battery.-) and let the wires do the propagation honestly.
const GROUND_NODES = [ep("battery", "-")];
const HOT_NODES = [ep("battery", "+")];

const IGN_POSITION_NAME: Record<IgnitionPos, string> = {
  off: "Off",
  run: "Run",
  start: "Start",
};

// Relays whose coil is grounded by the load side (85 = +12, 86 = switched ground).
const GROUND_TRIGGERED = new Set(["rly-horn"]);

interface Edge {
  a: string;
  b: string;
  directed: boolean; // true: current only a -> b (diode)
}

// Wires that carry an in-series (isolation) diode become directional.
const inlineDiodeByWire = new Map(
  diodes.filter((d) => d.inline).map((d) => [d.onWire, d]),
);

/** Edges that never change with state. */
function staticEdges(): Edge[] {
  const edges: Edge[] = [];

  // --- Wires (bidirectional, or directional through an in-series diode) ----
  for (const w of wires) {
    const from = ep(w.from.component, w.from.terminal);
    const to = ep(w.to.component, w.to.terminal);
    const d = inlineDiodeByWire.get(w.id);
    if (d) {
      // anode at `from` unless reversed; current flows anode -> cathode only.
      edges.push(d.reversed ? { a: to, b: from, directed: true } : { a: from, b: to, directed: true });
    } else {
      edges.push({ a: from, b: to, directed: false });
    }
  }

  // --- Bussed fuse blocks: input stud feeds every fitted fuse position ------
  for (const b of fuseBlocks.filter((b) => b.bussed)) {
    for (const f of fuses.filter((f) => f.block === b.id && f.ratingA > 0)) {
      edges.push({ a: ep(b.id, "BUS"), b: ep(b.id, f.id), directed: false });
    }
  }

  // --- PDM internals (hard-wired) ------------------------------------------
  // Main input feeds the HIGH-beam relay common directly (the relay cavity),
  // not a fuse. The LOW-beam relay common takes its feed EXTERNALLY via
  // w-low-com (from rtmr-ign.f-ign-6) — this is the asymmetric ign-gating
  // that makes LOW key-dependent while HIGH stays key-independent.
  edges.push({ a: ep("pdm", "BUS"), b: ep("rly-high", "30"), directed: false });
  // Beam relay outputs -> per-side beam fuses.
  edges.push({ a: ep("rly-low", "87"), b: ep("pdm", "f-pdm-1"), directed: false });
  edges.push({ a: ep("rly-low", "87"), b: ep("pdm", "f-pdm-2"), directed: false });
  edges.push({ a: ep("rly-high", "87"), b: ep("pdm", "f-pdm-3"), directed: false });
  edges.push({ a: ep("rly-high", "87"), b: ep("pdm", "f-pdm-4"), directed: false });

  // --- Flasher in rtmr-const cavity 5 (NO-762-LED, ISO-280 socket) ----------
  // The flasher's 49 (input) pin sits in the cavity's 30 position, which is
  // bussed to the constant input stud internally — no chassis wire. We model
  // that internal bond as a static edge here.
  edges.push({ a: ep("flasher", "49"), b: ep("rtmr-const", "BUS"), directed: false });
  // Pass-through (we model "powered", not the oscillation). The flasher's 49a
  // output is exposed at the cavity's 87 pin and jumpered to the turn-relay
  // commons across the RTMR back panel (see w-turnL-30).
  edges.push({ a: ep("flasher", "49"), b: ep("flasher", "49a"), directed: false });

  // --- Instrument-light PWM dimmer: either preset input feeds the lamp out ---
  // Directed (input -> output): the module's output is electronically isolated
  // from its control inputs, so a live output must not backfeed the other
  // preset. Boolean model — brightness level isn't represented, just lit/dark.
  edges.push({ a: ep("instr-pwm", "lo"), b: ep("instr-pwm", "out"), directed: true });
  edges.push({ a: ep("instr-pwm", "hi"), b: ep("instr-pwm", "out"), directed: true });

  // Relay coil terminal 85 used to be wired here implicitly (gnd-eng for most,
  // rtmr-const.BUS for the ground-triggered horn relay). Now defined as
  // explicit wires in wires.ts (w-rly-*-gnd + w-rly-horn-pwr) so the build
  // sheet shows them. The GROUND_TRIGGERED set above is still used by
  // simulate() to identify which side of the coil needs +12V vs ground.

  return edges;
}

const STATIC = staticEdges();

/** Switch-contact edges for the given state. */
function switchEdges(state: SimState): Edge[] {
  const edges: Edge[] = [];
  for (const sw of switchComponents) {
    if (!sw.positions?.length) continue;
    let posName: string | undefined;
    if (sw.id === "ign-switch") posName = IGN_POSITION_NAME[state.ignition];
    else posName = state.switches[sw.id] ?? sw.positions[0]?.name;
    const pos = sw.positions.find((p) => p.name === posName) ?? sw.positions[0];
    for (const [x, y] of pos?.closes ?? []) {
      edges.push({ a: ep(sw.id, x), b: ep(sw.id, y), directed: false });
    }
  }
  return edges;
}

/** Relay-contact edges given the currently-energised set. */
function relayEdges(energized: Set<string>): Edge[] {
  const edges: Edge[] = [];
  for (const r of relays) {
    if (energized.has(r.id)) {
      edges.push({ a: ep(r.id, "30"), b: ep(r.id, "87"), directed: false });
    } else if (r.type === "SPDT") {
      edges.push({ a: ep(r.id, "30"), b: ep(r.id, "87a"), directed: false });
    }
  }
  return edges;
}

/** Forward reachability from `starts` over the edge set. */
function reachable(edges: Edge[], starts: string[]): Set<string> {
  const fwd = new Map<string, string[]>();
  const add = (k: string, v: string) => {
    const arr = fwd.get(k);
    if (arr) arr.push(v);
    else fwd.set(k, [v]);
  };
  for (const e of edges) {
    add(e.a, e.b);
    if (!e.directed) add(e.b, e.a);
  }
  const seen = new Set<string>(starts);
  const stack = [...starts];
  while (stack.length) {
    const n = stack.pop()!;
    for (const m of fwd.get(n) ?? []) if (!seen.has(m)) {
      seen.add(m);
      stack.push(m);
    }
  }
  return seen;
}

/** Reverse reachability — set of nodes from which any `target` is reachable. */
function canReach(edges: Edge[], targets: string[]): Set<string> {
  const rev: Edge[] = edges.map((e) => ({ a: e.b, b: e.a, directed: e.directed }));
  return reachable(rev, targets);
}

export function simulate(state: SimState): SimResult {
  let baseStatic: Edge[] = STATIC;

  // Fault injection: blown fuse — remove every edge touching the fuse position.
  // Works uniformly for bussed RTMR fuses (drops the BUS↔fuse edge) and PDM
  // fuses with explicit incoming edges (drops the rly-X.87→f-pdm-N edge).
  if (state.blownFuse) {
    const fuse = fuses.find((f) => f.id === state.blownFuse);
    if (fuse) {
      const ep_blown = ep(fuse.block, fuse.id);
      baseStatic = baseStatic.filter((e) => e.a !== ep_blown && e.b !== ep_blown);
    }
  }
  // Fault injection: broken wire — remove that specific wire's edge(s).
  if (state.brokenWire) {
    const w = wires.find((x) => x.id === state.brokenWire);
    if (w) {
      const a = ep(w.from.component, w.from.terminal);
      const b = ep(w.to.component, w.to.terminal);
      baseStatic = baseStatic.filter((e) => !((e.a === a && e.b === b) || (e.a === b && e.b === a)));
    }
  }

  const base = [...baseStatic, ...switchEdges(state)];

  let energized = new Set<string>();
  let live = new Set<string>();
  let ground = new Set<string>();

  for (let iter = 0; iter < 16; iter++) {
    const edges = [...base, ...relayEdges(energized)];
    live = reachable(edges, HOT_NODES);
    ground = canReach(edges, GROUND_NODES);

    const next = new Set<string>();
    for (const r of relays) {
      const hot = GROUND_TRIGGERED.has(r.id) ? ep(r.id, "85") : ep(r.id, "86");
      const gnd = GROUND_TRIGGERED.has(r.id) ? ep(r.id, "86") : ep(r.id, "85");
      let on = live.has(hot) && ground.has(gnd);
      if (r.id === "rly-fuel" && state.fuelSafetyOpen) on = false;
      if (on) next.add(r.id);
    }

    const same = next.size === energized.size && [...next].every((x) => energized.has(x));
    energized = next;
    if (same) break;
  }

  const liveWires = new Set<string>();
  for (const w of wires) {
    if (live.has(ep(w.from.component, w.from.terminal)) || live.has(ep(w.to.component, w.to.terminal))) {
      liveWires.add(w.id);
    }
  }

  const poweredComponents = new Set<string>();
  for (const e of live) poweredComponents.add(e.split(".")[0]);

  return { live, ground, energizedRelays: energized, liveWires, poweredComponents };
}

/** Convenience: is a given component+terminal live? */
export function isLive(result: SimResult, comp: string, term: string) {
  return result.live.has(ep(comp, term));
}
