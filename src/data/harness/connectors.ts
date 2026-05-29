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
  /** Cavities in this connector. Defaults to the 12-way GT 280; clusters size to fit. */
  ways?: number;
  /** How many physical plug pairs this bulkhead is planned to use. Default 1 —
   *  most bulkheads should fit in a single connector. Multi-plug bulkheads
   *  (currently just bh1, planned as 2 × 10-way) must declare it explicitly so
   *  the model-integrity test catches overflow into an extra plug as a
   *  refactor regression. */
  expectedPlugs?: number;
}

export const logicalBulkheads: LogicalBulkhead[] = [
  {
    id: "bh1",
    name: "Power & instruments",
    zoneA: "engine-rear",
    zoneB: "dash",
    ways: 10,
    expectedPlugs: 2,
    purpose:
      "Ignition feeds, sender signals (temp/oil/tach), charge lamp, dash power, wiper/fan coil feeds, headlight switch constant feed (post-refactor), flash constant feed (post-refactor). The main firewall crossing — 19 wires across two 10-way GT 280 plugs (10 + 9).",
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
    ways: 8,
    purpose: "To the boot: tail, brake, rear turn, plate, reverse, fuel pump, tank sender + rear PARK key-off override leg. 8 pins in an 8-way (fully populated — no spare after the headlight architecture refactor added w-park-override-rear). If a future change adds another BH3-crossing wire, bump to 12-way.",
  },
  {
    id: "bh4",
    name: "Front clip — lighting, blinkers & horn",
    zoneA: "engine-rear",
    zoneB: "engine-front",
    ways: 12,
    purpose:
      "The whole front-of-car module unplugs here: headlight PDM + beams, front position lamps + PARK key-off override, front turn signals + side repeaters, and the horns. Beam-relay triggers and the main-beam tell-tale pass through from the dash; the turn/horn relay outputs come from the main loom. Piggybacks keep the pin count down: one front-position feed (RH jumpers off LH), and the side repeaters jumper off the front indicators. The PDM's battery feed (ring) and the front-clip ground trunk are separate heavy cables, so this one 12-way signal plug frees the front clip. (Bumped from 8-way to 12-way after the headlight refactor added w-park-override-fr — 9 wires in an 8-way overflowed to 2 plugs, defeating the 'one plug frees the clip' design intent.)",
  },
  {
    id: "em1",
    name: "Engine-management interface (chassis loom ↔ engine pigtails / future K6+ kit)",
    zoneA: "engine-front",
    zoneB: "engine-rear",
    ways: 12,
    expectedPlugs: 1,
    purpose:
      "Engine-bay boundary connector — the single light-signal interface between the chassis loom and whatever engine is fitted. Today (Nord) carries 8 active pins: ignition feed + ground + tach + temp signal/ground + oil signal + oil warning + alt D+ + starter solenoid trigger. Future (155 TS + Alfaholics K6+ kit) carries the same 8 active pins to equivalent terminals inside the kit's universal loom, plus optionally lights up pins 10-12 (ECU fan trigger / CTS pass-through / spare). Pin assignment is identical for both engines — only the engine-side pigtail destinations differ. Heavy cables (alt B+, starter B+, alt case ground) bypass EM1 entirely as direct stud-mount terminations. See ARCHITECTURE.md for the full pin map.",
  },
  {
    id: "dl",
    name: "Dash-lights interface (chassis loom ↔ dim adapter or passthrough)",
    zoneA: "dash",
    zoneB: "dash",
    ways: 4,
    expectedPlugs: 1,
    purpose:
      "Boundary connector between the chassis side and whichever dashboard-illumination adapter is fitted. Aptiv 4-way GT 280 sealed pair (male 13521461 / female 13521459) — same family + same terminals as fc and the bulkheads. 4 pins fixed on the chassis side regardless of adapter: pin 1 = gated 12V via the diode-OR (sw-instr.dim + sw-instr.bright through 2× 1N5822 Schottky) — carries the ~2 A panel-light load directly when no PWM is installed; pin 2 = ground (local gnd-dash, not gnd-eng — load is light enough); pin 3 = BRIGHT signal (12V when switch in BRIGHT); pin 4 = DIM signal (12V when switch in DIM). Today's adapter (PWM via the existing instr-pwm module) uses pins 2/3/4 only and ignores pin 1. A future PASSTHROUGH variant (no PWM module — LEDs at full brightness whenever switch != OFF) uses pins 1+2 and caps 3+4. Same swap-an-adapter pattern as fc.",
  },
  {
    id: "fc",
    name: "Fan-adapter interface (chassis loom ↔ fan adapter)",
    zoneA: "engine-front",
    zoneB: "engine-rear",
    ways: 4,
    expectedPlugs: 1,
    purpose:
      "Boundary connector between the chassis loom and whatever heater-fan adapter is fitted. Aptiv 4-way GT 280 sealed pair (male 13521461 / female 13521459) — same in-family as the existing bulkhead plugs, uses the same GT 280 terminals + seals you already own. 4 pins fixed on the chassis side regardless of which fan variant is used: pin 1 = gated 12V (~15 A from Bussmann rly-fan); pin 2 = ground (carries motor return + coil ground); pin 3 = HIGH-position signal (low current); pin 4 = LOW-position signal (low current). Today's adapter (3-wire fan = GND + HIGH winding + LOW winding) contains a single SPDT and uses pins 1/2/3 — pin 4 is provisioned for forward-compat with a future 4-wire smart fan. Swapping to a 2-wire fan: build an adapter using only pins 1+2 and capping 3+4. 4-way TPA (15430898 grey) is optional but recommended for vibration. PNs sourced via Custom Connector Kits 2026-05-29; verify in person before crimping.",
  },
  {
    id: "sw3",
    name: "3-way switch cluster (firewall)",
    zoneA: "engine-rear",
    zoneB: "dash",
    family: "cluster",
    ways: 10,
    purpose:
      "The three vintage 3-way switches (wipers / instrument-lights / heater-fan) plug in here. They sit just above where the main loom enters the firewall, so the cluster taps the loom at that point rather than at the end of the dash harness — unplug this one connector to drop all three switches. 9 low-current pins used today (1 piggybacked feed + 8 outputs: wiper LOW/HIGH/WASH, instr DIM/BRIGHT, heater-fan HIGH/LOW signal pair × 2 destinations — gate diode-OR + fan-adapter SPDT); 10-way connector fits with 1 spare for a shared ground pin if the switches are ever swapped for illuminated ones. Needn't be a GT 280.",
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
  const family = lb.family ?? "gt280";
  const cluster = family === "cluster";
  const ways = lb.ways ?? WAYS;
  const groups = chunk(lbWires, ways);
  return groups.map((groupWires, gi) => ({
    id: groups.length > 1 ? `${lb.id}-${gi + 1}` : lb.id,
    name: groups.length > 1 ? `${lb.name} (plug ${gi + 1}/${groups.length})` : lb.name,
    ways,
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
      color: w.color,
    })),
  }));
});

/** How many 12-way GT 280 bulkhead pairs the design needs (vs the 3 owned). Clusters excluded. */
export const connectorPairsNeeded = connectors.filter((c) => c.family !== "cluster").length;
export const connectorPairsOwned = 3;

// ---------------------------------------------------------------------------
// Connector shopping — housings by size, as matched MALE + FEMALE pairs so the
// gender can never be got wrong (you buy one of each PN per pair). Bulkhead /
// cluster counts are DERIVED from the connector groups above; the two gauge
// 6-ways are device-side, added explicitly. Mouser PN = "829-" + the Aptiv PN.
// ---------------------------------------------------------------------------
const GT280_PN: Record<number, { m: string; f: string }> = {
  2: { m: "13518847", f: "13518845" },  // sealed 2-way (was 15326678 / 15326679 — current PNs verified Custom Connector Kits 2026-05-29)
  4: { m: "13521461", f: "13521459" },
  6: { m: "15326640", f: "13521467" },
  8: { m: "15326655", f: "15326654" },
  10: { m: "15326661", f: "15326660" },
  12: { m: "15326915", f: "15326910" },
};
const SIZE_USE: Record<number, string> = {
  2: "Service-break connectors at engine-bay devices (brake switch, O2, senders, fuel pump, reverse switch) + spares for front turn signals + side repeaters — 11 pairs total. Lets you unplug + replace any of these without cutting/recrimping.",
  4: "FC fan-adapter boundary (verified via Custom Connector Kits 2026-05-29)",
  6: "Speedo + tach gauge plugs (1 cavity blanked)",
  8: "BH3 rear · BH4 front · SW3 switch cluster",
  10: "BH1 dash power (two plugs: 10 + 7)",
  12: "BH2 dash lighting",
};
/** Owned housing pairs by size (across orders 77657766 + 280336112). */
const OWNED_PAIRS: Record<number, number> = {
  6: 2,   // gauge connectors (speedo + tach) — 15326640 M + 13521467 F × 2
  8: 1,   // bh3 rear bulkhead — 15326655 M + 15326654 F × 1
  10: 2,  // bh1 dash power (two plugs) — 15326661 M + 15326660 F × 2
  12: 3,  // bh2 + bh4 + em1 — 15326915 M + 15326910 F × 3
  // 4: 0 — fan-adapter (fc connector) STILL TO BUY (13521461 + 13521459)
  // 2: 0 — service-break connectors (11 pairs needed) STILL TO BUY (13518847 + 13518845)
};

export const mouserUrl = (mfgPn: string) => `https://www.mouser.com/c/?q=${mfgPn}`;

export interface ConnectorBuy {
  ways: number;
  pairsNeeded: number;
  pairsOwned: number;
  pairsToBuy: number;
  use: string;
  male: { mfgPn: string; mouserPn: string; url: string };
  female: { mfgPn: string; mouserPn: string; url: string };
}

export const connectorBom: ConnectorBuy[] = (() => {
  const need = new Map<number, number>();
  for (const c of connectors) need.set(c.ways, (need.get(c.ways) ?? 0) + 1);
  need.set(6, (need.get(6) ?? 0) + 2); // two device-side gauge 6-ways
  need.set(12, (need.get(12) ?? 0) + 1); // EM1 engine-bay boundary (12-way): pin-level model in components.ts, no longer auto-derived via via:em1 since the refactor 2026-05-29. Manual +1 keeps the connector BOM accurate.
  need.set(4, (need.get(4) ?? 0) + 1); // FC fan-adapter boundary (4-way): pin-level model in components.ts; wires terminate AT fc rather than passing via, so the auto-derivation misses it. Manual +1 keeps the connector BOM accurate (added 2026-05-29).
  need.set(4, (need.get(4) ?? 0) + 1); // DL dim-adapter boundary (4-way): same situation as fc — wires terminate AT dl. Manual +1 (added 2026-05-29).
  need.set(2, (need.get(2) ?? 0) + 11); // Service-break connectors (2-way × 11): inline at engine-bay devices (brake, O2, senders, fuel pump, reverse switch) + spares for front turns + side repeaters. Not part of the chassis-loom topology — pure service convenience.
  const mk = (p: string) => ({ mfgPn: p, mouserPn: `829-${p}`, url: mouserUrl(p) });
  return [...need.keys()]
    .sort((a, b) => b - a)
    .map((ways) => {
      const pn = GT280_PN[ways];
      const pairsNeeded = need.get(ways)!;
      const pairsOwned = OWNED_PAIRS[ways] ?? 0;
      return {
        ways,
        pairsNeeded,
        pairsOwned,
        pairsToBuy: Math.max(0, pairsNeeded - pairsOwned),
        use: SIZE_USE[ways] ?? "",
        male: mk(pn.m),
        female: mk(pn.f),
      };
    });
})();
