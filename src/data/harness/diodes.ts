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
  {
    id: "d-coil-fuel",
    name: "Fuel-relay coil flyback",
    purpose:
      "Suppresses the inductive spike when the fuel-pump relay de-energises (protects the ignition/inertia switch contacts). Only needed if the relay lacks a built-in diode.",
    onWire: "w-fuel-trg",
    reversed: true,
    currentA: 0.15,
    suggestion: "1N4007 across coil 85↔86, cathode to +.",
  },
  {
    id: "d-coil-ignmain",
    name: "Ignition-main coil flyback",
    purpose: "Coil-suppression diode across the ignition main relay coil.",
    onWire: "w-ignmain-trg",
    reversed: true,
    currentA: 0.15,
    suggestion: "1N4007 across coil 85↔86.",
  },
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
];
