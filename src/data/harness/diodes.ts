import type { Diode } from "./types";

// ===========================================================================
// Signal diodes — all on coil/signal wires (≤0.2 A), never in a load path,
// per the build history ("keep the diodes to the signal wires where possible").
// ===========================================================================
export const diodes: Diode[] = [
  {
    id: "d-haz-L",
    name: "Hazard → turn-L isolation",
    purpose:
      "Lets the hazard switch energise the LEFT turn relay coil without back-feeding the column turn switch (and vice-versa).",
    onWire: "w-haz-L-trg",
    inline: true,
    currentA: 0.15,
    suggestion: "1N4007 (or any 1 A signal diode) — anode at hazard switch.",
  },
  {
    id: "d-haz-R",
    name: "Hazard → turn-R isolation",
    purpose: "As d-haz-L, for the RIGHT turn relay coil.",
    onWire: "w-haz-R-trg",
    inline: true,
    currentA: 0.15,
    suggestion: "1N4007 — anode at hazard switch.",
  },
  {
    id: "d-tell-L",
    name: "Turn tell-tale OR-ing, left",
    purpose:
      "Feeds the single green tell-tale from the LEFT turn output without joining the left and right circuits.",
    onWire: "w-tell-L",
    inline: true,
    currentA: 0.05,
    suggestion: "1N4148/1N4007 — anode at the left turn output.",
  },
  {
    id: "d-tell-R",
    name: "Turn tell-tale OR-ing, right",
    purpose: "As d-tell-L, from the RIGHT turn output.",
    onWire: "w-tell-R",
    inline: true,
    currentA: 0.05,
    suggestion: "1N4148/1N4007 — anode at the right turn output.",
  },
  // Coil-flyback diodes for fuel + ignition-main relays were previously
  // modelled here but removed: the Song Chuan 301-1A-C-R1 (SPST) and
  // 301-1C-S-R1 (SPDT) relays we use both carry an integral 1 kΩ coil-
  // suppression resistor (the "R1" suffix). That resistor provides ~70-80%
  // of what a flyback diode would, and the switches driving these coils are
  // mechanical (vintage dash buttons + ignition contacts) — tolerant of the
  // residual spike. Belt-and-braces was overkill given the relay choice.
  {
    id: "d-park-ign-iso",
    name: "Parking-light ign-feed isolation",
    purpose: "The parking-light feed node has two sources OR'd at park-fl.58: the auto-on running-light feed from f-ign-10 (key-on) AND the dash-switch PARK override from sw-headlight.58 (key-off). This diode sits on the ign-feed leg so when PARK is engaged with the key off, the override current doesn't back-feed into the ignition bus (which would phantom-power gauges, coil, etc.). Anode at f-ign-10 side, cathode at the lamp side. No diode needed on the PARK leg because that switch contact opens cleanly when the rotary moves away from PARK.",
    onWire: "w-pos-front",
    inline: true,
    currentA: 2.5,
    suggestion: "Schottky (e.g. 1N5822 or SB540, 3 A / 40 V) — lower forward drop than 1N400x at the ~2 A continuous parking-light load. Anode at the rtmr-ign side.",
  },
  {
    id: "d-park-ign-iso-rear",
    name: "Parking-light ign-feed isolation (rear leg)",
    purpose: "Same OR-isolation as d-park-ign-iso, on the rear-tail feed leg from f-ign-10 to tail-rl.58. Prevents the dash-switch PARK key-off override from back-feeding the ignition bus via the rear-tail wire.",
    onWire: "w-pos-rear-L",
    inline: true,
    currentA: 2.5,
    suggestion: "Schottky as above (1N5822 / SB540). Anode at the rtmr-ign side.",
  },
  {
    id: "d-fan-hi-or",
    name: "Fan-gate diode-OR (HIGH leg)",
    purpose: "Lets the dash switch HIGH position energise the Bussmann rly-fan coil without back-feeding the LOW signal line. Paired with d-fan-lo-or. Without these two diodes, back-feed at the gate-coil junction would make the SPDT in the fan-adapter see HIGH signal whenever the switch is in LOW too, putting 12V on the HIGH winding at both speeds. Anode at sw-heaterfan.high, cathode at rly-fan.86.",
    onWire: "w-fan-trg-hi",
    inline: true,
    currentA: 0.15,
    suggestion: "1N4007 (1 A / 1000 V) — generic black-stripe diode, every parts drawer has them. 1N4148 also fine at this current. Mounted inline near the rly-fan socket where the two legs join.",
  },
  {
    id: "d-fan-lo-or",
    name: "Fan-gate diode-OR (LOW leg)",
    purpose: "Mirror of d-fan-hi-or for the LOW switch position. Together the two diodes form a classic diode-OR: gate relay coil sees 12V if EITHER switch position is closed, but neither switch leg back-feeds the other. Anode at sw-heaterfan.low, cathode at rly-fan.86.",
    onWire: "w-fan-trg-lo",
    inline: true,
    currentA: 0.15,
    suggestion: "1N4007 — pair with d-fan-hi-or. Anode at sw-heaterfan.low.",
  },
  {
    id: "d-instr-or-dim",
    name: "Dash-light gate diode-OR (DIM leg)",
    purpose: "Carries the ~2 A panel-light load when switch is in DIM, isolating the DIM-signal wire so it doesn't back-feed BRIGHT (which would corrupt the PWM module's preset selection). Together with d-instr-or-brt forms the diode-OR feeding dl pin 1 — the passthrough-mode power path. Anode at sw-instr.dim, cathode at dl.pin-1 splice.",
    onWire: "w-instr-or-dim",
    inline: true,
    currentA: 2.0,
    suggestion: "1N5822 (3 A / 40 V Schottky — already in BOM for park-iso). Anode at sw-instr.dim. 3 of 5 currently spare in stock, 2 used here.",
  },
  {
    id: "d-instr-or-brt",
    name: "Dash-light gate diode-OR (BRIGHT leg)",
    purpose: "Mirror of d-instr-or-dim for the BRIGHT switch position.",
    onWire: "w-instr-or-brt",
    inline: true,
    currentA: 2.0,
    suggestion: "1N5822 (3 A / 40 V Schottky). Anode at sw-instr.bright.",
  },
];
