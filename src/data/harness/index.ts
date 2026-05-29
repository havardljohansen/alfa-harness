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
import { ownedParts, bomGaps, terminalByGauge } from "./parts";
import type { GaugeClass } from "./types";
import { resolveWire, wireTotalsByGauge, wireTotalsByTier, wiresByBand } from "./derive";
import { moduleOf } from "./modules";

const term = (id: string, label: string, din?: string): Terminal => ({ id, label, din });

// ---------------------------------------------------------------------------
// Synthesise graph nodes for relays and fuse blocks so wires (which reference
// their terminals) resolve, and the explorer can draw them.
// ---------------------------------------------------------------------------
const relayNodes: DeviceComponent[] = relays.map((r) => {
  // mountedIn is usually a fuse-block id (rtmr-const / rtmr-ign / pdm). It can
  // also be a freeform location string for externally-mounted relays (e.g. the
  // washer-future relay, evicted from rtmr-const when the flasher took its
  // cavity). For external mounts we don't have a block to copy the zone from,
  // so we parse it out of the location string or fall back to engine-front.
  const block = fuseBlocks.find((b) => b.id === r.mountedIn);
  const zone = block?.zone ?? (r.mountedIn.includes("dash") ? "dash" : r.mountedIn.includes("rear") ? "rear" : "engine-front");
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
    zone,
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

  // Per-size GT 280 connector shortfalls — the connectorBom is the canonical
  // size-aware view; surface any row with pairsToBuy > 0 as a warn so it
  // shows up on /shopping and /modules audits. (Old single-line check that
  // assumed everything was 12-way was misleading once 6/8/10/4/2-way
  // bulkheads + sub-connectors entered the design.)
  for (const row of connectorBom) {
    if (row.pairsToBuy > 0) {
      issues.push({
        severity: "warn",
        where: "connectors",
        message: `${row.ways}-way GT 280: need ${row.pairsNeeded} pair${row.pairsNeeded === 1 ? "" : "s"}, own ${row.pairsOwned}, buy ${row.pairsToBuy} more — ${row.use}`,
      });
    }
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

// Build gauge per functional class — matches the clean-build recommendation in
// gaugeSpecs (signal = 0.5 mm² / 20 AWG, sized for mechanical robustness).
export const BUILD_GAUGE_MM2: Record<GaugeClass, number> = {
  signal: 0.5,
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
// Wire shopping — split GROUND vs NON-GROUND, by build gauge. Lengths carry
// the standard 15% waste; future/capped wires (O2, PWM low-speed) are excluded.
// Ground = any wire landing on a ground block or the battery −.
// ---------------------------------------------------------------------------
const GND_NODES = new Set(["gnd-eng", "gnd-front", "gnd-dash", "gnd-rear"]);
const isGroundWire = (w: ResolvedWire) =>
  GND_NODES.has(w.from.component) ||
  GND_NODES.has(w.to.component) ||
  (w.to.component === "battery" && w.to.terminal === "-") ||
  (w.from.component === "battery" && w.from.terminal === "-");

const CLASS_BUY_GAUGE: Record<GaugeClass, string> = {
  signal: "20 AWG / 0.5 mm²",
  low: "18 AWG / 0.75 mm²",
  medium: "16 AWG / 1.5 mm²",
  high: "14 AWG / 2.5 mm²",
  feed: "10 AWG / 6 mm²",
  main: "4 AWG / 25 mm²",
};

export interface WireSplitRow {
  gaugeClass: GaugeClass;
  gauge: string;
  groundM: number;
  nonGroundM: number;
  totalM: number;
}

export function wireGroundSplit(): WireSplitRow[] {
  const bandCut = new Map(lengthBands.map((b) => [b.id, b.cutMm]));
  const order: GaugeClass[] = ["signal", "low", "medium", "high", "feed", "main"];
  const acc = new Map<GaugeClass, { g: number; n: number }>();
  for (const c of order) acc.set(c, { g: 0, n: 0 });
  for (const w of resolvedWires) {
    if (w.future) continue;
    const a = acc.get(w.gaugeClass);
    if (!a) continue;
    const cut = bandCut.get(w.lengthBandId) ?? w.lengthMm;
    if (isGroundWire(w)) a.g += cut;
    else a.n += cut;
  }
  const m = (mm: number) => Math.ceil((mm * 1.15) / 1000);
  return order.map((c) => {
    const a = acc.get(c)!;
    return {
      gaugeClass: c,
      gauge: CLASS_BUY_GAUGE[c],
      groundM: m(a.g),
      nonGroundM: m(a.n),
      totalM: m(a.g + a.n),
    };
  });
}

// ---------------------------------------------------------------------------
// GT 280 bulkhead-plug terminals & seals — EXACT, by gauge. Each wire crossing
// a GT 280 bulkhead (bh1-4; sw3 is a separate cluster connector) needs a male
// terminal one side + female the other + a seal each side. Owned: GT 280 male
// only — female + seals are the audit gap. Derived so it stays accurate.
// ---------------------------------------------------------------------------
export interface Gt280TermRow {
  size: string;
  perSide: number;
  malePn: string;
  maleOwned: number;
  maleBuy: number;
  femalePn: string;
  femaleBuy: number;
  sealPn: string;
  sealBuy: number;
}
export function gt280TerminalPlan(): Gt280TermRow[] {
  const GT = new Set(["bh1", "bh2", "bh3", "bh4"]);
  const sizeOf = (c: GaugeClass) => (c === "signal" ? "22-20" : c === "high" ? "14-12" : "18-16");
  const perSide: Record<string, number> = { "22-20": 0, "18-16": 0, "14-12": 0 };
  for (const w of resolvedWires) {
    if (w.future) continue;
    for (const v of w.via ?? []) if (GT.has(v)) perSide[sizeOf(w.gaugeClass)]++;
  }
  const meta: Record<string, { malePn: string; femalePn: string; sealPn: string }> = {
    "22-20": { malePn: "15304730-L", femalePn: "15304718-L", sealPn: "15366065" },
    "18-16": { malePn: "15304731-L", femalePn: "15304719-L", sealPn: "15366066" },
    "14-12": { malePn: "15304724-L", femalePn: "15304720-L", sealPn: "15366067" },
  };
  const owned = new Map(ownedParts.map((p) => [p.mfgPn, p.qtyOwned]));
  const sp = (n: number) => Math.ceil(n * 1.2); // +20% crimp spares
  return (["22-20", "18-16", "14-12"] as const).map((size) => {
    const n = perSide[size];
    const m = meta[size];
    const maleOwned = owned.get(m.malePn) ?? 0;
    return {
      size,
      perSide: n,
      malePn: m.malePn,
      maleOwned,
      maleBuy: Math.max(0, sp(n) - maleOwned),
      femalePn: m.femalePn,
      femaleBuy: sp(n),
      sealPn: m.sealPn,
      sealBuy: sp(n * 2),
    };
  });
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
    L.push({ qty: spares(t.count), mouserPn: mp(pn), mfgPn: pn ?? "", desc: `280-series terminal ${spec.awg} AWG (${t.mm2} mm²) — ${t.gender.toUpperCase()}${spec.owned ? "" : " — BUY"} (GT 280 for plug ends, Metri-Pack 280 for block/device — see gaps for the GT 280 female + seals)`, category: "terminal" });
  }

  // 4 — Seals / spades / rings (totals + spares)
  const term = terminationTally();
  L.push({ qty: spares(term.seals), mouserPn: "", mfgPn: "15324982 / -81 / -85", desc: "Metri-Pack 280 single-wire seals — block/device side (the GT 280 plugs use GT 280 seals 15366065/66/67 — see gaps)", category: "terminal" });
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
