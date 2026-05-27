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
//   BH4 — front clip: PDM + front lamps, blinkers & horn (detaches from main loom)
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
  /** "gt280" big 12-way bulkhead (default) or "cluster" smaller low-current connector. */
  family?: "gt280" | "cluster";
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
  {
    id: "bh4",
    name: "Front clip — lighting, blinkers & horn",
    zoneA: "engine-rear",
    zoneB: "engine-front",
    purpose:
      "The whole front-of-car module unplugs here: headlight PDM + beams, front position lamps, front turn signals + side repeaters, and the horns. Beam-relay triggers and the main-beam tell-tale pass through from the dash; the turn/horn relay outputs come from the main loom. Piggybacks keep the pin count down: one front-position feed (RH jumpers off LH), and the side repeaters jumper off the front indicators. The PDM's battery feed (ring) and the front-clip ground trunk are separate heavy cables, so this one signal plug frees the front clip.",
  },
  {
    id: "sw3",
    name: "3-way switch cluster (firewall)",
    zoneA: "engine-rear",
    zoneB: "dash",
    family: "cluster",
    purpose:
      "The three vintage 3-way switches (wipers / instrument-lights / heater-fan) plug in here. They sit just above where the main loom enters the firewall, so the cluster taps the loom at that point rather than at the end of the dash harness — unplug this one connector to drop all three switches. All pins are low-current (switch coil/select signals only), so this needn't be a 12-way GT 280 like the big bulkheads — a smaller 9–12-way connector is fine.",
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
  const family = lb.family ?? "gt280";
  const cluster = family === "cluster";
  return groups.map((groupWires, gi) => ({
    id: groups.length > 1 ? `${lb.id}-${gi + 1}` : lb.id,
    name: groups.length > 1 ? `${lb.name} (plug ${gi + 1}/${groups.length})` : lb.name,
    ways: WAYS,
    partRefMale: cluster ? "(small 9–12-way connector — TBD)" : "15326915",
    partRefFemale: cluster ? "(small 9–12-way connector — TBD)" : "15326910",
    zoneA: lb.zoneA,
    zoneB: lb.zoneB,
    purpose: lb.purpose,
    family,
    pins: groupWires.map((w, i) => ({
      pin: i + 1,
      wireLabel: w.label,
      signal: w.name,
      reserved: w.future,
    })),
  }));
});

/** How many 12-way GT 280 bulkhead pairs the design needs (vs the 3 owned). Clusters excluded. */
export const connectorPairsNeeded = connectors.filter((c) => c.family !== "cluster").length;
export const connectorPairsOwned = 3;
