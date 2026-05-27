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
      "The trunk everything else plugs into: the two bussed RTMRs (constant + ignition bus) and every relay, plus the two PWM modules and the engine-mounted devices fed directly from the bus.",
    componentIds: [
      "rtmr-ign", "rtmr-const", "battery", "alternator", "coil", "dist", "flasher",
      "starter", "wiper", "heater-fan", "washer-pump", "fan-resistor", "instr-pwm",
      "snd-temp", "snd-oil", "sw-oillight", "o2-sensor", "sw-brake", "sw-reverse",
      "rly-horn", "rly-fan", "rly-fuel", "rly-ignmain", "rly-turnL", "rly-turnR",
      "rly-wlow", "rly-whigh", "rly-starter", "rly-washer", "gnd-eng",
    ],
    contains: [
      "RTMR constant bus + RTMR ignition bus",
      "Relays: ignition-main, starter, fuel, horn, turn L/R, wiper low/high, fan, washer (future, in the spare constant-RTMR slot)",
      "Instrument-light PWM dimmer + heater-fan PWM/resistor (loom-side)",
      "Engine devices fed from the bus: coil, distributor, alternator sense, temp/oil senders, wiper motor, electric washer pump (install deferred), blower motor",
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
      "ISO-280 relays ×11 in use (6 SPST + 5 SPDT) + 1 future SPST (washer, reserves the constant-RTMR's last cavity)",
      "External electronic LED flasher (next to the constant RTMR)",
      "MINI/ATM fuses (assorted) + spares",
      "Instrument PWM dimmer + heater PWM/resistor module",
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
      "ign-switch", "sw-headlight", "sw-dipflash", "sw-turn", "sw-hazard", "sw-horn",
      "sw-washer", "sw-door-l", "sw-door-r", "g-fuel", "g-temp", "g-oil", "g-speedo",
      "g-tach", "g-afr", "wl-oil", "wl-charge", "wl-main", "wl-turn",
      "int-light", "usb-charge", "stereo", "gnd-dash",
    ],
    contains: [
      "Ignition switch",
      "Headlight switch + dip/flash switch + turn-signal column switch + hazard switch + horn button",
      "Washer push button (drives the electric washer pump — pump install deferred)",
      "Gauges (fuel, temp, oil, speedo, tach) + tell-tales (oil, charge, main-beam, turn)",
      "Headlight switch is headlights-only now (Off/Head); position/tail lamps are automatic ignition running lights",
      "USB-C fast-charge port + Bluetooth-amp stereo on one ignition-switched accessory feed",
      "Interior light feed",
    ],
    interfaces: [
      "BH1 — power & instruments (ignition feeds, sender signals, dash power, dimmer output in)",
      "BH2 — lighting & signal triggers (beam/turn/horn/position low-current lines)",
      "Dash ground block → hub (the BH1 ground trunk)",
    ],
    ground: "Dash ground block (gnd-dash) — gauges/tell-tales/switches; one thick trunk to the hub through BH1.",
    parts: [
      "GT 280 12-way pairs ×2 each for BH1 + BH2 (4 plugs today) — or one 24-way per bulkhead",
      "Dash ground block + trunk",
      "187/250 spade terminals for gauges/switches",
      "Signal diodes ×4 (turn tell-tale OR-ing / hazard isolation)",
      "Period-correct washer push button (low-current trigger; pump install deferred)",
    ],
    steps: [
      "Build the cluster harness on the bench: gauge feeds, sender signals, tell-tales, illumination output from the dimmer.",
      "Wire the switches as low-current only — they trigger relay coils / select lines, never carry loads (the period-correct washer button included: it triggers rly-washer in the engine bay, which carries the deferred electric pump).",
      "Land all dash grounds on the dash block; route its trunk to BH1.",
      "Terminate into the BH1 + BH2 connector halves; fit the isolation diodes on the signal side.",
      "Bench-test against the dash plugs before refitting the dash.",
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
      "BH3 — rear loom: switched position/tail, brake, rear turn L/R, reverse, fuel-pump feed, tank-sender signal",
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
  "main-loom": ["bh1", "bh2", "bh3", "bh4", "sw3"],
  "front-clip": ["bh4"],
  dashboard: ["bh1", "bh2"],
  "rear-boot": ["bh3"],
  "switch-cluster": ["sw3"],
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

/** Given a changed wire {from,to}, the module sheet(s) that must be revised. */
export function modulesForWire(wire: { from: { component: string }; to: { component: string } }): string[] {
  return modulesForComponents([wire.from.component, wire.to.component]);
}

export const moduleById = new Map(harnessModules.map((m) => [m.id, m]));
