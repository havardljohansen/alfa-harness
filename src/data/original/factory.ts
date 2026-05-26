// =============================================================================
// FACTORY ARCHITECTURE — Alfa Romeo Giulia GT 1300 Junior, Series 2 (10530)
// -----------------------------------------------------------------------------
// A faithful, structured capture of the ORIGINAL wiring, read off the factory
// diagram (owners manual #1490, 11/69) in /reference. This is the reference
// the modern harness is derived from — it makes the original auditable and
// drives the original→modern transformation table.
//
// It is intentionally NOT a full wire-by-wire netlist (we're not rebuilding the
// factory loom) — it captures the architecture: the ignition switch, charging,
// the 10-fuse legend, the colour/gauge code, and the component inventory with
// each item's fate in the modern harness.
// =============================================================================

export const factoryMeta = {
  make: "Alfa Romeo",
  model: "Giulia GT 1300 Junior — Series 2",
  modelCode: "10530",
  chassis: "1230001–1260000 (LHD), 1292001–1295000 (RHD)",
  source: "Owners manual #1490, dated 11/69",
  polarity: "Negative ground (12 V)",
};

// ---------------------------------------------------------------------------
// Ignition switch — 3-position, read from the diagram: the only outputs are
// the run loads (15) and the starter (50); the lights are NOT on it, and there
// is no accessory-only tap. So: STOP / MARCIA (run) / AVVIAMENTO (start).
// ---------------------------------------------------------------------------
export interface FactoryIgnitionPosition {
  name: string;
  din?: string;
  feeds: string;
}

export const factoryIgnition = {
  positions: 3,
  detents: [
    { name: "0 — STOP", feeds: "Nothing." },
    { name: "I — MARCIA (run)", din: "15", feeds: "Ignition coil + the ignition-side fuses (gauges, wipers, fan, turn signals)." },
    { name: "II — AVVIAMENTO (start)", din: "50", feeds: "Starter solenoid (spring-returns to Run)." },
  ] as FactoryIgnitionPosition[],
  terminals: ["30 (battery in)", "15 (run)", "50 (start)"],
  note: "No accessory detent and no lights position — the headlight/position switch is fed from the battery, independent of the key.",
};

// ---------------------------------------------------------------------------
// Charging — dynamo + external regulator (the part the modern harness deletes).
// ---------------------------------------------------------------------------
export const factoryCharging = {
  type: "DC dynamo (generator) + external voltage regulator",
  generatorTerminals: ["D+ / 51 (output)", "DF (field)", "61 (charge lamp)"],
  regulatorTerminals: ["DF", "51", "61"],
  note: "Replaced wholesale by an internally-regulated alternator in the modern harness.",
};

// ---------------------------------------------------------------------------
// Fuses — 10 positions, ALL 8 A, with the factory load legend verbatim.
// `modern` notes where those loads live now.
// ---------------------------------------------------------------------------
export interface FactoryFuse {
  n: number;
  ratingA: number;
  loads: string;
  modern: string;
}

export const factoryFuses: FactoryFuse[] = [
  { n: 1, ratingA: 8, loads: "Lighter, courtesy lights", modern: "Lighter removed (→ hazard switch); courtesy light kept on the constant bus." },
  { n: 2, ratingA: 8, loads: "Wipers, brake lights", modern: "Wipers relayed (ign bus); brake lights on the constant bus." },
  { n: 3, ratingA: 8, loads: "Turn signals, fan", modern: "Turn signals + heater fan relayed (ign bus)." },
  { n: 4, ratingA: 8, loads: "LR tail, L plate, RF parking, reverse", modern: "Position lamps on one switched fuse; reverse on the ign bus." },
  { n: 5, ratingA: 8, loads: "RR tail, R plate, LF parking", modern: "Folded into the single switched position fuse." },
  { n: 6, ratingA: 8, loads: "Gauges", modern: "Gauges + warning lamps on the ign bus." },
  { n: 7, ratingA: 8, loads: "L main beam", modern: "Relay-driven high beam (PDM)." },
  { n: 8, ratingA: 8, loads: "R main beam", modern: "Relay-driven high beam (PDM)." },
  { n: 9, ratingA: 8, loads: "L dipped beam", modern: "Relay-driven low beam (PDM)." },
  { n: 10, ratingA: 8, loads: "R dipped beam", modern: "Relay-driven low beam (PDM)." },
];

// ---------------------------------------------------------------------------
// Colour & gauge code (the factory used colour-coded wire; we use one colour +
// labels). Gauge conversion table is straight off the diagram.
// ---------------------------------------------------------------------------
export const factoryWireNote = "All wires 1.0 mm² unless noted; all fuses 8 A.";

export const factoryGaugeTable = [
  { mm2: 1.0, awg: 16 },
  { mm2: 1.5, awg: 14 },
  { mm2: 2.5, awg: 12 },
  { mm2: 4.0, awg: 10 },
];

export const factoryColours = [
  "Black",
  "Gray",
  "Gray/Black",
  "Green",
  "Green/Black",
  "Red",
  "Red/Black",
  "Blue",
  "Blue/Black",
  "Yellow",
  "Yellow/Black",
  "White",
  "White/Black",
  "Brown",
  "Violet",
  "Pink",
];

// ---------------------------------------------------------------------------
// Component inventory — what the factory diagram shows, and each item's fate.
// This is the data-backed version of the "nothing lost" audit.
// ---------------------------------------------------------------------------
export type ModernStatus = "preserved" | "modernized" | "removed" | "added";

export interface FactoryComponent {
  name: string;
  status: ModernStatus;
  modern: string;
}

export const factoryComponents: FactoryComponent[] = [
  // Lighting
  { name: "Headlights L/R (main + dip)", status: "modernized", modern: "Relay-driven from the PDM, ignition-gated, H4-capable." },
  { name: "Front parking lights L/R", status: "preserved", modern: "On the switched position circuit." },
  { name: "Front turn signals L/R", status: "modernized", modern: "Relay-driven; weak column switch carries coil current only." },
  { name: "Side Signal (side markers/repeaters) L/R", status: "preserved", modern: "Restored — flash with the indicators (EU repeater)." },
  { name: "Rear tail/brake L/R", status: "preserved", modern: "Tail switched off the light switch; brake on the constant bus." },
  { name: "Rear turn signals L/R", status: "modernized", modern: "Relay-driven." },
  { name: "Number-plate lights (×2)", status: "preserved", modern: "Both retained on the position circuit." },
  { name: "Reverse light + gearbox switch", status: "preserved", modern: "On the ignition bus." },
  // Signalling / horns
  { name: "Flasher unit", status: "modernized", modern: "Electronic, load-independent; feeds the turn-relay commons." },
  { name: "Horns ×2 + horn relay + button", status: "preserved", modern: "Relay retained; button grounds the coil." },
  { name: "Turn-signal column switch", status: "modernized", modern: "Triggers relay coils only." },
  // Instruments
  { name: "Fuel gauge + tank sender", status: "preserved", modern: "Ignition-fed gauge, sender signal back via the rear loom." },
  { name: "Coolant-temp gauge + sender", status: "preserved", modern: "Unchanged function." },
  { name: "Oil-pressure gauge + sender", status: "preserved", modern: "Unchanged function." },
  { name: "Oil-pressure warning switch", status: "preserved", modern: "Separate from the gauge sender, as per factory." },
  { name: "Speedometer", status: "preserved", modern: "Mechanical; illumination only electrically." },
  { name: "Tachometer", status: "preserved", modern: "Triggered from coil −." },
  { name: "Main-beam tell-tale (blue)", status: "preserved", modern: "From the high-beam feed." },
  { name: "Parking-lights tell-tale (green)", status: "preserved", modern: "Restored from the switched position feed." },
  { name: "Turn tell-tale", status: "preserved", modern: "Single lamp OR-fed from both sides via diodes." },
  { name: "Instrument lights + switch", status: "preserved", modern: "Switch fed from ignition (Run)." },
  // Comfort
  { name: "Wipers (2-speed self-park) + switch", status: "modernized", modern: "Bosch motor; switch triggers low/high relays; self-park via the low relay." },
  { name: "Washer switch/pump", status: "preserved", modern: "Own momentary push on the ignition bus." },
  { name: "Heater fan (blower) + switch", status: "modernized", modern: "Relay for full speed; optional resistor for low; switch carries coil current only." },
  { name: "Interior light + door switches ×2", status: "preserved", modern: "Door-triggered on the constant bus." },
  { name: "Cigar lighter", status: "removed", modern: "Removed — hazard switch fitted in its place." },
  // Engine / power
  { name: "Ignition coil", status: "preserved", modern: "Fed from the ignition bus via the main relay." },
  { name: "Distributor", status: "preserved", modern: "Unchanged (carburetted, points)." },
  { name: "Starter", status: "modernized", modern: "Starter relay added so the ignition switch only carries coil current." },
  { name: "Generator (dynamo)", status: "removed", modern: "Replaced by an internally-regulated alternator." },
  { name: "External voltage regulator", status: "removed", modern: "Gone — regulation is internal to the alternator." },
  { name: "Battery", status: "preserved", modern: "Now feeds the engine-bay distribution; main feeds need MIDI/MEGA fusing." },
  { name: "Fusebox (10 × 8 A)", status: "modernized", modern: "Littelfuse PDM + Bussmann RTMR blade-fuse/relay centres." },
  // Added (not in the factory diagram)
  { name: "Hazard flashers", status: "added", modern: "All-four flash via the turn relays; works key-off." },
  { name: "Electric fuel pump", status: "added", modern: "Relay-driven, ignition-switched (low-pressure carb pump)." },
  { name: "Ignition main relay", status: "added", modern: "Offloads the worn ignition switch; feeds the whole ignition bus." },
  { name: "Dedicated star grounds", status: "added", modern: "Engine-bay / dash / rear ground buses." },
  { name: "O2 sensor + AFR gauge", status: "added", modern: "Provisioned (ignition-fed, fused, capped) for the future." },
];

export const factoryArchitectureNotes = [
  "Negative-ground 12 V; DC dynamo + external regulator for charging.",
  "10 fuses, all 8 A; all wire 1.0 mm² unless noted — coarse by modern standards.",
  "Ignition switch is 3-position (Stop / Run / Start) — no accessory detent.",
  "Lights are independent of the ignition (light switch fed from the battery).",
  "Mechanical fuel pump (no electric pump in the factory car).",
  "Loads switched directly by their dash switches — almost no relays (only the horn).",
];
