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
];
