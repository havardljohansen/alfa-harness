// =============================================================================
// Modern wiring-harness data model — Alfa Romeo Giulia GT 1300 Junior (10530)
// -----------------------------------------------------------------------------
// Single source of truth. The web app, the WireViz export, the BOM and the
// printable build sheets are all derived from the structures defined here.
//
// Design intent (see /docs/design-notes.md):
//   * Reliability refresh — relay-heavy, modern fusing, alternator conversion.
//   * One wire colour + Dymo heat-shrink labels  -> every wire has a short
//     `label` printed at both ends.
//   * DIN 72552 terminal designations throughout (period-correct; the factory
//     diagram already uses 15/30/31/50/53/54/56/58/61/85/86/87…).
// =============================================================================

// ---------------------------------------------------------------------------
// Physical zones — used to route wires and deduce cut lengths.
// ---------------------------------------------------------------------------
export type ZoneId =
  | "battery" // battery / main junction (LH front in this car)
  | "engine-front" // front of engine bay: lights, horns, fan, PDM, fuse blocks
  | "engine-rear" // bulkhead side of engine bay: coil, alt, starter, senders
  | "dash" // behind the dashboard: gauges, switches, ign switch, fuse feed
  | "cabin" // footwells / doors / interior light
  | "rear"; // boot: tail/brake/turn, plate light, fuel pump/tank

export interface Zone {
  id: ZoneId;
  name: string;
  description: string;
}

/** A routed leg of the harness between two adjacent zones, with the
 *  approximate run length (mm) the wire actually travels along the loom.
 *  Editable — refine with a tape measure on the real car. */
export interface ZoneLink {
  from: ZoneId;
  to: ZoneId;
  routeMm: number;
  /** What to physically tape-measure in the car for this leg (the checklist). */
  measure?: string;
}

// ---------------------------------------------------------------------------
// Sources / electrical role of a feed.
// ---------------------------------------------------------------------------
export type Source =
  | "battery" // constant +12V (hot at all times)
  | "ign-run" // +12V in RUN (and START) — DIN 15
  | "ign-start" // +12V only while cranking — DIN 50
  | "ign-pos1" // +12V from first key detent (lights enable / accessory)
  | "relay-out" // switched output of a relay (DIN 87 / 87a)
  | "bus" // a fuse-block input bus
  | "switched" // downstream of a manual switch
  | "sensor" // a sender/sensor signal
  | "ground"; // DIN 31

// ---------------------------------------------------------------------------
// Components / nodes.
// ---------------------------------------------------------------------------
export type ComponentKind =
  | "battery"
  | "alternator"
  | "distribution" // PDM / power-distribution module
  | "fuse-block" // Bussmann RTMR
  | "relay"
  | "switch"
  | "ignition-switch"
  | "flasher" // turn/hazard flasher unit
  | "lamp"
  | "gauge"
  | "warning-light"
  | "sender" // temp / oil / fuel sender
  | "sensor" // O2 etc.
  | "motor" // wiper motor
  | "pump" // electric fuel pump
  | "horn"
  | "coil" // ignition coil
  | "ground"
  | "socket" // cigar lighter / aux
  | "audio" // stereo / amplifier head unit
  | "diode" // signal-path isolation / suppression diode
  | "resistor" // fan-speed dropping resistor / PWM module
  | "connector"; // inline bulkhead connector

export interface Terminal {
  id: string; // unique within the component, e.g. "30", "87", "53a", "B+"
  din?: string; // DIN 72552 designation if applicable
  label: string; // human label, e.g. "Common / battery feed"
}

export interface DeviceComponent {
  id: string;
  name: string;
  kind: ComponentKind;
  zone: ZoneId;
  terminals: Terminal[];
  /** Reference into the parts inventory (mfg part number) if this is a
   *  physical item the user already owns or needs to buy. */
  partRef?: string;
  /** Provisioned for the future (e.g. O2). Rendered greyed-out. */
  future?: boolean;
  note?: string;
}

/** A manual switch position and which terminal pairs it closes. */
export interface SwitchPosition {
  name: string;
  closes: Array<[string, string]>; // pairs of terminal ids bridged in this position
  note?: string;
}

export interface SwitchComponent extends DeviceComponent {
  kind: "switch" | "ignition-switch";
  positions: SwitchPosition[];
}

// ---------------------------------------------------------------------------
// Relays.
// ---------------------------------------------------------------------------
export type RelayType = "SPST" | "SPDT"; // 4-pin / 5-pin ISO-280

export interface RelayAssignment {
  id: string;
  name: string;
  type: RelayType;
  fn: string; // what it does
  mountedIn: string; // fuse-block / PDM component id it plugs into
  partRef: string; // Song Chuan part number
  /** What energises the coil (DIN 86) and the label of that trigger wire. */
  coilFrom: Source;
  coilTriggerLabel: string;
  /** What feeds the common (DIN 30). */
  commonFrom: Source;
  /** Loads on the normally-open (87) and, for SPDT, normally-closed (87a). */
  out87: string;
  out87a?: string;
  /** Provisioned for a deferred/future load — occupies a physical slot but
   *  isn't counted against owned stock yet (e.g. the deferred washer pump). */
  future?: boolean;
  note?: string;
}

// ---------------------------------------------------------------------------
// Fuse blocks & fuses.
// ---------------------------------------------------------------------------
export interface FuseBlock {
  id: string;
  name: string;
  model: string; // e.g. "Bussmann RTMR 15306-2-2-4"
  partRef: string;
  bussed: boolean; // common input stud feeds all positions
  zone: ZoneId;
  fuseWays: number;
  relayWays: number;
  /** How many columns to draw the fuse / relay positions in (physical layout). */
  grid: { fuseCols: number; relayCols: number };
  note?: string;
}

export interface Fuse {
  id: string;
  block: string; // FuseBlock id
  position: number;
  ratingA: number; // 0 = reserved / spare
  name: string;
  circuit: string; // Circuit id
  source: Source;
  feeds: string; // human description of the load(s)
  future?: boolean;
}

// ---------------------------------------------------------------------------
// Bulkhead / inline connectors (the "unplug the dashboard" plugs).
// ---------------------------------------------------------------------------
export interface ConnectorPin {
  pin: number;
  wireLabel: string; // which wire passes through this pin
  signal: string;
  reserved?: boolean;
  /** Wire insulation colour (`"Red"`, `"Yellow/Black"` etc.). Carried through
   *  from Wire.color so the pin layout can render colour-coded cell borders. */
  color?: string;
}

export interface ConnectorGroup {
  id: string;
  name: string;
  ways: number;
  partRefMale: string;
  partRefFemale: string;
  zoneA: ZoneId;
  zoneB: ZoneId;
  purpose: string;
  pins: ConnectorPin[];
  /** "gt280" = the big 12-way bulkhead pairs; "cluster" = a smaller low-current connector. */
  family?: "gt280" | "cluster";
}

// ---------------------------------------------------------------------------
// Wires.
// ---------------------------------------------------------------------------
/** Functional class -> drives the recommended gauge. */
export type GaugeClass = "signal" | "low" | "medium" | "high" | "feed" | "main";

export interface GaugeSpec {
  class: GaugeClass;
  mm2: number;
  awg: number;
  ampacity: number; // conservative continuous A for short automotive runs
  use: string;
}

/** Consolidated purchase tier — keeps the number of wire sizes you actually
 *  buy small, even though each wire has an ideal gauge. */
export interface WireTier {
  id: string;
  label: string;
  mm2: number;
  awg: number;
  note: string;
}

export interface WireEnd {
  component: string; // DeviceComponent id
  terminal: string; // Terminal id on that component
  terminalPart?: string; // crimp terminal part (mfg pn) if specified
}

export interface Wire {
  id: string;
  label: string; // Dymo heat-shrink print (short, both ends)
  name: string; // human-readable purpose
  circuit: string;
  from: WireEnd;
  to: WireEnd;
  gaugeClass: GaugeClass;
  /** Zones the wire passes through, in order. Drives length deduction. */
  route: ZoneId[];
  /** Extra slack added at the ends for routing/service (mm). */
  slackMm?: number;
  /** Inline connector ids this wire passes through. */
  via?: string[];
  future?: boolean;
  complianceRef?: string; // ComplianceNote id
  /** Inline signal diode id(s) carried by this wire (see diodes.ts). */
  diodes?: string[];
  /** Explicit module ownership override. Default: a wire belongs to whichever
   *  module(s) its endpoint components live in (see `modulesForWire`). Set this
   *  ONLY for wires that physically cross modules but build/source with one
   *  side's harness — e.g. the heavy battery-to-alternator and battery-to-
   *  starter stud cables, which terminate at the battery (main-loom) but are
   *  bench-built with the engine pigtail and removed together with the engine.
   *  Visualizations hide explicitly-owned wires from other modules' views. */
  module?: string;
  /** Wire insulation colour. Solid = "Red", "Yellow", … Two-tone (base/stripe)
   *  = "Yellow/Black", "Blue/Black", … Factory-derived for the wires that have
   *  a clear 1969 equivalent; new colours for modern-only circuits. See
   *  `wire-colors.ts` for the palette and hex resolution. */
  color?: string;
  note?: string;
}

// ---------------------------------------------------------------------------
// Signal diodes — kept on coil/signal wires (milliamp level), never in a load
// path, per the build history.
// ---------------------------------------------------------------------------
export interface Diode {
  id: string;
  name: string;
  purpose: string;
  /** Wire id the diode is associated with. */
  onWire: string;
  /** true = in SERIES with the wire (blocks reverse current — isolation /
   *  OR-ing). false/undefined = PARALLEL across a relay coil (flyback
   *  suppression) — does not affect signal flow. */
  inline?: boolean;
  /** For inline diodes: anode at the wire's `from` end unless `reversed`. */
  reversed?: boolean;
  /** Approximate current it must pass (A) — confirms it stays a signal diode. */
  currentA: number;
  suggestion?: string; // e.g. "1N4007" / "Schottky" / "relay-coil flyback"
}

/** A wire with all derived fields resolved (gauge, length, band). */
export interface ResolvedWire extends Wire {
  mm2: number; // ideal gauge for this wire
  awg: number;
  ampacity: number;
  tierId: string; // consolidated purchase tier
  recMm2: number; // gauge you actually buy/cut (tier)
  recAwg: number;
  lengthMm: number;
  lengthBandId: string;
}

// ---------------------------------------------------------------------------
// Circuits (logical grouping).
// ---------------------------------------------------------------------------
export type CircuitGroup =
  | "power" // battery, distribution, grounds
  | "charging"
  | "starting"
  | "ignition"
  | "headlights"
  | "exterior-lights"
  | "signals" // turn / hazard / brake / reverse
  | "instruments"
  | "wipers"
  | "cooling"
  | "fuel"
  | "comfort" // interior, lighter, horn
  | "future";

export type CircuitStatus = "core" | "upgrade" | "future";

export interface Circuit {
  id: string;
  name: string;
  group: CircuitGroup;
  description: string;
  status: CircuitStatus;
  /** Original factory fuse number(s) this maps from, if any. */
  originalFuse?: string;
  compliance?: string[]; // ComplianceNote ids
}

// ---------------------------------------------------------------------------
// Compliance (EU / Norway veteran vehicle).
// ---------------------------------------------------------------------------
export type ComplianceSeverity = "info" | "caution" | "check";

export interface ComplianceNote {
  id: string;
  severity: ComplianceSeverity;
  topic: string;
  text: string;
  ref: string; // regulation / source pointer
}

// ---------------------------------------------------------------------------
// Parts.
// ---------------------------------------------------------------------------
export type PartCategory =
  | "distribution"
  | "relay"
  | "connector-housing"
  | "terminal"
  | "seal"
  | "lock"
  | "spade"
  | "wire"
  | "fuse"
  | "charging"
  | "consumable"
  | "component"
  | "tool";

export interface PartItem {
  mfgPn: string;
  mouserPn?: string;
  desc: string;
  category: PartCategory;
  qtyOwned: number; // from the Mouser orders
  unitPrice?: number;
  currency?: "USD" | "NOK";
  order?: string; // invoice number
  role: string; // how it is used in this harness
}

export interface BomGap {
  id: string;
  item: string;
  qty: string;
  category: PartCategory;
  reason: string;
  suggestion?: string;
}

// ---------------------------------------------------------------------------
// Length bands (batch wire-cutting).
// ---------------------------------------------------------------------------
export interface LengthBand {
  id: string;
  label: string;
  minMm: number;
  maxMm: number;
  cutMm: number; // recommended cut length for everything in this band
}
