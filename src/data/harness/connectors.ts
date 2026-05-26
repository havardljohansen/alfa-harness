import type { ConnectorGroup, ZoneId } from "./types";
import { wires } from "./wires";

// ===========================================================================
// Bulkhead connectors — the "unplug the dashboard" plugs.
// You own 3× 12-way GT 280 pairs (male 15326915 / female 15326910). Wires are
// grouped into three LOGICAL bulkheads by function; each logical bulkhead is
// then split into as many physical 12-way plugs as its wire count needs.
//
//   BH1 — power & instruments (engine ↔ dash)
//   BH2 — lighting & signal triggers (engine-front ↔ dash)
//   BH3 — rear loom (engine-front ↔ rear)
//
// The reality (surfaced on the BOM page): the crossings need MORE than three
// 12-way plugs, so a couple of extra GT 280 pairs are required — or step up to
// a larger bulkhead connector. The split below respects the 12-way limit.
// ===========================================================================

const WAYS = 12;

interface LogicalBulkhead {
  id: string;
  name: string;
  zoneA: ZoneId;
  zoneB: ZoneId;
  purpose: string;
}

export const logicalBulkheads: LogicalBulkhead[] = [
  {
    id: "bh1",
    name: "Power & instruments",
    zoneA: "engine-rear",
    zoneB: "dash",
    purpose:
      "Ignition feeds, sender signals (temp/oil/tach), charge lamp, dash power, wiper/fan coil feeds. The main firewall crossing.",
  },
  {
    id: "bh2",
    name: "Lighting & signal triggers",
    zoneA: "engine-front",
    zoneB: "dash",
    purpose:
      "Relay-coil triggers and low-current lighting from the dash switches: headlight enable/low/high, turn L/R, hazard, horn, position feed, tell-tales.",
  },
  {
    id: "bh3",
    name: "Rear loom",
    zoneA: "engine-front",
    zoneB: "rear",
    purpose: "To the boot: tail, brake, rear turn, plate, reverse, fuel pump, tank sender.",
  },
];

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Build the physical connectors by splitting each logical bulkhead into 12-way plugs.
export const connectors: ConnectorGroup[] = logicalBulkheads.flatMap((lb) => {
  const lbWires = wires.filter((w) => w.via?.includes(lb.id));
  const groups = chunk(lbWires, WAYS);
  return groups.map((groupWires, gi) => ({
    id: groups.length > 1 ? `${lb.id}-${gi + 1}` : lb.id,
    name: groups.length > 1 ? `${lb.name} (plug ${gi + 1}/${groups.length})` : lb.name,
    ways: WAYS,
    partRefMale: "15326915",
    partRefFemale: "15326910",
    zoneA: lb.zoneA,
    zoneB: lb.zoneB,
    purpose: lb.purpose,
    pins: groupWires.map((w, i) => ({
      pin: i + 1,
      wireLabel: w.label,
      signal: w.name,
      reserved: w.future,
    })),
  }));
});

/** How many 12-way GT 280 pairs the design needs (vs the 3 owned). */
export const connectorPairsNeeded = connectors.length;
export const connectorPairsOwned = 3;
