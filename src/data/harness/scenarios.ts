import type { SimState } from "./engine";

// =============================================================================
// USER STORIES — the intended electrical behaviour of the harness, as data.
// Each scenario is asserted against the propagation engine in harness.test.ts,
// and the same data will drive the Playwright UI E2E later. Edit/extend these
// as the "acceptance criteria" for the harness being wired correctly.
// =============================================================================

export interface Expectation {
  /** Terminals expected LIVE (carrying +12 V). */
  live?: Array<[string, string]>;
  /** Terminals expected NOT live. */
  dead?: Array<[string, string]>;
  relaysOn?: string[];
  relaysOff?: string[];
}

export interface Scenario {
  id: string;
  story: string; // human "given … then …"
  state: SimState;
  expect: Expectation;
}

const off: SimState = { ignition: "0", switches: {} };

export const scenarios: Scenario[] = [
  {
    id: "all-off",
    story: "Key out, everything off → the constant bus is live but no lamp is, and no relay is energised.",
    state: off,
    expect: {
      live: [["rtmr-const", "BUS"]],
      dead: [
        ["park-fl", "58"],
        ["hl-L", "56b"],
        ["rtmr-ign", "BUS"], // ignition bus dead until the main relay closes
      ],
      relaysOff: ["rly-ignmain", "rly-low", "rly-high", "rly-fuel", "rly-fan"],
    },
  },
  {
    id: "position-keyoff",
    story: "Key out, headlight switch to Position → side/tail/plate lamps light (they must work key-off).",
    state: { ignition: "0", switches: { "sw-headlight": "Position" } },
    expect: {
      live: [
        ["park-fl", "58"],
        ["park-fr", "58"],
        ["tail-rl", "58"],
      ],
      dead: [["hl-L", "56b"]],
      relaysOff: ["rly-low", "rly-high"],
    },
  },
  {
    id: "headlights-need-key",
    story: "Key out, headlight switch to Head + dip → headlights stay OFF (gated by the key); position lamps still on.",
    state: { ignition: "0", switches: { "sw-headlight": "Head", "sw-dipflash": "Dip" } },
    expect: {
      dead: [
        ["hl-L", "56b"],
        ["hl-R", "56b"],
      ],
      live: [["park-fl", "58"]],
      relaysOff: ["rly-low", "rly-high"],
    },
  },
  {
    id: "low-beams-key-I",
    story: "Key to position I, Head + Dip → both low beams light; high beams stay off.",
    state: { ignition: "I", switches: { "sw-headlight": "Head", "sw-dipflash": "Dip" } },
    expect: {
      live: [
        ["hl-L", "56b"],
        ["hl-R", "56b"],
      ],
      dead: [["hl-L", "56a"]],
      relaysOn: ["rly-low"],
      relaysOff: ["rly-high"],
    },
  },
  {
    id: "high-beams",
    story: "Key I, Head + Main → both high beams + blue tell-tale light.",
    state: { ignition: "I", switches: { "sw-headlight": "Head", "sw-dipflash": "Main" } },
    expect: {
      live: [
        ["hl-L", "56a"],
        ["hl-R", "56a"],
        ["wl-main", "in"],
      ],
      relaysOn: ["rly-high"],
    },
  },
  {
    id: "ign-main-relay",
    story: "Key to Run → the ignition main relay closes and the ignition bus comes alive.",
    state: { ignition: "II", switches: {} },
    expect: {
      live: [["rtmr-ign", "BUS"]],
      relaysOn: ["rly-ignmain"],
    },
  },
  {
    id: "turn-left-run",
    story: "Key Run, indicate Left → left turn relay energises, right does not.",
    state: { ignition: "II", switches: { "sw-turn": "Left" } },
    expect: {
      relaysOn: ["rly-turnL"],
      relaysOff: ["rly-turnR"],
      live: [["turn-fl", "L"]],
      dead: [["turn-fr", "R"]],
    },
  },
  {
    id: "turn-needs-key",
    story: "Key out, indicate Left → nothing happens (turn switch is ignition-fed).",
    state: { ignition: "0", switches: { "sw-turn": "Left" } },
    expect: { relaysOff: ["rly-turnL", "rly-turnR"] },
  },
  {
    id: "hazard-keyoff",
    story: "Key out, hazards On → BOTH turn relays energise and all four indicators flash.",
    state: { ignition: "0", switches: { "sw-hazard": "On" } },
    expect: {
      relaysOn: ["rly-turnL", "rly-turnR"],
      live: [
        ["turn-fl", "L"],
        ["turn-fr", "R"],
        ["turn-rl", "L"],
        ["turn-rr", "R"],
      ],
    },
  },
  {
    id: "diode-tell-isolation",
    story:
      "Indicate Left → the green tell-tale lights via its diode, but the RIGHT turn output stays dead (the tell-tale OR-ing diodes stop one side back-feeding the other).",
    state: { ignition: "II", switches: { "sw-turn": "Left" } },
    expect: {
      live: [["wl-turn", "L"]],
      dead: [["rly-turnR", "87"]],
    },
  },
  {
    id: "brake-keyoff",
    story: "Key out, brake pressed → both stop lamps light (brake works key-off).",
    state: { ignition: "0", switches: { "sw-brake": "Pressed" } },
    expect: {
      live: [
        ["tail-rl", "54"],
        ["tail-rr", "54"],
      ],
    },
  },
  {
    id: "horn-keyoff",
    story: "Key out, horn pressed → horn relay closes and the horns sound (constant-fed).",
    state: { ignition: "0", switches: { "sw-horn": "Pressed" } },
    expect: {
      relaysOn: ["rly-horn"],
      live: [["horn-hi", "in"]],
    },
  },
  {
    id: "wipers-low",
    story: "Key Run, wipers Low → low relay closes, motor 53 runs; the vintage switch carries no motor current.",
    state: { ignition: "II", switches: { "sw-wiper": "Low" } },
    expect: {
      relaysOn: ["rly-wlow"],
      relaysOff: ["rly-whigh"],
      live: [["wiper", "53"]],
      dead: [["wiper", "53b"]],
    },
  },
  {
    id: "wipers-high",
    story: "Key Run, wipers High → high relay closes, motor 53b runs.",
    state: { ignition: "II", switches: { "sw-wiper": "High" } },
    expect: {
      relaysOn: ["rly-whigh"],
      live: [["wiper", "53b"]],
    },
  },
  {
    id: "wipers-park",
    story: "Key Run, wipers Off → low relay drops out and the NC contact feeds 53a so the motor self-parks.",
    state: { ignition: "II", switches: { "sw-wiper": "Off" } },
    expect: {
      relaysOff: ["rly-wlow"],
      live: [["wiper", "53a"]],
      dead: [["wiper", "53b"]],
    },
  },
  {
    id: "fan-high",
    story: "Key Run, heater fan High → fan relay closes, blower runs; the switch carries only coil current.",
    state: { ignition: "II", switches: { "sw-heaterfan": "High" } },
    expect: {
      relaysOn: ["rly-fan"],
      live: [["heater-fan", "in"]],
    },
  },
  {
    id: "fuel-run",
    story: "Key Run, inertia switch closed → fuel-pump relay energises and the pump runs.",
    state: { ignition: "II", switches: {}, fuelSafetyOpen: false },
    expect: {
      relaysOn: ["rly-fuel"],
      live: [["fuel-pump", "in"]],
    },
  },
  {
    id: "fuel-safety",
    story: "Key Run but inertia/oil-pressure cut-off OPEN → fuel pump must NOT run (fire safety).",
    state: { ignition: "II", switches: {}, fuelSafetyOpen: true },
    expect: {
      relaysOff: ["rly-fuel"],
      dead: [["fuel-pump", "in"]],
    },
  },
  {
    id: "fuel-keyoff",
    story: "Key out → fuel pump never runs.",
    state: off,
    expect: { relaysOff: ["rly-fuel"], dead: [["fuel-pump", "in"]] },
  },
];
