import type { DeviceComponent, ResolvedWire, Terminal } from "./types";
import { zones, zoneLinks, gaugeSpecs, lengthBands, wireTiers } from "./zones";
import { components, switchComponents } from "./components";
import { relays, fuseBlocks } from "./relays";
import { fuses } from "./fuses";
import { circuits } from "./circuits";
import { wires } from "./wires";
import { diodes } from "./diodes";
import { connectors, connectorPairsNeeded, connectorPairsOwned } from "./connectors";
import { complianceNotes } from "./compliance";
import { ownedParts, bomGaps } from "./parts";
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

  // Relay count vs owned stock.
  const spdtUsed = relays.filter((r) => r.type === "SPDT").length;
  const spstUsed = relays.filter((r) => r.type === "SPST").length;
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
  seals: number;
  spade: number;
  ring: number;
}

export function terminationTally(): TerminationTally {
  let mp280 = 0,
    seals = 0,
    spade = 0,
    ring = 0;
  for (const w of resolvedWires) {
    for (const end of [w.from, w.to]) {
      const kind = nodesById.get(end.component)?.kind ?? "";
      if (MP280_KINDS.has(kind)) {
        mp280++;
        seals++;
      } else if (RING_KINDS.has(kind)) ring++;
      else spade++;
    }
    const vias = w.via?.length ?? 0;
    mp280 += vias * 2;
    seals += vias * 2;
  }
  return { mp280, seals, spade, ring };
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
