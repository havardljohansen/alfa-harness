// =============================================================================
// DETACHABLE MODULES — the harness is built as separable sub-assemblies that
// plug together at the bulkhead connectors. Each can be built on the bench and
// dropped in / pulled out as a unit. This drives the per-module build sheets.
// =============================================================================

export interface HarnessModule {
  id: string;
  name: string;
  summary: string;
  /**
   * The model component IDs this module owns — the pinpoint map. Every node in
   * the model belongs to exactly one module (asserted in harness.test.ts), so a
   * change to a wire/component resolves to the module sheet(s) that must be
   * revised. See `modulesForComponents` / `staleModuleSheets`.
   */
  componentIds: string[];
  /** Core components/centres that live in this module. */
  contains: string[];
  /** How it joins the rest of the car — the connectors, power feeds, grounds. */
  interfaces: string[];
  /** Its ground block (or how it grounds). */
  ground: string;
  /** Parts to have on the bench to build this module. */
  parts: string[];
  /** Build steps for this module specifically. */
  steps: string[];
}

export const harnessModules: HarnessModule[] = [
  {
    id: "main-loom",
    name: "Main loom (engine-bay hub)",
    summary:
      "The trunk everything else plugs into: the two bussed RTMRs (constant + ignition bus) and every relay, plus the two PWM modules and the engine-mounted devices fed directly from the bus. The RTMR hub mounts on the LEFT side of the engine bay (looking forward through the windscreen) — so the firewall plugs land on the left.",
    componentIds: [
      "rtmr-ign", "rtmr-const", "battery", "flasher", "em1", "fc",
      "wiper", "washer-pump", "instr-pwm",
      "sw-brake", "sw-brake-2", "sw-brake-diff", "sw-reverse", "o2-sensor",
      "rly-horn", "rly-fan", "rly-fuel", "rly-ignmain", "rly-turnL", "rly-turnR",
      "rly-wlow", "rly-whigh", "rly-starter", "rly-washer", "gnd-eng",
    ],
    contains: [
      "RTMR constant bus + RTMR ignition bus",
      "Relays: ignition-main, starter, fuel, horn, turn L/R, wiper low/high, heater-fan gate, washer (future, external)",
      "Instrument-light PWM dimmer (loom-side)",
      "fc 4-pin Metri-Pack 280 boundary connector to the fan-adapter module",
      "Loom-side devices (engine-mounted devices are in the engine-nord module, plugged in via EM1; the heater blower lives in the fan-adapter module, plugged in via fc)",
    ],
    interfaces: [
      "BH1 + BH2 → dashboard module",
      "BH3 → rear/boot module",
      "BH4 → front-clip module",
      "SW3 → 3-way switch cluster",
      "Battery + (via MIDI/MEGA) → constant-bus stud; ignition-main relay feeds the ignition-bus stud",
      "Hub ground block (battery − + engine strap)",
    ],
    ground: "Engine-bay HUB block (gnd-eng) — battery − and engine strap land here; the other modules' trunks return to it.",
    parts: [
      "Bussmann RTMR ×2 (bussed)",
      "ISO-280 relays ×11 in use (6 SPST + 5 SPDT) — future washer SPST goes EXTERNAL next to the RTMR (flasher took rtmr-const cavity 5)",
      "Bussmann NO-762-LED ISO-280 electronic flasher in rtmr-const cavity 5 (drop-in for an ISO-280 relay)",
      "MINI/ATM fuses (assorted) + spares",
      "Instrument PWM dimmer module (heater fan is now its own pluggable adapter module — see fan-adapter)",
      "2× 1N4007 diodes inline near rly-fan socket for the gate diode-OR",
      "MIDI/MEGA holders for the bus feeds",
      "Metri-Pack 280 terminals/seals; 16 mm² hub cable",
    ],
    steps: [
      "Mount the two RTMRs and set the hub ground block; bond battery − and the engine block to the hub.",
      "Run the fused battery feed to the constant-bus stud; wire the ignition-main relay so it feeds the ignition-bus stud.",
      "Terminate the bus outputs and relay-coil triggers into the BH1/BH2/BH3/BH4/SW3 connector halves on the loom side.",
      "Plug in the 11 relays and the MINI fuses to the ratings on the Fuses page.",
      "Mount the two PWM modules loom-side (by the firewall) and land the switch-cluster select lines + the dimmer output toward the dash.",
    ],
  },
  {
    id: "front-clip",
    name: "Front-clip module",
    summary:
      "Everything ahead of the firewall as one pull-out unit: the headlight PDM + beam relays, the headlights, front position lamps, front turn signals + side repeaters, and the horns.",
    componentIds: [
      "pdm", "rly-low", "rly-high", "hl-L", "hl-R", "park-fl", "park-fr",
      "turn-fl", "turn-fr", "side-l", "side-r", "horn-hi", "horn-lo", "gnd-front",
    ],
    contains: [
      "Littelfuse PDM + low/high beam relays",
      "Headlights L/R (H4)",
      "Front parking lamps L/R",
      "Front turn signals L/R + side repeaters L/R",
      "Twin horns",
    ],
    interfaces: [
      "BH4 — the one signal plug (7 pins): beam-relay triggers ×2 + main-beam tell-tale, ONE front-position feed, front turn outputs ×2, horn output. The side repeaters jumper off the front indicators and the RH parking lamp jumpers off the LH — no separate BH4 pins (piggyback).",
      "Battery + → PDM input — a separate heavy ring/MIDI-fused cable (not through BH4)",
      "Front-clip ground trunk → battery hub — a separate heavy cable",
    ],
    ground: "Front-clip ground block (gnd-front) — all front lamps/horns land here; one thick trunk back to the hub.",
    parts: [
      "Littelfuse PDM + 2 beam relays + 4 MINI fuses",
      "GT 280 12-way pair (BH4) — or a 24-way if consolidating",
      "Front-clip ground block + 6 mm² trunk",
      "Heavy PDM feed cable + MIDI fuse",
      "Metri-Pack 280 terminals/seals; H4 sockets, lamp connectors",
    ],
    steps: [
      "Mount the PDM at the front; plug in the two beam relays and the four beam fuses.",
      "Build the front-lamp bundle: PDM beam outputs → headlights; ONE position feed (jumper L→R at the lamp); front turn feeds with the side repeaters jumpered off them; horn feed.",
      "Land every front ground on the front-clip block; run its thick trunk back toward the hub.",
      "Terminate all the cross-firewall wires into the BH4 connector half; run the PDM battery feed as its own fused cable.",
      "Bench-test: with BH4 mated and the feed live, confirm low/high/flash, position, indicators + repeaters, and horns.",
    ],
  },
  {
    id: "dashboard",
    name: "Dashboard module",
    summary:
      "The whole dash pulls out behind two plugs: instruments, tell-tales, the column/dash switches, the ignition switch and the interior-light feed.",
    componentIds: [
      "ign-switch", "sw-headlight", "sw-flash", "sw-turn", "sw-hazard", "sw-horn",
      "sw-washer", "sw-door-l", "sw-door-r", "g-fuel", "g-temp", "g-oil", "g-speedo",
      "g-tach", "g-afr", "wl-oil", "wl-charge", "wl-brake", "wl-main", "wl-turn",
      "int-light", "usb-charge", "stereo", "gnd-dash",
    ],
    contains: [
      "Ignition switch",
      "Headlight switch (period 4-pin: dash knob OFF/PARK/HEADLIGHTS + dash lever UP=dipped/DOWN=main)",
      "Column lever — turn signals (sw-turn) AND flash-to-pass (sw-flash) on the same physical lever, separate electrical contacts",
      "Hazard switch (in old cigar-lighter location), horn button",
      "Washer push button (drives the electric washer pump — pump install deferred)",
      "Gauges (fuel, temp, oil, speedo, tach) + tell-tales (oil, charge, main-beam, turn)",
      "Headlight switch is on the CONSTANT bus (period-correct) — HIGH beams + PARK override work key-off; LOW is gated downstream at the relay common (rly-low.30 from ign-bus f-ign-6)",
      "Position/tail lamps: auto-on with ignition via f-ign-10 (running lights) OR'd with the PARK detent override at the lamp node (key-off compliance for trafikkreglene § 17)",
      "USB-C fast-charge port + Bluetooth-amp stereo on one ignition-switched accessory feed",
      "Interior light feed",
    ],
    interfaces: [
      "BH1 — power & instruments (ignition + constant feeds, sender signals, dash power, dimmer output in, HL switch constant input, flash constant input)",
      "BH2 — lighting & signal triggers (beam/turn/horn low-current lines, flash output)",
      "Dash ground block → hub (the BH1 ground trunk)",
    ],
    ground: "Dash ground block (gnd-dash) — gauges/tell-tales/switches; one thick trunk to the hub through BH1.",
    parts: [
      "GT 280 12-way pairs ×2 each for BH1 + BH2 (4 plugs today) — or one 24-way per bulkhead",
      "Dash ground block + trunk",
      "187/250 spade terminals for gauges/switches",
      "Signal diodes ×4 (turn tell-tale OR-ing ×2, hazard isolation ×2 — 1N4007 or 1N4148) + 2 Schottky for park-light ign-feed OR-isolation (d-park-ign-iso front + rear, 1N5822 or SB540)",
      "Period-correct washer push button (low-current trigger; pump install deferred)",
    ],
    steps: [
      "BEFORE you wire the dash switch: verify the period 4-pin assembly geometry (knob notch count + lever direction + whether knob has a 'press in' flash) against the physical switch in your hand. See task #17 and PHYSICAL-TODO.md — the model commits to a specific interpretation that needs empirical confirmation, and the wrong interpretation means re-wiring the dash.",
      "Build the cluster harness on the bench: gauge feeds, sender signals, tell-tales (warning-lamp feed jumpers daisy-chain g-fuel.+ → wl-oil.+ → wl-charge.+ at the dash), illumination output from the dimmer.",
      "Wire the headlight switch as a 4-pin period dash assembly: terminal 30 = constant feed in (from f-con-5 via BH1), terminal 58 = PARK output (carries actual parking-lamp current ~2 A continuous when engaged), terminal 56b = LOW relay coil trigger (~0.15 A), terminal 56a = HIGH relay coil trigger. The PARK leg is the only one carrying real current; the beam legs carry coil current only.",
      "Wire the column lever as two separate electrical sub-switches sharing one physical body: sw-turn (turn signals to flasher → relay coils) and sw-flash (constant feed via f-con-5 → high-beam relay coil for flash-to-pass).",
      "Wire all OTHER switches as low-current only — they trigger relay coils / select lines, never carry loads (washer button → rly-washer in the engine bay, etc.).",
      "Land all dash grounds on the dash block; route its trunk to BH1.",
      "Terminate into the BH1 + BH2 connector halves; fit the isolation diodes on the signal side. The two Schottky park-iso diodes live engine-side (at the rtmr-ign output) so they don't take dash-side space.",
      "Bench-test against the dash plugs before refitting the dash. Step through the truth table: key off / on × dash off / park / low / high × flash off / on (24 states total, see harness.test.ts).",
    ],
  },
  {
    id: "rear-boot",
    name: "Rear / boot module",
    summary:
      "The tail of the car on one plug: rear tail/brake/turn lamps, plate lights, reverse lamp, the electric fuel pump and the tank sender.",
    componentIds: [
      "tail-rl", "tail-rr", "turn-rl", "turn-rr", "plate", "plate-r", "reverse",
      "fuel-pump", "snd-fuel", "gnd-rear",
    ],
    contains: [
      "Rear tail/brake lamps L/R + rear turn signals L/R",
      "Number-plate lights ×2",
      "Reverse lamp",
      "Electric fuel pump",
      "Fuel-tank sender",
    ],
    interfaces: [
      "BH3 — rear loom: ignition running-light tail (on with the key), brake (constant, key-off), rear turn L/R, reverse, fuel-pump feed, tank-sender signal",
      "Rear ground trunk → battery hub — direct, NOT daisy-chained through the dash",
    ],
    ground: "Rear/boot ground block (gnd-rear) — all rear lamps + pump; one thick trunk straight to the hub.",
    parts: [
      "GT 280 12-way pair (BH3)",
      "Rear ground block + 6 mm² trunk (full-length run)",
      "Lamp connectors; fuel-pump connector",
      "Metri-Pack 280 terminals/seals",
    ],
    steps: [
      "Build the rear bundle: tail/turn to each cluster, plate lights, reverse, fuel-pump feed, tank-sender signal. The brake feed and the position feed each jumper L→R at the rear — one wire apiece through BH3.",
      "Land every rear ground on the boot block; run its thick trunk the length of the car to the hub.",
      "Terminate into the BH3 connector half.",
      "Bench-test: position/brake/indicators per side, reverse, plate lights, and the pump runs on its feed.",
    ],
  },
  {
    id: "engine-nord",
    name: "Engine module — OPTION A: original 1300 Nord (today's build)",
    summary:
      "Everything physically on the original Nord engine, behind the EM1 connector. Detaches with the engine as one assembly. Today's active configuration.",
    componentIds: [
      "coil", "dist", "alternator", "starter", "snd-temp", "snd-oil", "sw-oillight",
    ],
    contains: [
      "Ignition coil (single, distributor-fed) + distributor with mechanical advance",
      "Generator-era alternator with built-in voltage regulator (B+, D+, ground)",
      "Starter motor with integral solenoid (B+ stud, DIN 50 trigger)",
      "Coolant-temperature sender (1-wire, screws into the head)",
      "Oil-pressure sender (gauge feed, modern add)",
      "Oil-pressure switch (warning lamp, factory-original)",
      "Future O2 sensor location — currently capped at the connector",
    ],
    interfaces: [
      "EM1 — single 12-way Metri-Pack 280 connector to the chassis loom. 8 active pins: ignition +12V, ground, tach, temp signal+gnd, oil signal, oil warning, alt D+, starter solenoid trigger.",
      "Direct stud-mount heavy cables (NOT via EM1): battery + → starter B+; alternator B+ → battery; alternator case → engine block ground bond",
    ],
    ground: "Local engine-block grounds (coil mount, sender threads, alternator case); the heavy engine-block-to-chassis strap bonds to gnd-eng in the main loom.",
    parts: [
      "Original Nord coil (+ amplifier if Bosch CDI; bare coil otherwise) + distributor with mechanical advance + plug leads (4 cylinders)",
      "Modern alternator (Bosch-pattern, 55-65 A) replacing the original generator",
      "Modern starter motor (Bosch-pattern, gear-reduction preferred for hot starting)",
      "Temperature sender (period thread, period curve to match the gauge)",
      "Oil-pressure sender (1-wire, modern add for the gauge)",
      "Oil-pressure switch (period, 1-wire, factory-style)",
      "12-way Metri-Pack 280 male/female pair for EM1 (engine side mates with chassis side)",
      "~30 cm engine-side pigtails per active EM1 pin (8 wires)",
    ],
    steps: [
      "Bench-build the engine-side pigtail bundle: 8 wires from the EM1 male connector half terminating at the coil + senders + alternator D+ + starter solenoid trigger. Wire gauges per the EM1 pin map (high for ignition + ground + starter; signal for the rest).",
      "Install the bundle on the engine with appropriate clipping/anti-vibration; route to where EM1 will mate on the firewall bracket.",
      "Land the 2 heavy cables (alt B+, starter B+) and the engine ground strap directly to their stud terminations — NOT through EM1.",
      "With engine in: mate EM1, bolt heavy cables, bolt ground strap. Bench-test: charge lamp on at key-on, engine cranks, tach reads, gauges respond.",
    ],
  },
  {
    id: "engine-155ts",
    name: "Engine module — OPTION B: 155 Twin Spark on carbs (future swap)",
    summary:
      "Documented-only — the future replacement engine and its Alfaholics 3D Mapped Ignition Kit (Emerald K6+). The kit ships with its own pre-fitted loom; our chassis harness needs zero modification at swap day, just plug the kit loom into the existing EM1 and bump f-ign-1's blade from 10 A to 20 A. See ARCHITECTURE.md for the full design.",
    componentIds: [
      "k6plus-ecu", "k6plus-amp-1", "k6plus-amp-2", "k6plus-coil-1", "k6plus-coil-2",
      "k6plus-cps", "k6plus-tps",
      "snd-temp-155", "snd-oil-155", "sw-oillight-155",
      "alternator-155", "starter-155",
    ],
    contains: [
      "Alfaholics 3D Mapped Ignition Kit (Emerald K6+ ECU + 2 coil packs + 2 ignition amplifiers + crank position sensor + throttle position sensor + pre-fitted universal kit loom + programming kit)",
      "Alfa Romeo 155 Twin Spark 2.0 engine block with carburetors (Webers or Dellortos)",
      "All sensors and coils live BEHIND EM1 — the chassis loom doesn't see them individually",
    ],
    interfaces: [
      "EM1 — same 12-way connector used by engine-nord; the kit loom terminates in the mating half. 8 pins active at swap (same purposes as engine-nord); pins 10-12 optionally lit up for ECU fan control / CTS pass-through / spare.",
      "Same 2 direct stud-mount heavy cables (alt B+, starter B+) — unchanged from engine-nord. Same engine-block ground strap.",
      "f-ign-1 blade bumped from 10 A → 20 A in the rtmr-ign block (same slot, blade swap only).",
    ],
    ground: "All ECU + amp + coil grounds returned through EM1 pin 2 to gnd-eng. No new ground architecture required.",
    parts: [
      "Alfaholics 3D Mapped Ignition Kit — Twin Spark variant (single SKU includes everything engine-side)",
      "12-way Metri-Pack 280 female-half (mates with engine-nord's male-half; carry-over from chassis loom)",
      "20 A MINI blade fuse to replace the 10 A in f-ign-1 at swap day",
      "PENDING VERIFICATION (see PHYSICAL-TODO.md task #17 + the K6+ section): confirm the kit's ECU is actually an Emerald K6+, confirm the amplifier + coil pack part numbers, confirm the 155 TS sensor connector compatibility with our EM1 pinout (may need adapter pigtails inside the kit loom).",
    ],
    steps: [
      "BEFORE physical swap: read ARCHITECTURE.md sections 6-10 to understand the swap-day sequence and pending verifications.",
      "Pre-install the Alfaholics kit on the 155 TS engine on the bench: ECU mounted, kit loom routed, coil packs + amps installed, CPS + TPS fitted, plug leads to 8 plugs. Verify the kit loom terminates at the EM1 mating connector with the correct pinout.",
      "Pull the old Nord engine: unplug EM1, unbolt the 2 heavy cables, unbolt the engine ground strap, hoist out.",
      "Drop in the 155 TS with kit fitted: lower, mount, plug EM1, bolt 2 heavy cables, bolt ground strap.",
      "Swap f-ign-1's blade fuse: 10 A → 20 A in the rtmr-ign block (same slot).",
      "OPTIONAL: if using ECU fan control, add a chassis-side jumper from EM1 pin 10 to rly-fan.86 (diode-OR'd with existing sw-heaterfan trigger).",
      "Power on: ECU LED boots, tach reads on cranking, spark on all 8 plugs, engine starts on the Alfaholics base map.",
      "Document the swap in the car's service log (manufacturer + map ID per veteran-vehicle compliance — see compliance notes).",
    ],
  },
  {
    id: "fan-adapter",
    name: "Fan adapter module (3-wire heater fan)",
    summary:
      "Detachable sub-harness behind the fc 4-pin connector that adapts the chassis loom's universal 4-pin (12V / GND / HIGH-sig / LOW-sig) to whichever fan is fitted. Today: 3-wire fan (GND + HIGH winding + LOW winding) with a single SPDT relay doing speed select. Swap-in compatible with: a 2-wire fan (use pins 1+2 only, cap 3+4), or a future 4-wire smart fan (pass all 4 through to the fan's matching connector).",
    componentIds: ["heater-fan", "rly-fa"],
    contains: [
      "3-wire 2-speed heater blower motor (GND + HIGH winding ~15 A + LOW winding ~10 A)",
      "Single SPDT speed-select relay (rly-fa) — NC defaults to LOW winding, NO routes to HIGH winding when fc pin 3 (HIGH signal) is hot",
      "fc female half + adapter-side pigtails (~150 mm)",
      "Small sealed box / heat-shrink bundle clipped near the heater housing",
    ],
    interfaces: [
      "fc — 4-pin Metri-Pack 280 to the chassis loom. Pin 1 = gated 12V (high current), pin 2 = ground (motor return + coil ground), pin 3 = HIGH signal (drives SPDT coil), pin 4 = LOW signal (unused in this variant — capped or absent on the adapter side)",
    ],
    ground: "All adapter ground returns (motor + SPDT coil) tie at fc pin 2 inside the adapter, going back through one heavy ground wire to gnd-eng in the main loom.",
    parts: [
      "Song Chuan 301-1C-S-R1 SPDT relay (same as the rest of the harness; spare from prior orders) + 5-pin ISO-280 relay socket with crimp pins",
      "fc connector — sealed 4-way Metri-Pack 280 (Aptiv) — PN PHYSICAL-TODO; needs MP 280 / GT 280-family pin terminals + cable seals for the ~15 A pin 1",
      "~150 mm of HIGH-gauge wire (motor leads + relay common) and signal-gauge wire (coil trigger + ground)",
      "Small sealed enclosure or large heat-shrink bundle for weatherproofing near the heater box",
    ],
    steps: [
      "Bench-build the adapter on a small board or in a sealed box: mount the SPDT in its socket, run pigtails to the fc female half on one side and to the fan motor's HIGH / LOW / GND leads on the other.",
      "Wire SPDT pin 30 ← fc pin 1; pin 86 ← fc pin 3; pin 85 → fc pin 2 (coil ground); pin 87 → fan HIGH; pin 87a → fan LOW; fan GND → fc pin 2.",
      "Install: clip the adapter near the heater housing so it's accessible without removing the heater. Connect fc and route the pigtails to the fan body.",
      "Bench-test: with 12V on fc pin 1, GND on pin 2, signal on pin 3 should pull the SPDT and route 12V to the HIGH wire; signal removed reverts to LOW. Both windings cold when fc pin 1 is dead (OFF).",
      "FOR A 2-WIRE FAN SWAP: build a simpler variant skipping the SPDT — connect fc pin 1 directly to the fan's +12V wire and fc pin 2 to the fan's ground wire. Pins 3 + 4 stay capped on the adapter side. Dash switch LOW and HIGH both run the fan at full single speed.",
      "FOR A 4-WIRE SMART FAN SWAP: build a pass-through variant carrying all four fc pins straight to the smart fan's matching 4-pin connector. The smart fan's internal controller interprets the signals.",
    ],
  },
  {
    id: "switch-cluster",
    name: "3-way switch cluster (firewall)",
    summary:
      "The three vintage 3-way switches (wipers / instrument-lights / heater-fan) as a small detachable cluster at the firewall — pure low-current signal back to the main loom.",
    componentIds: ["sw-wiper", "sw-instr", "sw-heaterfan"],
    contains: ["Wiper switch", "Instrument-light switch", "Heater-fan switch"],
    interfaces: [
      "SW3 — one connector: a single piggybacked signal+ feed in, plus six low-current outputs (wiper low/high, dimmer dim/bright, fan high + low-enable)",
      "No ground (the switches are pass-through; not illuminated)",
    ],
    ground: "None — the switches only pass the +supply to relay coils / PWM select lines, which ground themselves.",
    parts: [
      "Small 9–12-way connector (low-current — needn't be a 12-way GT 280)",
      "Two short jumper leads for the piggyback feed",
      "187 spade terminals for the switch tags",
    ],
    steps: [
      "Bring one fused signal+ feed into the cluster; jumper it across all three switch commons (piggyback).",
      "Run the six outputs out: wiper LOW/HIGH, dimmer DIM/BRIGHT, fan HIGH + fan LOW-enable.",
      "Terminate the seven wires into the SW3 connector half — no ground pin needed.",
      "Bench-test: each switch position pulls the right select line / coil; nothing carries load current.",
    ],
  },
];

// ---------------------------------------------------------------------------
// REVISION RULE (enforced in part by harness.test.ts):
// Whenever the harness model changes, the build sheet of the AFFECTED MODULE(S)
// must be revised — not the whole set. Use the helpers below to resolve which
// module(s) a changed component or wire touches, and update only those.
//
//   • Every model node belongs to exactly one module (the test fails if a new
//     component is added without assigning it here — that failure IS the
//     reminder to write/revise that module's sheet).
//   • A wire change → look up both endpoints' modules; if it crosses a bulkhead
//     it touches two module sheets (e.g. a BH4 wire = main-loom + front-clip).
// ---------------------------------------------------------------------------

/** The bulkhead/cluster connector(s) each module plugs through — its boundary
 *  in a per-module diagram (wires to other modules terminate here). */
export const moduleConnectors: Record<string, string[]> = {
  "main-loom": ["bh1", "bh2", "bh3", "bh4", "sw3", "em1", "fc"],
  "front-clip": ["bh4"],
  dashboard: ["bh1", "bh2"],
  "rear-boot": ["bh3"],
  "switch-cluster": ["sw3"],
  "engine-nord": ["em1"],
  "engine-155ts": ["em1"],
  "fan-adapter": ["fc"],
};

const componentToModule: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const mod of harnessModules) for (const c of mod.componentIds) m.set(c, mod.id);
  return m;
})();

/** The module a given component id belongs to (or undefined if unassigned). */
export function moduleOf(componentId: string): string | undefined {
  return componentToModule.get(componentId);
}

/** Distinct modules touched by a set of component ids (e.g. a wire's endpoints). */
export function modulesForComponents(componentIds: string[]): string[] {
  const set = new Set<string>();
  for (const id of componentIds) {
    const mod = componentToModule.get(id);
    if (mod) set.add(mod);
  }
  return [...set];
}

/** Given a changed wire, the module sheet(s) that must be revised. Honors the
 *  wire's explicit `module` override (used for heavy cross-module stud cables
 *  that build with the engine pigtail even though one terminal lugs to a
 *  main-loom component — the cable detaches with the engine). */
export function modulesForWire(wire: { from: { component: string }; to: { component: string }; module?: string }): string[] {
  if (wire.module) return [wire.module];
  return modulesForComponents([wire.from.component, wire.to.component]);
}

export const moduleById = new Map(harnessModules.map((m) => [m.id, m]));
