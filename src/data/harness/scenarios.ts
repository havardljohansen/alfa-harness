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

const off: SimState = { ignition: "off", switches: {} };

export const scenarios: Scenario[] = [
  {
    id: "all-off",
    story: "Key out, everything off → the constant bus is live but no lamp is, and no relay is energised.",
    state: off,
    expect: {
      live: [["rtmr-const", "BUS"]],
      dead: [
        ["park-fl", "58"],
        ["tail-rl", "58"], // rear tails must be OFF too (regression guard for the always-on bug)
        ["hl-L", "56b"],
        ["rtmr-ign", "BUS"], // ignition bus dead until the main relay closes
      ],
      relaysOff: ["rly-ignmain", "rly-low", "rly-high", "rly-fuel", "rly-fan"],
    },
  },
  {
    id: "instr-lights-off",
    story: "Key in Run but instrument-light switch Off → panel illumination is dark (dimmer output not fed).",
    state: { ignition: "run", switches: { "sw-instr": "Off" } },
    expect: {
      dead: [["instr-pwm", "out"], ["g-fuel", "ill"]],
    },
  },
  {
    id: "instr-lights-bright",
    story: "Key in Run, instrument-light switch Bright → the PWM dimmer feeds one circuit to all gauge illumination.",
    state: { ignition: "run", switches: { "sw-instr": "Bright" } },
    expect: {
      live: [["instr-pwm", "hi"], ["instr-pwm", "out"], ["g-fuel", "ill"]],
      dead: [["instr-pwm", "lo"]],
    },
  },
  {
    id: "instr-lights-dim",
    story: "Key in Run, instrument-light switch Dim → the dimmer feeds the same single illumination circuit (at the dim preset).",
    state: { ignition: "run", switches: { "sw-instr": "Dim" } },
    expect: {
      live: [["instr-pwm", "lo"], ["instr-pwm", "out"], ["g-fuel", "ill"]],
      dead: [["instr-pwm", "hi"]],
    },
  },
  {
    id: "position-running-lights",
    story: "Key in Run → side/tail/plate lamps come on automatically as running lights (no switch; the light switch only does headlights).",
    state: { ignition: "run", switches: {} },
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
    id: "position-keyoff-dark",
    story: "Key out → position/tail lamps are OFF (they're ignition running lights now, not key-off parking lights).",
    state: { ignition: "off", switches: {} },
    expect: {
      dead: [
        ["park-fl", "58"],
        ["tail-rl", "58"],
      ],
    },
  },
  {
    id: "headlights-need-key",
    story: "Key out, headlight switch to Head + dip → headlights stay OFF (gated by the key); position lamps off too (running lights need the key).",
    state: { ignition: "off", switches: { "sw-headlight": "Head", "sw-dipflash": "Dip" } },
    expect: {
      dead: [
        ["hl-L", "56b"],
        ["hl-R", "56b"],
        ["park-fl", "58"],
      ],
      relaysOff: ["rly-low", "rly-high"],
    },
  },
  {
    id: "low-beams-run",
    story: "Key on (Run), Head + Dip → both low beams light; high beams stay off.",
    state: { ignition: "run", switches: { "sw-headlight": "Head", "sw-dipflash": "Dip" } },
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
    state: { ignition: "run", switches: { "sw-headlight": "Head", "sw-dipflash": "Main" } },
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
    state: { ignition: "run", switches: {} },
    expect: {
      live: [["rtmr-ign", "BUS"]],
      relaysOn: ["rly-ignmain"],
    },
  },
  {
    id: "turn-left-run",
    story: "Key Run, indicate Left → left turn relay energises, right does not.",
    state: { ignition: "run", switches: { "sw-turn": "Left" } },
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
    state: { ignition: "off", switches: { "sw-turn": "Left" } },
    expect: { relaysOff: ["rly-turnL", "rly-turnR"] },
  },
  {
    id: "hazard-keyoff",
    story: "Key out, hazards On → BOTH turn relays energise and all four indicators flash.",
    state: { ignition: "off", switches: { "sw-hazard": "On" } },
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
    state: { ignition: "run", switches: { "sw-turn": "Left" } },
    expect: {
      live: [["wl-turn", "in"]],
      dead: [["rly-turnR", "87"]],
    },
  },
  {
    id: "brake-keyoff",
    story: "Key out, brake pressed → both stop lamps light (brake works key-off).",
    state: { ignition: "off", switches: { "sw-brake": "Pressed" } },
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
    state: { ignition: "off", switches: { "sw-horn": "Pressed" } },
    expect: {
      relaysOn: ["rly-horn"],
      live: [["horn-hi", "in"]],
    },
  },
  {
    id: "wipers-low",
    story: "Key Run, wipers Low → low relay closes, motor 53 runs; the vintage switch carries no motor current.",
    state: { ignition: "run", switches: { "sw-wiper": "Low" } },
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
    state: { ignition: "run", switches: { "sw-wiper": "High" } },
    expect: {
      relaysOn: ["rly-whigh"],
      live: [["wiper", "53b"]],
    },
  },
  {
    id: "wipers-park",
    story: "Key Run, wipers Off → low relay drops out and the NC contact feeds 53a so the motor self-parks.",
    state: { ignition: "run", switches: { "sw-wiper": "Off" } },
    expect: {
      relaysOff: ["rly-wlow"],
      live: [["wiper", "53a"]],
      dead: [["wiper", "53b"]],
    },
  },
  {
    id: "fan-high",
    story: "Key Run, heater fan High → fan relay closes, blower runs; the switch carries only coil current.",
    state: { ignition: "run", switches: { "sw-heaterfan": "High" } },
    expect: {
      relaysOn: ["rly-fan"],
      live: [["heater-fan", "in"]],
    },
  },
  {
    id: "fuel-run",
    story: "Key Run, inertia switch closed → fuel-pump relay energises and the pump runs.",
    state: { ignition: "run", switches: {}, fuelSafetyOpen: false },
    expect: {
      relaysOn: ["rly-fuel"],
      live: [["fuel-pump", "in"]],
    },
  },
  {
    id: "fuel-safety-optional",
    story: "OPTIONAL (high-pressure pump only): if an inertia cut-off is fitted and trips, the pump stops even key-on.",
    state: { ignition: "run", switches: {}, fuelSafetyOpen: true },
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
  {
    id: "tail-position",
    story: "Key in Run → rear tails + both plate lamps light as running lights (ignition-fed, no switch).",
    state: { ignition: "run", switches: {} },
    expect: {
      live: [
        ["tail-rl", "58"],
        ["tail-rr", "58"],
        ["plate", "58"],
        ["plate-r", "58"],
      ],
    },
  },
  {
    id: "flash-to-pass",
    story: "Key on, headlights OFF, flick Flash → high beams fire (flash-to-pass must work without the headlight switch).",
    state: { ignition: "run", switches: { "sw-headlight": "Off", "sw-dipflash": "Flash" } },
    expect: { relaysOn: ["rly-high"], live: [["hl-L", "56a"]] },
  },
  {
    id: "main-needs-headlight",
    story: "Key on, headlights OFF, dip switch to Main (not flash) → high beam stays OFF (normal beams still need the headlight switch).",
    state: { ignition: "run", switches: { "sw-headlight": "Off", "sw-dipflash": "Main" } },
    expect: { relaysOff: ["rly-high", "rly-low"] },
  },
  {
    id: "flash-needs-key",
    story: "Key out, flick Flash → nothing (flash is ignition-fed).",
    state: { ignition: "off", switches: { "sw-dipflash": "Flash" } },
    expect: { relaysOff: ["rly-high"] },
  },
  {
    id: "starter-relay",
    story: "Key to Start → the starter relay closes and passes battery to the solenoid (the ign switch only carries coil current).",
    state: { ignition: "start", switches: {} },
    expect: { relaysOn: ["rly-starter"], live: [["starter", "50"]] },
  },
  {
    id: "starter-only-on-start",
    story: "Key in Run (not Start) → starter relay is off.",
    state: { ignition: "run", switches: {} },
    expect: { relaysOff: ["rly-starter"], dead: [["starter", "50"]] },
  },
  {
    id: "side-repeaters",
    story: "Indicate Left → the LEFT side marker/repeater flashes with it; the right stays dark.",
    state: { ignition: "run", switches: { "sw-turn": "Left" } },
    expect: { live: [["side-l", "in"]], dead: [["side-r", "in"]] },
  },

  // -------------------------------------------------------------------------
  // NEGATIVE / ISOLATION TESTS — assert the WRONG things stay dark. These catch
  // sneak paths and back-feeds; several fail if an isolation diode is missing.
  // -------------------------------------------------------------------------
  {
    id: "turn-left-isolation",
    story: "Indicate Left → left lamps + the shared green tell-tale light; the RIGHT lamps must stay dark (catches a missing turn-tell-tale OR diode d-tell-R back-feeding the right side through the common tell-tale node).",
    state: { ignition: "run", switches: { "sw-turn": "Left" } },
    expect: {
      live: [["turn-fl", "L"], ["turn-rl", "L"], ["wl-turn", "in"]],
      dead: [["turn-fr", "R"], ["turn-rr", "R"]],
      relaysOn: ["rly-turnL"],
      relaysOff: ["rly-turnR"],
    },
  },
  {
    id: "turn-right-isolation",
    story: "Indicate Right → right lamps + tell-tale light; the LEFT lamps must stay dark (catches a missing d-tell-L).",
    state: { ignition: "run", switches: { "sw-turn": "Right" } },
    expect: {
      live: [["turn-fr", "R"], ["turn-rr", "R"], ["wl-turn", "in"]],
      dead: [["turn-fl", "L"], ["turn-rl", "L"]],
      relaysOn: ["rly-turnR"],
      relaysOff: ["rly-turnL"],
    },
  },
  {
    id: "hazard-keyoff-both",
    story: "Key OUT, hazards ON → BOTH sides flash (works key-off on the constant bus); the hazard diodes feed both turn-relay coils without lighting the headlights or anything else.",
    state: { ignition: "off", switches: { "sw-hazard": "On" } },
    expect: {
      live: [["turn-fl", "L"], ["turn-fr", "R"], ["wl-turn", "in"]],
      dead: [["hl-L", "56b"], ["park-fl", "58"]],
      relaysOn: ["rly-turnL", "rly-turnR"],
    },
  },
  {
    id: "washer-not-wipers",
    story: "Key Run, washer button pressed → the washer-pump relay closes; the WIPERS must NOT run (washer is its own relay, not the wiper trigger).",
    state: { ignition: "run", switches: { "sw-washer": "Pressed" } },
    expect: {
      relaysOn: ["rly-washer"],
      relaysOff: ["rly-wlow", "rly-whigh"],
      dead: [["wiper", "53"], ["wiper", "53b"]],
    },
  },
  {
    id: "horn-isolation-keyoff",
    story: "Key OUT, horn pressed → horns sound (constant bus, key-off); nothing else triggers (horn button only grounds its own relay coil).",
    state: { ignition: "off", switches: { "sw-horn": "Pressed" } },
    expect: {
      live: [["horn-hi", "in"]],
      relaysOn: ["rly-horn"],
      relaysOff: ["rly-turnL", "rly-turnR", "rly-fuel", "rly-low"],
    },
  },
  {
    id: "accessory-ign-only",
    story: "Accessory circuit (USB + stereo) is IGNITION-switched: dead with the key out, live in Run — so the USB can't drain the battery parked and the stereo is off with the key.",
    state: { ignition: "off", switches: {} },
    expect: { dead: [["usb-charge", "in"], ["stereo", "+B"]] },
  },
  {
    id: "accessory-on-in-run",
    story: "Key Run → the accessory feed (USB + stereo) is live.",
    state: { ignition: "run", switches: {} },
    expect: { live: [["usb-charge", "in"], ["stereo", "+B"]] },
  },
  {
    id: "flash-not-low",
    story: "Flash-to-pass fires the HIGH beam only — it must NOT light the low beam (catches the flash feed sneaking into the dip circuit).",
    state: { ignition: "run", switches: { "sw-headlight": "Off", "sw-dipflash": "Flash" } },
    expect: {
      relaysOn: ["rly-high"],
      relaysOff: ["rly-low"],
      live: [["hl-L", "56a"]],
      dead: [["hl-L", "56b"]],
    },
  },
  {
    id: "brake-not-turns",
    story: "Key OUT, brake pressed → stop lamps light (constant, key-off); the TURN relays/lamps stay dark (brake filament is independent of the turn filament).",
    state: { ignition: "off", switches: { "sw-brake": "Pressed" } },
    expect: {
      live: [["tail-rl", "54"], ["tail-rr", "54"]],
      dead: [["turn-rl", "L"], ["turn-rr", "R"]],
      relaysOff: ["rly-turnL", "rly-turnR"],
    },
  },
];
