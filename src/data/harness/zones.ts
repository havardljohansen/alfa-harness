import type { Zone, ZoneLink, GaugeSpec, LengthBand, WireTier, GaugeClass } from "./types";

// ---------------------------------------------------------------------------
// Physical zones of the car.
// ---------------------------------------------------------------------------
export const zones: Zone[] = [
  {
    id: "battery",
    name: "Battery / main junction",
    description:
      "Battery and main power junction. In the 10530 the battery sits in the engine bay; this is the origin of all constant-power feeds and the alternator charge return.",
  },
  {
    id: "engine-front",
    name: "Engine bay — front",
    description:
      "Front cross-panel: head/park/turn lamps, horns, and the fuse/relay centres (Littelfuse PDM + Bussmann RTMRs) which live up front per the build.",
  },
  {
    id: "engine-rear",
    name: "Engine bay — bulkhead",
    description:
      "Rear of the bay against the firewall: ignition coil, alternator, starter, temp/oil senders, wiper motor, fuel-pump feed pass-through.",
  },
  {
    id: "dash",
    name: "Dashboard",
    description:
      "Behind the instrument panel: gauges, warning lamps, ignition switch, the three 3-position switches, flasher, interior-light feed and the bulkhead plugs to the engine bay.",
  },
  {
    id: "cabin",
    name: "Cabin",
    description: "Footwells, door pillars and roof: interior light, door switches, courtesy feeds.",
  },
  {
    id: "rear",
    name: "Rear / boot",
    description:
      "Tail, brake and turn lamps, number-plate light, reverse lamp, and the electric fuel pump / tank sender.",
  },
];

// ---------------------------------------------------------------------------
// Harness route distances between adjacent zones (mm, along the loom — not
// straight-line). EDIT THESE with real measurements from the car to make the
// deduced wire lengths exact. Values below are conservative estimates for a
// ~4.08 m Giulia GT.
// ---------------------------------------------------------------------------
export const zoneLinks: ZoneLink[] = [
  { from: "battery", to: "engine-front", routeMm: 900, measure: "Battery post → front cross-panel (PDM + front-lamp area), along the inner wing." },
  { from: "battery", to: "engine-rear", routeMm: 700, measure: "Battery post → firewall/bulkhead hub (coil, starter, the two RTMRs)." },
  { from: "engine-front", to: "engine-rear", routeMm: 800, measure: "Front cross-panel → firewall hub across the bay (PDM/front lamps ↔ RTMR hub)." },
  { from: "engine-rear", to: "dash", routeMm: 700, measure: "Through the firewall bulkhead grommet into the back of the dash (the BH1/BH2 crossing)." },
  { from: "dash", to: "cabin", routeMm: 600, measure: "Behind the dash down into the footwell / cabin." },
  { from: "cabin", to: "rear", routeMm: 2600, measure: "Along the sill from the footwell to the boot." },
  { from: "dash", to: "rear", routeMm: 3000, measure: "Direct dash → boot run — the rear loom's main spine (BH3 to the tail)." },
  { from: "engine-front", to: "dash", routeMm: 1300, measure: "Front lamp / PDM area → dash — the lighting & signal loom (BH2/BH4 path)." },
];

// Heavy single cables worth measuring on their own — each is a discrete run
// (not a loom bundle) and dominates the thick-gauge totals.
export const heavyRunsToMeasure = [
  { label: "Battery − → engine-bay ground hub", note: "Main earth bond (heavy)." },
  { label: "Battery + → starter post", note: "Starter cable — size to the motor." },
  { label: "Alternator B+ → battery / junction", note: "Charge cable (mega-fused)." },
  { label: "Battery + → PDM input", note: "Front headlight-power feed (MIDI-fused)." },
  { label: "Front-clip ground block → hub", note: "Front module ground trunk." },
  { label: "Dash ground block → hub", note: "Dash module ground trunk." },
  { label: "Rear/boot ground block → hub", note: "Rear module ground trunk (full-length)." },
];

/** Allowance added inside a single zone when from/to are in the same zone. */
export const intraZoneMm = 350;

// ---------------------------------------------------------------------------
// Recommended modern gauges by functional class.
// Ampacity figures are conservative continuous ratings for short, bundled
// automotive runs (TXL/GXL @ 12V, derated for bundling) — they intentionally
// undercut SAE single-wire-in-free-air numbers so a wire is never the weak
// point ahead of its fuse.
// ---------------------------------------------------------------------------
export const gaugeSpecs: GaugeSpec[] = [
  {
    class: "signal",
    mm2: 0.5,
    awg: 20,
    ampacity: 5,
    use: "Relay coils, sender/gauge signals, switch trigger wires, warning-lamp feeds. Carries milliamps to ~1 A; 0.5 mm² is chosen for mechanical robustness, not current.",
  },
  {
    class: "low",
    mm2: 0.75,
    awg: 18,
    ampacity: 8,
    use: "Single small bulbs, instrument illumination, indicator repeaters.",
  },
  {
    class: "medium",
    mm2: 1.0,
    awg: 16,
    ampacity: 12,
    use: "Tail/park clusters, turn lamps, reverse, brake, wiper low speed, interior.",
  },
  {
    class: "high",
    mm2: 2.5,
    awg: 14,
    ampacity: 20,
    use: "Headlight beam feeds, horns, heater blower, fuel pump, wiper high speed — relay outputs.",
  },
  {
    class: "feed",
    mm2: 6.0,
    awg: 10,
    ampacity: 50,
    use: "Fuse-block bus feeds, ignition main-relay feed, PDM input.",
  },
  {
    class: "main",
    mm2: 16.0,
    awg: 6,
    ampacity: 100,
    use: "Battery main and alternator B+ charge wire.",
  },
];

// ---------------------------------------------------------------------------
// Consolidated purchase tiers — so the build uses only a handful of wire
// sizes. Each wire keeps its ideal gauge (above) but is bought/cut at its
// tier size. Five sizes cover the whole car.
// ---------------------------------------------------------------------------
export const wireTiers: WireTier[] = [
  { id: "S", label: "Small — signals & light loads", mm2: 0.75, awg: 18, note: "One size for ALL signal/coil/sender wires and small single bulbs. The bulk of the harness." },
  { id: "M", label: "Medium — general power", mm2: 1.5, awg: 16, note: "Most powered circuits: tail/park, turn, brake, reverse, wiper/washer feeds." },
  { id: "L", label: "Large — headlights & heavy loads", mm2: 2.5, awg: 14, note: "Headlight beams, horns, heater blower, fuel pump — relay outputs." },
  { id: "F", label: "Feed — bus & charge", mm2: 6.0, awg: 10, note: "Fuse-block bus feeds, ignition main relay, alternator B+." },
  { id: "B", label: "Battery & starter — huge", mm2: 25.0, awg: 4, note: "Battery main and starter feed. Size the starter cable to your motor (25–35 mm²)." },
];

/** Map each ideal gauge class onto a purchase tier. */
export const classToTier: Record<GaugeClass, string> = {
  signal: "S",
  low: "S",
  medium: "M",
  high: "L",
  feed: "F",
  main: "B",
};

// ---------------------------------------------------------------------------
// Cut-length bands — group wires so they can be cut in batches.
// A wire falls in the band whose [minMm, maxMm) it lands in; cut it at `cutMm`
// (band ceiling, which already bakes in routing slack).
// ---------------------------------------------------------------------------
export const lengthBands: LengthBand[] = [
  { id: "A", label: "A — short (≤0.5 m)", minMm: 0, maxMm: 500, cutMm: 500 },
  { id: "B", label: "B — 0.5–1.0 m", minMm: 500, maxMm: 1000, cutMm: 1000 },
  { id: "C", label: "C — 1.0–1.6 m", minMm: 1000, maxMm: 1600, cutMm: 1600 },
  { id: "D", label: "D — 1.6–2.4 m", minMm: 1600, maxMm: 2400, cutMm: 2400 },
  { id: "E", label: "E — 2.4–3.4 m", minMm: 2400, maxMm: 3400, cutMm: 3400 },
  { id: "F", label: "F — long (>3.4 m)", minMm: 3400, maxMm: 99999, cutMm: 4200 },
];
