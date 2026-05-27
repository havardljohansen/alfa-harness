import type { DeviceComponent, ResolvedWire, Terminal } from "./types";
import { zones, zoneLinks, gaugeSpecs, lengthBands, wireTiers } from "./zones";
import { components, switchComponents } from "./components";
import { relays, fuseBlocks } from "./relays";
import { fuses } from "./fuses";
import { circuits } from "./circuits";
import { wires } from "./wires";
import { diodes } from "./diodes";
import { connectors, connectorPairsNeeded, connectorPairsOwned, connectorBom } from "./connectors";
import { complianceNotes } from "./compliance";
import { ownedParts, bomGaps, terminalByGauge, ownedWire } from "./parts";
import type { GaugeClass } from "./types";
import { resolveWire, wireTotalsByGauge, wireTotalsByTier, wiresByBand } from "./derive";
import { moduleOf } from "./modules";

const term = (id: string, label: string, din?: string): Terminal => ({ id, label, din });

// ---------------------------------------------------------------------------
// Synthesise graph nodes for relays and fuse blocks so wires (which reference
// their terminals) resolve, and the explorer can draw them.
// ---------------------------------------------------------------------------
const relayNodes: DeviceComponent[] = relays.map((r) => {
  const block = fuseBlocks.find((b) => b.id === r.mountedIn)!;
  const terminals = [
    term("30", "Common", "30"),
    term("85", "Coil −", "85"),
    term("86", "Coil + (trigger)", "86"),
    term("87", "Normally-open out", "87"),
  ];
  if (r.type === "SPDT") terminals.push(term("87a", "Normally-closed out", "87a"));
  return {
    id: r.id,
    name: r.name,
    kind: "relay" as const,
    zone: block.zone,
    terminals,
    partRef: r.partRef,
    note: r.fn,
  };
});

const blockNodes: DeviceComponent[] = fuseBlocks.map((b) => {
  const terminals: Terminal[] = [term("BUS", b.bussed ? "Common input stud" : "Input")];
  for (const f of fuses.filter((f) => f.block === b.id)) {
    terminals.push(term(f.id, `F${f.position} ${f.name} (${f.ratingA || "—"} A)`));
  }
  return {
    id: b.id,
    name: b.name,
    kind: b.id === "pdm" ? "distribution" : "fuse-block",
    zone: b.zone,
    terminals,
    partRef: b.partRef,
    note: b.note,
  };
});

/** Every drawable node, keyed by id. */
export const allNodes: DeviceComponent[] = [...components, ...relayNodes, ...blockNodes];
export const nodesById = new Map(allNodes.map((n) => [n.id, n]));

// ---------------------------------------------------------------------------
// Resolved wires + derived aggregates.
// ---------------------------------------------------------------------------
export const resolvedWires: ResolvedWire[] = wires.map(resolveWire);
export const gaugeTotals = wireTotalsByGauge(resolvedWires);
export const tierTotals = wireTotalsByTier(resolvedWires);
export const bandBuckets = wiresByBand(resolvedWires);

export const circuitsById = new Map(circuits.map((c) => [c.id, c]));
export const wiresByCircuit = (id: string) => resolvedWires.filter((w) => w.circuit === id);

// ---------------------------------------------------------------------------
// Model self-validation — surfaced in the app and asserted in tests.
// ---------------------------------------------------------------------------
export interface ValidationIssue {
  severity: "error" | "warn";
  where: string;
  message: string;
}

export function validateModel(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Every wire endpoint must resolve to a known node + terminal.
  for (const w of wires) {
    for (const [side, end] of [
      ["from", w.from],
      ["to", w.to],
    ] as const) {
      const node = nodesById.get(end.component);
      if (!node) {
        issues.push({ severity: "error", where: w.id, message: `${side} component '${end.component}' not found` });
        continue;
      }
      if (!node.terminals.some((t) => t.id === end.terminal)) {
        issues.push({
          severity: "error",
          where: w.id,
          message: `${side} terminal '${end.terminal}' not on '${end.component}'`,
        });
      }
    }
    if (!circuitsById.has(w.circuit)) {
      issues.push({ severity: "error", where: w.id, message: `unknown circuit '${w.circuit}'` });
    }
  }

  // Diodes must reference a real wire.
  for (const d of diodes) {
    if (!wires.some((w) => w.id === d.onWire)) {
      issues.push({ severity: "error", where: d.id, message: `diode references missing wire '${d.onWire}'` });
    }
    if (d.currentA > 1) {
      issues.push({ severity: "warn", where: d.id, message: `diode current ${d.currentA} A is not signal-level` });
    }
  }

  // Relay count vs owned stock (future/provisioned relays take a slot but
  // aren't bought yet, so they don't count against owned stock).
  const spdtUsed = relays.filter((r) => r.type === "SPDT" && !r.future).length;
  const spstUsed = relays.filter((r) => r.type === "SPST" && !r.future).length;
  const spdtOwned = ownedParts.find((p) => p.mfgPn === "301-1C-S-R1-12VDC")?.qtyOwned ?? 0;
  const spstOwned = ownedParts.find((p) => p.mfgPn === "301-1A-C-R1-U03-12VDC")?.qtyOwned ?? 0;
  if (spdtUsed > spdtOwned) issues.push({ severity: "error", where: "relays", message: `${spdtUsed} SPDT used > ${spdtOwned} owned` });
  if (spstUsed > spstOwned) issues.push({ severity: "error", where: "relays", message: `${spstUsed} SPST used > ${spstOwned} owned` });

  // Bulkhead connector capacity vs owned 12-way GT 280 pairs.
  if (connectorPairsNeeded > connectorPairsOwned) {
    issues.push({
      severity: "warn",
      where: "connectors",
      message: `dash/bulkhead crossings need ${connectorPairsNeeded}× 12-way GT 280 pairs but only ${connectorPairsOwned} owned — buy ${connectorPairsNeeded - connectorPairsOwned} more pairs (or use a larger bulkhead connector)`,
    });
  }

  // Fuse positions within block capacity.
  for (const b of fuseBlocks) {
    const used = fuses.filter((f) => f.block === b.id).length;
    if (used > b.fuseWays) issues.push({ severity: "warn", where: b.id, message: `${used} fuses > ${b.fuseWays} ways` });
  }

  // Relay positions within block capacity (PDM holds 2, each RTMR holds 5).
  for (const b of fuseBlocks) {
    const used = relays.filter((r) => r.mountedIn === b.id).length;
    if (used > b.relayWays)
      issues.push({ severity: "warn", where: b.id, message: `${used} relays > ${b.relayWays} relay positions` });
  }

  // Redundant parallels (the piggyback principle): two+ wires leaving the SAME
  // source node, crossing the SAME bulkhead(s), to the SAME module are doing the
  // exact same thing — they should piggyback (jumper at the destination) instead
  // of running parallel back to the hub. Same node = same potential, so this is
  // always lossless. Flags it so it can't creep back in.
  {
    const fromGroups = new Map<string, typeof wires>();
    for (const w of wires) {
      if (!w.via?.length) continue; // only wires that actually cross a bulkhead
      const node = `${w.from.component}.${w.from.terminal}`;
      const arr = fromGroups.get(node) ?? [];
      arr.push(w);
      fromGroups.set(node, arr);
    }
    for (const [node, ws] of fromGroups) {
      if (ws.length < 2) continue;
      const buckets = new Map<string, typeof wires>();
      for (const w of ws) {
        const key = `${[...w.via!].sort().join("+")}→${moduleOf(w.to.component) ?? "?"}`;
        const arr = buckets.get(key) ?? [];
        arr.push(w);
        buckets.set(key, arr);
      }
      for (const [key, group] of buckets) {
        if (group.length >= 2) {
          issues.push({
            severity: "warn",
            where: node,
            message: `redundant parallel: ${group.map((w) => w.label).join(", ")} run together across [${key}] — piggyback (jumper at the destination) instead of a second feed back to the hub`,
          });
        }
      }
    }
  }

  // Each fuse's rating must not exceed the ampacity of the LOAD-carrying wires
  // it protects. 'signal' wires are control taps (relay coils, senders) — they
  // carry milliamps and are intentionally fed off a load fuse, so exempt them.
  for (const w of resolvedWires) {
    if (w.gaugeClass === "signal") continue;
    const f = fuses.find((f) => f.circuit === w.circuit && f.ratingA > 0);
    if (f && f.ratingA > w.ampacity) {
      issues.push({
        severity: "warn",
        where: w.id,
        message: `fuse ${f.ratingA} A may exceed wire ampacity ${w.ampacity} A (${w.mm2} mm²)`,
      });
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Fuse shopping list — how many of each MINI (ATM) rating to buy (+ spares).
// ---------------------------------------------------------------------------
export interface FuseLine {
  ratingA: number;
  fitted: number; // positions using this rating
  buy: number; // fitted + spares
}

// ---------------------------------------------------------------------------
// Termination tally — estimate Metri-Pack 280 terminals / seals / spades the
// build consumes, vs what's owned. Approximate (each connector crossing = 2
// terminals + 2 seals; block/relay ends = 1 sealed MP280; device ends = spade;
// battery/ground ends = ring).
// ---------------------------------------------------------------------------
const MP280_KINDS = new Set(["relay", "fuse-block", "distribution"]);
const RING_KINDS = new Set(["ground", "battery"]);

export interface TerminationTally {
  mp280: number;
  /** MP280 split by gender. Each bulkhead crossing = 1 male half + 1 female half;
   *  block/relay/PDM rear ends assumed FEMALE (harness side) — confirm vs datasheet. */
  mp280Male: number;
  mp280Female: number;
  seals: number;
  spade: number;
  ring: number;
}

export function terminationTally(): TerminationTally {
  let mp280 = 0,
    mp280Male = 0,
    mp280Female = 0,
    seals = 0,
    spade = 0,
    ring = 0;
  for (const w of resolvedWires) {
    for (const end of [w.from, w.to]) {
      const kind = nodesById.get(end.component)?.kind ?? "";
      if (MP280_KINDS.has(kind)) {
        mp280++;
        seals++;
        mp280Female++; // block/relay/PDM rear takes the harness-side female socket
      } else if (RING_KINDS.has(kind)) ring++;
      else spade++;
    }
    const vias = w.via?.length ?? 0;
    mp280 += vias * 2;
    seals += vias * 2;
    mp280Male += vias; // one male terminal per connector half...
    mp280Female += vias; // ...and one female, per crossing
  }
  return { mp280, mp280Male, mp280Female, seals, spade, ring };
}

// THIS build's actual gauge per functional class (signal runs on the owned
// 22 AWG / 0.35 mm², all loom-wrapped). The CLEAN-BUILD recommendation stays
// the optimal gauge in gaugeSpecs (signal = 0.5 mm²).
export const BUILD_GAUGE_MM2: Record<GaugeClass, number> = {
  signal: 0.35,
  low: 0.75,
  medium: 1.5,
  high: 2.5,
  feed: 6,
  main: 25,
};

/** MP280 terminal estimate by BUILD gauge AND gender — for ordering the right
 *  terminal PN per gauge. Each bulkhead crossing = 1 male + 1 female at the
 *  wire's build gauge; block/relay/PDM rear ends counted female. Estimate. */
export function terminalsByGaugeGender(): Array<{ mm2: number; gender: "male" | "female"; count: number }> {
  const counts = new Map<string, number>();
  const add = (mm2: number, gender: "male" | "female", n = 1) =>
    counts.set(`${mm2}|${gender}`, (counts.get(`${mm2}|${gender}`) ?? 0) + n);
  for (const w of resolvedWires) {
    const g = BUILD_GAUGE_MM2[w.gaugeClass];
    const vias = w.via?.length ?? 0;
    if (vias) {
      add(g, "male", vias);
      add(g, "female", vias);
    }
    for (const end of [w.from, w.to]) {
      const kind = nodesById.get(end.component)?.kind ?? "";
      if (MP280_KINDS.has(kind)) add(g, "female");
    }
  }
  return [...counts.entries()]
    .map(([k, count]) => {
      const [mm2, gender] = k.split("|");
      return { mm2: Number(mm2), gender: gender as "male" | "female", count };
    })
    .sort((a, b) => a.mm2 - b.mm2 || a.gender.localeCompare(b.gender));
}

/** Wire plan for THIS build — metres needed (cut-band + 15% waste) per build
 *  gauge, vs owned stock, vs buy. */
export function buildWirePlan(): Array<{ cls: GaugeClass; awg: string; mm2: number; needM: number; ownM: number; buyM: number }> {
  const cutByClass = new Map<GaugeClass, number>();
  for (const w of resolvedWires) {
    const band = lengthBands.find((b) => b.id === w.lengthBandId);
    const cut = band?.cutMm ?? w.lengthMm;
    cutByClass.set(w.gaugeClass, (cutByClass.get(w.gaugeClass) ?? 0) + cut);
  }
  const ownByClass = new Map(ownedWire.map((o) => [o.forClass, o]));
  const order: GaugeClass[] = ["signal", "low", "medium", "high", "feed", "main"];
  return order.map((cls) => {
    const own = ownByClass.get(cls);
    const needM = Math.ceil(((cutByClass.get(cls) ?? 0) * 1.15) / 1000);
    const ownM = own?.meters ?? 0;
    return { cls, awg: own?.awg ?? "—", mm2: BUILD_GAUGE_MM2[cls], needM, ownM, buyM: Math.max(0, needM - ownM) };
  });
}

export function fuseShoppingList(): FuseLine[] {
  const byRating = new Map<number, number>();
  for (const f of fuses) {
    if (f.ratingA <= 0) continue;
    byRating.set(f.ratingA, (byRating.get(f.ratingA) ?? 0) + 1);
  }
  return [...byRating.entries()]
    .map(([ratingA, fitted]) => ({ ratingA, fitted, buy: fitted + Math.max(2, Math.ceil(fitted / 2)) }))
    .sort((a, b) => a.ratingA - b.ratingA);
}

// ---------------------------------------------------------------------------
// Recommended spares — keep these in the car. Every relay is one of TWO
// interchangeable 35 A parts, so one of each covers ANY relay failure (a
// roadside plug-swap; the ignition-main relay is a single point of failure for
// the whole car). Plus a couple of each fuse rating actually fitted.
// ---------------------------------------------------------------------------
export interface SpareItem {
  kind: "relay" | "fuse";
  label: string;
  qty: number;
  mfgPn?: string;
  mouserPn?: string;
  covers?: string;
}
export function recommendedSpares(): SpareItem[] {
  const out: SpareItem[] = [];
  const spst = ownedParts.find((p) => p.mfgPn === "301-1A-C-R1-U03-12VDC");
  const spdt = ownedParts.find((p) => p.mfgPn === "301-1C-S-R1-12VDC");
  if (spst) out.push({ kind: "relay", label: "ISO-280 SPST relay (35 A)", qty: 1, mfgPn: spst.mfgPn, mouserPn: spst.mouserPn, covers: "ign-main, beams, horn, fuel, fan, washer" });
  if (spdt) out.push({ kind: "relay", label: "ISO-280 SPDT relay (35 A)", qty: 1, mfgPn: spdt.mfgPn, mouserPn: spdt.mouserPn, covers: "turn L/R, wiper low/high, starter" });
  const ratings = [...new Set(fuses.filter((f) => f.ratingA > 0).map((f) => f.ratingA))].sort((a, b) => a - b);
  for (const r of ratings) out.push({ kind: "fuse", label: `MINI / ATM blade fuse — ${r} A`, qty: 2, covers: `every ${r} A position` });
  return out;
}

// ---------------------------------------------------------------------------
// Complete from-scratch BOM — one flat, orderable list with quantities. Drives
// the Shopping spreadsheet + CSV export. Terminal/seal/spade counts are
// estimates (+~20% spares); discrete parts are exact.
// ---------------------------------------------------------------------------
export interface BomLine {
  qty: string;
  mouserPn: string;
  mfgPn: string;
  desc: string;
  category: string;
}

export function completeBom(): BomLine[] {
  const L: BomLine[] = [];
  const spares = (n: number) => String(Math.ceil(n * 1.2));
  const mp = (pn?: string) => (pn && /^\d/.test(pn) ? `829-${pn.replace(/-L$/, "")}` : "");

  // 1 — Power centres + relays
  for (const p of ownedParts.filter((p) => p.category === "distribution" || p.category === "relay"))
    L.push({ qty: String(p.qtyOwned), mouserPn: p.mouserPn ?? "", mfgPn: p.mfgPn, desc: p.desc.split(" / ")[0].split(" — ")[0], category: "power/relay" });

  // 2 — Connectors (male + female per size)
  for (const c of connectorBom) {
    L.push({ qty: String(c.pairsNeeded), mouserPn: c.male.mouserPn, mfgPn: c.male.mfgPn, desc: `${c.ways}-way GT 280 — MALE (${c.use})`, category: "connector" });
    L.push({ qty: String(c.pairsNeeded), mouserPn: c.female.mouserPn, mfgPn: c.female.mfgPn, desc: `${c.ways}-way GT 280 — FEMALE`, category: "connector" });
  }
  const halves = connectorBom.reduce((n, c) => n + c.pairsNeeded * 2, 0);
  L.push({ qty: String(halves), mouserPn: "829-15436200", mfgPn: "15436200", desc: "GT 280 secondary lock / TPA (one per connector half)", category: "connector" });

  // 3 — Terminals by gauge × gender (+spares)
  for (const t of terminalsByGaugeGender()) {
    const spec = terminalByGauge.find((s) => s.mm2 === t.mm2);
    if (!spec || spec.isRing) continue;
    const pn = t.gender === "male" ? spec.malePn : spec.femalePn;
    L.push({ qty: spares(t.count), mouserPn: mp(pn), mfgPn: pn ?? "", desc: `MP280 terminal ${spec.awg} AWG (${t.mm2} mm²) — ${t.gender.toUpperCase()}${spec.owned ? "" : " — BUY"}`, category: "terminal" });
  }

  // 4 — Seals / spades / rings (totals + spares)
  const term = terminationTally();
  L.push({ qty: spares(term.seals), mouserPn: "", mfgPn: "15324982 / -81 / -85", desc: "MP280 single-wire seals (match seal size to wire gauge)", category: "terminal" });
  L.push({ qty: spares(term.spade), mouserPn: "829-170187-2", mfgPn: "170187-2 / 1217084-1", desc: "Faston spade receptacles — device ends (250 + 187 series)", category: "terminal" });
  L.push({ qty: String(term.ring), mouserPn: "", mfgPn: "assorted", desc: "Ring terminals — battery / ground / B+ studs (6 / 16 / 25 mm²)", category: "terminal" });

  // 5 — Fuses
  for (const f of fuseShoppingList()) L.push({ qty: String(f.buy), mouserPn: "", mfgPn: `MINI ${f.ratingA}A`, desc: `MINI/ATM blade fuse ${f.ratingA} A (incl. spares)`, category: "fuse" });

  // 6 — Wire (metres incl. waste)
  for (const t of tierTotals) L.push({ qty: `${t.withWasteM} m`, mouserPn: "", mfgPn: `${t.tier.mm2} mm²`, desc: `Automotive wire ${t.tier.mm2} mm² / ${t.tier.awg} AWG`, category: "wire" });

  // 7 — Remaining gaps (PWM, diodes, flasher, grounds, main fusing, loom… not already counted above)
  const skip = new Set(["wire", "mini-fuses", "gauge-connectors", "term-16-14"]);
  for (const g of bomGaps.filter((g) => !skip.has(g.id)))
    L.push({ qty: g.qty, mouserPn: "", mfgPn: "", desc: `${g.item}${g.suggestion ? ` — ${g.suggestion}` : ""}`, category: "other" });

  return L;
}

// ---------------------------------------------------------------------------
// One bundled export for convenience.
// ---------------------------------------------------------------------------
export const harness = {
  meta: {
    car: "Alfa Romeo Giulia GT 1300 Junior — Series 2",
    model: "10530",
    basis: "Factory diagram (owners manual #1490, 11/69)",
    style: "Reliability-refresh modern harness",
  },
  zones,
  zoneLinks,
  gaugeSpecs,
  wireTiers,
  lengthBands,
  components,
  switchComponents,
  relays,
  relayNodes,
  fuseBlocks,
  blockNodes,
  fuses,
  circuits,
  wires,
  resolvedWires,
  diodes,
  connectors,
  complianceNotes,
  ownedParts,
  bomGaps,
  allNodes,
  gaugeTotals,
  tierTotals,
  bandBuckets,
};

export * from "./types";
export {
  zones,
  zoneLinks,
  gaugeSpecs,
  wireTiers,
  lengthBands,
  components,
  switchComponents,
  relays,
  fuseBlocks,
  fuses,
  circuits,
  wires,
  diodes,
  connectors,
  complianceNotes,
  ownedParts,
  bomGaps,
};
