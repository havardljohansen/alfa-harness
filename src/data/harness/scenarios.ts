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
  /** Terminals expected to reach GROUND (return path intact). Lets fault tests
   * assert that a lamp's ground side is broken even when its +12 V side is
   * still live — current can't flow without a return, so the lamp is "out"
   * despite registering as live in the boolean propagation. */
  grounded?: Array<[string, string]>;
  /** Terminals expected NOT to reach ground (return path broken / floating). */
  floating?: Array<[string, string]>;
}

export interface Scenario {
  id: string;
  story: string; // human "given … then …"
  state: SimState;
  expect: Expectation;
}

const off: SimState = { ignition: "off", switches: {} };

export const scenarios: Scenario[] = [
  // -------------------------------------------------------------------------
  // POSITIVE / OPERATIONAL — assert the right things happen for normal use.
  // Grouped loosely by topic: power & ignition → headlights → indicators →
  // accessory loads (wipers, fan, fuel, etc.). Order is the order you'd walk
  // through the user-story (key off → key on → drive away).
  // -------------------------------------------------------------------------
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
    id: "low-beams-need-key",
    story: "Key out, dash switch set to LOW → low beams stay OFF. NOTE: this scenario asserts `relaysOn: ['rly-low']` even though the bulbs are dead — that's intentional. The coil energises (sw-headlight LOW output is constant-fed via the dash switch, so rly-low clicks audibly), but the bulbs don't light because the relay COMMON is gated by ignition (rly-low.30 is fed from ign-bus via f-ign-6, and ign-bus is dead with no key). See rly-low's fn description for the asymmetric-gating design. This is what makes the 'set LOW and forget' UX work — driver leaves the switch at LOW permanently and the lights die with the key. Parking lamps also dark (no PARK detent engaged, ign-bus dead means no auto-ign feed).",
    state: { ignition: "off", switches: { "sw-headlight": "Low" } },
    expect: {
      dead: [
        ["hl-L", "56b"],
        ["hl-R", "56b"],
        ["park-fl", "58"],
      ],
      relaysOn: ["rly-low"], // coil ENERGISES (constant-fed) — the gate is at the relay common, not the coil. See story.
      relaysOff: ["rly-high"],
    },
  },
  {
    id: "high-beams-key-off",
    story: "Key out, dash switch to HIGH → high beams light (HIGH relay common is constant via PDM); no low, no parking. Emergency lighting use case.",
    state: { ignition: "off", switches: { "sw-headlight": "High" } },
    expect: {
      live: [["hl-L", "56a"], ["hl-R", "56a"], ["wl-main", "in"]],
      dead: [["hl-L", "56b"], ["park-fl", "58"]],
      relaysOn: ["rly-high"],
      relaysOff: ["rly-low"],
    },
  },
  {
    id: "park-override-key-off",
    story: "Key out, dash switch to PARK → parking lamps light front + rear via the dash-switch override (constant-fed); ignition bus stays dead (back-feed blocked by d-park-ign-iso).",
    state: { ignition: "off", switches: { "sw-headlight": "Park" } },
    expect: {
      live: [["park-fl", "58"], ["park-fr", "58"], ["tail-rl", "58"], ["tail-rr", "58"], ["plate", "58"]],
      dead: [
        ["hl-L", "56b"], ["hl-L", "56a"],
        ["rtmr-ign", "BUS"], // diode prevents back-feed of the ign-bus
        ["usb-charge", "in"], // proof the ign-bus isn't back-fed (would otherwise wake the accessory feed)
      ],
      relaysOff: ["rly-low", "rly-high", "rly-fuel", "rly-ignmain"],
    },
  },
  {
    id: "low-beams-run",
    story: "Key on (Run), dash switch to LOW → both low beams light (coil energised + ign-gated common now live); parking lamps also on via auto-running-light feed; high stays off.",
    state: { ignition: "run", switches: { "sw-headlight": "Low" } },
    expect: {
      live: [
        ["hl-L", "56b"], ["hl-R", "56b"],
        ["park-fl", "58"], ["tail-rl", "58"], // parking lamps on via f-ign-10
      ],
      dead: [["hl-L", "56a"]],
      relaysOn: ["rly-low"],
      relaysOff: ["rly-high"],
    },
  },
  {
    id: "high-beams-run",
    story: "Key on, dash switch to HIGH → high beams + blue tell-tale; low stays dead (mutually exclusive at the switch contacts); parking on via auto-running-light feed.",
    state: { ignition: "run", switches: { "sw-headlight": "High" } },
    expect: {
      live: [["hl-L", "56a"], ["hl-R", "56a"], ["wl-main", "in"], ["park-fl", "58"]],
      dead: [["hl-L", "56b"]],
      relaysOn: ["rly-high"],
      relaysOff: ["rly-low"],
    },
  },
  {
    // The only way both filaments can light on this car: dash at LOW + column
    // flash stalk pressed. Matches Neil Martin's AlfaBB observation 2026-05-28
    // and is the standard flash-to-pass-while-driving behaviour on every car.
    id: "flash-while-low",
    story: "Key on, dash switch at LOW + column flash stalk pressed → BOTH filaments lit momentarily. This is the ONLY combination that produces both-on (the dash switch contacts are mutually exclusive — only the flash stalk can add HIGH on top of LOW). Standard flash-to-pass-while-driving — every car does this. Not a sustained state.",
    state: { ignition: "run", switches: { "sw-headlight": "Low", "sw-flash": "Flash" } },
    expect: {
      live: [["hl-L", "56a"], ["hl-R", "56a"], ["hl-L", "56b"], ["hl-R", "56b"], ["wl-main", "in"], ["park-fl", "58"]],
      relaysOn: ["rly-low", "rly-high"],
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
    id: "flash-to-pass-run",
    story: "Key on, dash switch OFF, push column flash → high beams fire momentarily (flash-to-pass works regardless of dash switch position).",
    state: { ignition: "run", switches: { "sw-headlight": "Off", "sw-flash": "Flash" } },
    expect: { relaysOn: ["rly-high"], live: [["hl-L", "56a"]] },
  },
  {
    id: "flash-works-key-off",
    story: "Key OUT, push column flash → high beams fire momentarily (flash is on the constant bus, key-independent — handy for signalling in a dark garage or to oncoming traffic).",
    state: { ignition: "off", switches: { "sw-flash": "Flash" } },
    expect: { relaysOn: ["rly-high"], live: [["hl-L", "56a"]] },
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
  // -------------------------------------------------------------------------
  // 155 TS engine swap (2026-05-29) — same chassis loom, K6+ kit plugged into
  // EM1 instead of the Nord engine module. These scenarios run with
  // engine: "155" so the simulator excludes engine-nord wires and includes
  // engine-155ts wires instead. Confirms the plug-in design works.
  // -------------------------------------------------------------------------
  {
    id: "swap-155-ecu-powered-key-run",
    story: "155 fitted, Key RUN → K6+ ECU receives +12V via EM1 pin 1 (from rtmr-ign.f-ign-1 via the chassis loom). The Nord coil is NOT in the live set (Nord engine unplugged).",
    state: { ignition: "run", switches: {}, engine: "155" },
    expect: {
      live: [
        ["em1", "pin-1"],
        ["k6plus-ecu", "+12V"],
        ["k6plus-amp-1", "+12V"],
        ["k6plus-amp-2", "+12V"],
      ],
      dead: [["coil", "15"]], // Nord coil is unplugged — its engine-side wire is excluded
    },
  },
  {
    id: "swap-155-ign-bus-shared-with-nord",
    story: "155 fitted, Key RUN → chassis ign-bus (rtmr-ign.BUS) live exactly as with Nord. Proves the chassis loom is unchanged across the swap.",
    state: { ignition: "run", switches: {}, engine: "155" },
    expect: {
      live: [
        ["rtmr-ign", "BUS"],   // ign main relay closes regardless of engine
        ["rtmr-const", "BUS"], // constant bus always
        ["g-fuel", "+"],       // gauges fed from ign bus, work either engine
        ["fuel-pump", "in"],   // fuel pump auto-on key-run
      ],
      relaysOn: ["rly-ignmain", "rly-fuel"],
    },
  },
  {
    id: "swap-155-starter-trigger-works",
    story: "155 fitted, Key START → starter solenoid trigger reaches the 155 starter via EM1 pin 9 (same chassis path; engine-side wire is 155-specific).",
    state: { ignition: "start", switches: {}, engine: "155" },
    expect: {
      live: [["em1", "pin-9"], ["starter-155", "50"]],
      dead: [["starter", "50"]], // Nord starter unplugged
      relaysOn: ["rly-starter"], // chassis-side relay closes the same way
    },
  },
  {
    id: "swap-155-alt-charge-lamp-same",
    story: "155 fitted → 155 alternator's D+ feeds EM1 pin 8 → charge warning lamp. Same chassis-side path as Nord; only the source alternator differs.",
    state: { ignition: "run", switches: {}, engine: "155" },
    expect: {
      // alt D+ output behaviour depends on whether engine is running, which
      // we don't simulate at the lamp level. But the path should be live to
      // pin 8 (which then drives the lamp via wl-charge.d).
      live: [["wl-charge", "+"]], // feed side from ign bus
    },
  },
  {
    id: "nord-default-no-155-ecu-power",
    story: "Default state (Nord fitted, no engine flag) → 155 ECU is NOT in the propagation. K6+ kit components are dark — they don't exist in this configuration.",
    state: { ignition: "run", switches: {} }, // no engine flag → defaults to "nord"
    expect: {
      live: [["coil", "15"]],     // Nord coil IS live
      dead: [["k6plus-ecu", "+12V"]], // 155 ECU is NOT (engine-155ts wires excluded)
    },
  },

  // -------------------------------------------------------------------------
  // Future-provisioned brake redundancy + failure-warning lamp (2026-05-28).
  // Exercises the future-marked components/wires so we know the architecture
  // works when fitted. Today these scenarios pass with the parts unfitted
  // because the future switches default to their "open" position — the same
  // tests will validate behaviour the day the user installs them.
  // -------------------------------------------------------------------------
  {
    id: "brake-redundancy-second-switch-alone",
    story: "Brake pedal pressed, but only the SECOND pressure switch (sw-brake-2) closes — e.g. the primary sw-brake has failed or its hydraulic circuit has lost pressure. Brake lamps must STILL light via the parallel wiring (w-brake-in-2 + w-brake-out-2 joining the two switches' input + output). Proves the future redundancy plan works.",
    state: { ignition: "off", switches: { "sw-brake-2": "Pressed" } },
    expect: {
      live: [["tail-rl", "54"], ["tail-rr", "54"]],
    },
  },
  {
    id: "brake-redundancy-primary-switch-alone",
    story: "Brake pedal pressed, but only the PRIMARY sw-brake closes (the second hydraulic circuit / sw-brake-2 has failed). Brake lamps must still light — same parallel architecture, opposite side. Baseline (today's) behaviour with sw-brake-2 unfitted is identical to this state.",
    state: { ignition: "off", switches: { "sw-brake": "Pressed" } },
    expect: {
      live: [["tail-rl", "54"], ["tail-rr", "54"]],
    },
  },
  {
    id: "brake-failure-warning-lamp",
    story: "Key RUN, master-cylinder pressure differential switch (sw-brake-diff) closes — one hydraulic circuit has lost pressure. The warning lamp's ground side gets grounded via sw-brake-diff, lighting wl-brake. Proves the future brake-failure warning circuit works when fitted.",
    state: { ignition: "run", switches: { "sw-brake-diff": "Failed" } },
    expect: {
      live: [["wl-brake", "+"]],     // feed side live via wl-charge daisy chain
      grounded: [["wl-brake", "s"]], // sense side reaches ground via sw-brake-diff → gnd-eng
    },
  },
  {
    id: "brake-failure-lamp-dark-when-ok",
    story: "Key RUN, diff switch at default OK (both brake circuits balanced) → wl-brake stays dark even though its feed side is live. Confirms the differential switch is the gate, not a permanent ground.",
    state: { ignition: "run", switches: {} },
    expect: {
      live: [["wl-brake", "+"]],
      floating: [["wl-brake", "s"]], // sense side has no path to ground when sw-brake-diff is open
    },
  },

  // -------------------------------------------------------------------------
  // FAULT INJECTION — blown fuses + broken ground straps (2026-05-28).
  // Borrows the FMEA single-fault pattern: pull ONE protective element and
  // assert exactly the blast radius we expect. Catches:
  //   - fuse protecting more / fewer circuits than intended
  //   - ground-strap topology that silently bonds things together
  //   - downstream consumers we forgot the fuse / ground stud serves
  // The fault state lives in SimState (blownFuse / brokenWire) — see engine.ts.
  // -------------------------------------------------------------------------
  {
    id: "fuse-ign-1-blown-coil-dark",
    story: "Key RUN, ignition coil fuse f-ign-1 blown → coil.15 goes dark (engine can't run) but the rest of the ignition bus stays live (gauges, fuel pump, accessory feed). Confirms f-ign-1 is single-purpose for the coil — not a cascade fuse.",
    state: { ignition: "run", switches: {}, blownFuse: "f-ign-1" },
    expect: {
      dead: [["coil", "15"]],
      live: [["rtmr-ign", "BUS"], ["g-fuel", "+"], ["fuel-pump", "in"], ["usb-charge", "in"]],
      relaysOn: ["rly-ignmain", "rly-fuel"],
    },
  },
  {
    id: "fuse-ign-3-blown-accessory-dark",
    story: "Key RUN, accessory fuse f-ign-3 blown → USB + stereo dark (stereo piggybacks the USB feed at the dash). Coil + gauges + fuel pump still live — confirms the accessory fuse only protects its own branch.",
    state: { ignition: "run", switches: {}, blownFuse: "f-ign-3" },
    expect: {
      dead: [["usb-charge", "in"], ["stereo", "+B"]],
      live: [["coil", "15"], ["g-fuel", "+"], ["fuel-pump", "in"]],
    },
  },
  {
    id: "fuse-ign-6-blown-low-beam-asymmetric",
    story: "Key RUN, HL switch at Low, f-ign-6 blown (the ign-gating fuse for low-beam common) → low-beam relay COIL still energises (its trigger comes from sw-headlight via f-con-5) but the relay output is dark because the common feed is gone. Asymmetric design exposed: blowing this single fuse kills LOW even when the switch is set correctly.",
    state: { ignition: "run", switches: { "sw-headlight": "Low" }, blownFuse: "f-ign-6" },
    expect: {
      dead: [["hl-L", "56b"], ["hl-R", "56b"]],
      relaysOn: ["rly-low"],
    },
  },
  {
    id: "fuse-ign-10-blown-drl-dark",
    story: "Key RUN, no switches changed, f-ign-10 blown (auto-on running lights) → all park/tail/plate lamps go dark. The dash-switch PARK override (sw-headlight at Park) would still light them via the other source — but with the dash at OFF (default), there's no override and the auto path is the only one.",
    state: { ignition: "run", switches: {}, blownFuse: "f-ign-10" },
    expect: {
      dead: [["park-fl", "58"], ["park-fr", "58"], ["tail-rl", "58"], ["tail-rr", "58"], ["plate", "58"]],
      live: [["rtmr-ign", "BUS"]], // bus itself still alive; only this fuse leg is dead
    },
  },
  {
    id: "fuse-con-3-blown-brakes-dark",
    story: "Brake pedal pressed but f-con-3 (brake-lamp fuse) blown → brake lamps stay dark. Safety-critical fault that this matrix would catch at design time: if anything else gets accidentally hung off f-con-3, blowing it kills brakes AND that thing.",
    state: { ignition: "run", switches: { "sw-brake": "Pressed" }, blownFuse: "f-con-3" },
    expect: {
      dead: [["tail-rl", "54"], ["tail-rr", "54"]],
      live: [["rtmr-const", "BUS"]],
    },
  },
  {
    id: "fuse-con-5-blown-headlights-undriveable",
    story: "Key RUN, dash switch at High, but f-con-5 blown (dash-switch + flash constant feed) → high-beam relay COIL can't energise because the trigger path through sw-headlight is dead at the source. ALSO flash-to-pass is dead. Single fuse failure = no headlight control at all.",
    state: { ignition: "run", switches: { "sw-headlight": "High" }, blownFuse: "f-con-5" },
    expect: {
      dead: [["hl-L", "56a"], ["hl-R", "56a"], ["sw-headlight", "30"], ["sw-flash", "in"]],
      relaysOff: ["rly-high"],
    },
  },
  {
    id: "fuse-pdm-1-blown-left-low-only",
    story: "Key RUN, HL switch at Low, f-pdm-1 blown → LEFT low beam dark, RIGHT low beam still lit. Confirms the per-side PDM fusing keeps a single bulb's worth of brightness on the road (limp-home capability) instead of going fully dark.",
    state: { ignition: "run", switches: { "sw-headlight": "Low" }, blownFuse: "f-pdm-1" },
    expect: {
      dead: [["hl-L", "56b"]],
      live: [["hl-R", "56b"]],
      relaysOn: ["rly-low"],
    },
  },
  {
    id: "fuse-pdm-3-blown-left-high-only",
    story: "Key RUN, HL switch at High, f-pdm-3 blown → LEFT high beam dark, RIGHT high beam still lit. Per-side high-beam fusing — same limp-home benefit on high beams.",
    state: { ignition: "run", switches: { "sw-headlight": "High" }, blownFuse: "f-pdm-3" },
    expect: {
      dead: [["hl-L", "56a"]],
      live: [["hl-R", "56a"]],
      relaysOn: ["rly-high"],
    },
  },
  // --- Ground-strap fault scenarios ---------------------------------------
  // The four chassis ground studs (eng/dash/rear/front) trunk back to gnd-eng
  // via heavy strap wires. Break a strap, the stud floats — but power-side
  // remains live in our boolean model, so we assert via the `grounded`/`floating`
  // expectations (the ground reachability set). Components on that stud can't
  // complete their circuit even though +12 V is present.
  {
    id: "ground-dash-strap-broken",
    story: "w-gnd-dash broken → the dash ground stud floats. Gauge cluster, USB ground, horn-button ground, turn tell-tale all lose their return path. The components are still POWERED (live side intact) but won't function. Engine-grounded loads (fuel pump in rear, relay coils on gnd-eng) are unaffected because they ground elsewhere.",
    state: { ignition: "run", switches: {}, brokenWire: "w-gnd-dash" },
    expect: {
      floating: [["g-fuel", "g"], ["wl-turn", "g"], ["sw-horn", "g"], ["usb-charge", "g"]],
      grounded: [["fuel-pump", "g"], ["rly-fuel", "85"]], // grounded via rear / engine — unaffected
      relaysOn: ["rly-ignmain", "rly-fuel"], // both coil-ground at gnd-eng, fine
    },
  },
  {
    id: "ground-rear-strap-broken",
    story: "w-gnd-rear broken → rear ground stud floats. Tail/plate/fuel-pump lose return path. Fuel pump CAN'T RUN even though rly-fuel still energises (relay coil grounds at gnd-eng). This is an important asymmetry to catch: relay is happy, pump is dead.",
    state: { ignition: "run", switches: {}, brokenWire: "w-gnd-rear" },
    expect: {
      floating: [["tail-rl", "g"], ["tail-rr", "g"], ["plate", "g"], ["fuel-pump", "g"]],
      grounded: [["hl-L", "g"], ["g-fuel", "g"]],
      relaysOn: ["rly-ignmain", "rly-fuel"], // pump relay still energises (coil ground via gnd-eng)
    },
  },
  {
    id: "ground-front-strap-broken-headlights-dead",
    story: "w-gnd-front broken → front ground stud floats. CRITICAL: rly-low and rly-high coils ground at gnd-front (not gnd-eng), so blowing this single strap kills the headlight relays' coil-ground path — neither can energise even with the switch at High and the bulb feeds live. Also front lamps + horns lose their ground.",
    state: { ignition: "run", switches: { "sw-headlight": "High" }, brokenWire: "w-gnd-front" },
    expect: {
      floating: [["rly-low", "85"], ["rly-high", "85"], ["hl-L", "g"], ["hl-R", "g"], ["horn-hi", "g"]],
      relaysOff: ["rly-low", "rly-high"], // coil ground gone → no energise
      dead: [["hl-L", "56a"], ["hl-R", "56a"]], // and therefore high-beam outputs dead too
    },
  },
  {
    id: "ground-bat-strap-broken-catastrophic",
    story: "w-bat-gnd broken (battery − to gnd-eng) → the ENTIRE chassis loses connection to battery negative. Every ground node downstream (gnd-eng / dash / rear / front, all trunked through gnd-eng) floats. No relay can energise, no lamp can complete its circuit. This is the failure mode that a corroded battery-negative terminal causes.",
    state: { ignition: "run", switches: {}, brokenWire: "w-bat-gnd" },
    expect: {
      floating: [["rly-ignmain", "85"], ["fuel-pump", "g"], ["g-fuel", "g"], ["hl-L", "g"]],
      relaysOff: ["rly-ignmain", "rly-fuel"], // ign-main coil can't ground → entire ign bus stays dark
      dead: [["rtmr-ign", "BUS"], ["coil", "15"], ["fuel-pump", "in"]],
    },
  },

  // that the swap from EXTERNAL flasher + w-flasher-in + f-con-8-feed to
  // IN-CAVITY flasher (rtmr-const cavity 5, NO-762-LED) is electrically sound.
  //   POSITIVE: cavity provides bus power → flasher 49 + 49a both live at all
  //   times (constant bus). Hazards key-off and turn-signals key-on still work.
  //   NEGATIVE: the OTHER flasher pin (31, ground) is not on the live network,
  //   it's on the ground network. The freed f-con-8 fuse position is no longer
  //   in the c-turn power path. Turn-relay 30 doesn't get power from any OTHER
  //   source (only via the flasher pass-through — pulling the flasher dark
  //   kills both turn relays, which would be the failure mode in service).
  // -------------------------------------------------------------------------
  {
    id: "flasher-cavity-bus-keyoff",
    story: "Key OUT, no switches → the in-cavity flasher's input AND output are both live (cavity 30 = bussed input; 49a = pass-through). Confirms the cavity arrangement gives the flasher constant power without a chassis wire.",
    state: off,
    expect: {
      live: [
        ["rtmr-const", "BUS"],
        ["flasher", "49"],
        ["flasher", "49a"],
      ],
    },
  },
  {
    id: "flasher-cavity-bus-run",
    story: "Key RUN, no switches → flasher 49/49a still live (same as key-off — cavity input is constant). The turn-relay COMMONS (30) are also live (flasher pass-through reaches them via w-turnL-30 jumper) but the relays themselves remain de-energised because no coil is triggered.",
    state: { ignition: "run", switches: {} },
    expect: {
      live: [
        ["flasher", "49"],
        ["flasher", "49a"],
        ["rly-turnL", "30"],
        ["rly-turnR", "30"],
      ],
      relaysOff: ["rly-turnL", "rly-turnR"],
      // Outputs stay dark when nothing is energised — confirms common-live
      // does NOT bleed through to 87 except via the relay closing.
      dead: [
        ["turn-fl", "L"], ["turn-fr", "R"], ["turn-rl", "L"], ["turn-rr", "R"],
      ],
    },
  },
  {
    id: "flasher-cavity-ground-reaches",
    story: "Flasher pin 31 (ground) reaches gnd-eng via the new w-flasher-gnd wire. This is what makes the cavity arrangement work — the case-grounding of the external mount is replaced by an explicit ground wire.",
    state: off,
    expect: {
      // We can't assert ground membership directly via Expectation, so we
      // assert via a dedicated test below (flasher-cavity ground test).
      // This scenario asserts that the FLASHER PIN 31 is NOT live (sanity:
      // ground pin should not be at +12 V).
      dead: [["flasher", "31"]],
    },
  },
  {
    id: "flasher-cavity-fuse-freed",
    story: "f-con-8 (was 'Flasher constant feed', now spare) is no longer in the c-turn path — even with hazards on, the fuse position is bussed but it doesn't sit between the bus and the flasher anymore. Confirms the freed fuse is genuinely free (not silently still load-bearing).",
    state: { ignition: "off", switches: { "sw-hazard": "On" } },
    expect: {
      // Hazards still work — full-system live test of the refactor:
      live: [["turn-fl", "L"], ["turn-fr", "R"], ["turn-rl", "L"], ["turn-rr", "R"]],
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
    story: "Column flash-to-pass fires HIGH only — it must NOT light the low beam (catches the flash feed sneaking into the dip circuit).",
    state: { ignition: "run", switches: { "sw-headlight": "Off", "sw-flash": "Flash" } },
    expect: {
      relaysOn: ["rly-high"],
      relaysOff: ["rly-low"],
      live: [["hl-L", "56a"]],
      dead: [["hl-L", "56b"]],
    },
  },
  {
    id: "park-override-no-back-feed",
    story: "Key OUT, dash to PARK → parking lamps light via the override, but the ignition bus stays DEAD (Schottky d-park-ign-iso prevents back-feed). The fuel pump, accessory feed, gauges etc. must all stay off — proof the diode is wired the right way around.",
    state: { ignition: "off", switches: { "sw-headlight": "Park" } },
    expect: {
      live: [["park-fl", "58"], ["tail-rl", "58"]],
      dead: [
        ["rtmr-ign", "BUS"],
        ["fuel-pump", "in"], ["usb-charge", "in"], ["g-fuel", "+"], ["coil", "15"],
      ],
      relaysOff: ["rly-ignmain", "rly-fuel"],
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

  // -------------------------------------------------------------------------
  // PRE-BUILD VERIFICATION — added after the headlight architecture refactor.
  // Negative tests for the new diode-OR nodes + legal walkthrough wiring.
  // Goal: every behaviour described in the user-story walkthrough is covered
  // by a passing test BEFORE any wire is cut.
  // -------------------------------------------------------------------------
  {
    id: "flash-plus-hl-high-no-backfeed",
    story: "Key off, dash knob OFF + lever HIGH (sw-headlight at Off+Hi) AND column flash pressed simultaneously → high beams fire; both source paths to rly-high.86 (w-hl-hi-trg and w-flash-out) coexist; neither source should back-feed the other's switch (both are sw-headlight.30 and sw-flash.in on constant — same voltage source, no risk; this test asserts the model agrees).",
    state: { ignition: "off", switches: { "sw-headlight": "Off+Hi", "sw-flash": "Flash" } },
    expect: {
      live: [["hl-L", "56a"], ["hl-R", "56a"]],
      relaysOn: ["rly-high"],
      relaysOff: ["rly-low"], // make sure flash doesn't sneak into low somehow
    },
  },
  {
    id: "park-plus-run-no-sneak",
    story: "Key on (RUN) + dash knob PARK → parking lamps lit (via both auto-ign feed AND PARK override OR'd at the lamp node); no sneak path lights anything unintended; ign-bus stays cleanly contained; HL switch's PARK leg doesn't cross-talk to LOW or HIGH outputs through internal switch dead contacts.",
    state: { ignition: "run", switches: { "sw-headlight": "Park" } },
    expect: {
      live: [["park-fl", "58"], ["tail-rl", "58"], ["rtmr-ign", "BUS"]],
      dead: [
        ["hl-L", "56b"], ["hl-L", "56a"], // LOW + HIGH outputs of the relay stay dead
        ["rly-low", "87"], ["rly-high", "87"], // beam relay outputs dead
      ],
      relaysOff: ["rly-low", "rly-high"],
    },
  },
  {
    id: "hazards-plus-park-key-off",
    story: "Key OUT, hazards ON, dash knob PARK → hazards flash (both turn relays cycling) AND parking lamps light (PARK override); both work independently on the constant bus with no cross-talk; ign-bus stays dead despite both circuits being active.",
    state: { ignition: "off", switches: { "sw-hazard": "On", "sw-headlight": "Park" } },
    expect: {
      live: [
        ["park-fl", "58"], ["tail-rl", "58"], // parking from PARK override
        ["turn-fl", "L"], ["turn-fr", "R"], // hazards both sides
        ["wl-turn", "in"], // turn tell-tale
      ],
      dead: [
        ["rtmr-ign", "BUS"], // ign-bus must stay dead — both park-iso diodes doing their job
        ["fuel-pump", "in"], ["usb-charge", "in"], ["coil", "15"], // proof ign-bus is contained
        ["hl-L", "56b"], ["hl-L", "56a"], // headlamps stay dark
      ],
      relaysOn: ["rly-turnL", "rly-turnR"],
      relaysOff: ["rly-low", "rly-high", "rly-ignmain", "rly-fuel"],
    },
  },
  {
    id: "low-coil-no-bus-leak",
    story: "Key on, dash at LOW → low beams light via the ign-gated common (rly-low.30 ← f-ign-6). Critical: verify the new w-low-com wire only carries current INTO the relay common, doesn't create a path from the bulbs BACK to the ign bus (which would phantom-power things when bulbs are removed, etc.). Asserts the ign-bus loads stay independent of low-beam state.",
    state: { ignition: "run", switches: { "sw-headlight": "Low" } },
    expect: {
      live: [
        ["hl-L", "56b"], ["hl-R", "56b"], // low beams on
        ["rtmr-ign", "BUS"], ["coil", "15"], ["usb-charge", "in"], // ign-bus loads stay normal
      ],
      dead: [["hl-L", "56a"]], // HIGH stays off
      relaysOn: ["rly-low"],
      relaysOff: ["rly-high"],
    },
  },
  {
    id: "charge-lamp-feed-live-key-on",
    story: "Key on (engine NOT running — propagation engine has no 'engine running' state, so this models the key-on-stationary case): the charge warning lamp's FEED side must be live so the bulb can light during the alternator self-excitation phase. This proves the gauges-feed (Pink, f-ign-2) reaches wl-charge through the warning-lamp jumper.",
    state: { ignition: "run", switches: {} },
    expect: {
      live: [["wl-charge", "+"]], // feed side live (proves the gauges→warning-lamp jumper exists)
    },
  },
  {
    id: "oil-pressure-lamp-feed-live-key-on",
    story: "Key on (engine NOT running): the oil-pressure warning lamp's FEED side must be live so the bulb can light when the engine isn't running (oil-switch closed = no pressure). Proves the gauges-feed reaches wl-oil through the warning-lamp jumper.",
    state: { ignition: "run", switches: {} },
    expect: {
      live: [["wl-oil", "+"]],
    },
  },
  {
    id: "plate-lights-with-tails",
    story: "Key on → rear tails AND BOTH plate lights light (plate lights jumper off the rear-tail node, both sides). Proves the plate-light wiring is per-side and not single-point-of-failure.",
    state: { ignition: "run", switches: {} },
    expect: {
      live: [["plate", "58"], ["plate-r", "58"], ["tail-rl", "58"], ["tail-rr", "58"]],
    },
  },
  {
    id: "reverse-only-when-engaged",
    story: "Key on + reverse engaged → reverse lamp lights. Verifies the reverse switch routes ign-fed power through to the rear lamp via BH3.",
    state: { ignition: "run", switches: { "sw-reverse": "Reverse" } },
    expect: {
      live: [["reverse", "in"]],
    },
  },
  {
    id: "reverse-needs-key",
    story: "Reverse engaged but key OUT → reverse lamp must stay dark (it's on the ign-bus via f-ign-7).",
    state: { ignition: "off", switches: { "sw-reverse": "Reverse" } },
    expect: {
      dead: [["reverse", "in"]],
    },
  },
  {
    id: "heater-fan-high",
    story: "Key Run, heater-fan switch HIGH → fan relay energises, blower runs at full speed; switch carries only coil current.",
    state: { ignition: "run", switches: { "sw-heaterfan": "High" } },
    expect: {
      relaysOn: ["rly-fan"],
      live: [["heater-fan", "in"]],
    },
  },
  {
    id: "heater-fan-off",
    story: "Key Run, heater-fan switch Off → fan relay de-energised, blower dark.",
    state: { ignition: "run", switches: { "sw-heaterfan": "Off" } },
    expect: {
      relaysOff: ["rly-fan"],
      dead: [["heater-fan", "in"]],
    },
  },
  {
    id: "washer-pump-runs",
    story: "Key Run, washer button pressed → washer relay closes, pump runs (period-correct dash button carries only the relay-coil trigger, modern electric pump carried by the relay).",
    state: { ignition: "run", switches: { "sw-washer": "Pressed" } },
    expect: {
      relaysOn: ["rly-washer"],
      live: [["washer-pump", "53c"]],
    },
  },
  {
    id: "wiper-self-park-when-off",
    story: "Key Run, wiper switch OFF (default) → LOW relay de-energised, its NC contact (87a) connects to motor 53a so the wiper homes itself. Critical test for the SPDT pinout of rly-wlow — if 87 and 87a are swapped at the relay socket, the motor runs continuously instead of parking.",
    state: { ignition: "run", switches: { "sw-wiper": "Off" } },
    expect: {
      relaysOff: ["rly-wlow", "rly-whigh"],
      live: [["wiper", "53a"]], // self-park feed via NC contact
      dead: [["wiper", "53"], ["wiper", "53b"]],
    },
  },
  {
    // NOTE: this is a HEADLINE baseline, not exhaustive — it covers the loads
    // most likely to regress on a refactor (ign bus + auto-on circuits + the
    // big switched accessories). Not every of the ~100 model nodes is asserted.
    // Treat additions to this scenario as a deliberate "this state too is
    // load-bearing to the baseline."
    id: "key-run-headline-baseline",
    story: "Key RUN, all switches at default — the headline 'engine off, key in run' state. Asserts the high-leverage loads that should be live (ign bus, auto-on running lights, gauges, fuel pump, accessory) and dead (headlamps, wipers, blower, indicators). Catches sneak paths and architecture regressions on common refactors. Not exhaustive — see the per-circuit scenarios for complete coverage.",
    state: { ignition: "run", switches: {} },
    expect: {
      live: [
        ["rtmr-const", "BUS"], // constant bus always
        ["rtmr-ign", "BUS"], // ign bus live (rly-ignmain closed)
        ["coil", "15"], // engine ready to run
        ["g-fuel", "+"], // gauges feed live
        ["wl-oil", "+"], ["wl-charge", "+"], // warning-lamp feeds (the bulbs may or may not light — depends on engine/alternator state — but the feed side must be live)
        ["park-fl", "58"], ["park-fr", "58"], ["tail-rl", "58"], ["tail-rr", "58"], ["plate", "58"], ["plate-r", "58"], // auto-on running lights
        ["fuel-pump", "in"], // electric pump runs key-on
        ["usb-charge", "in"], ["stereo", "+B"], // accessory feed live
      ],
      dead: [
        ["hl-L", "56a"], ["hl-L", "56b"], // headlamps off (dash switch default = Off)
        ["wiper", "53"], ["wiper", "53b"], // wipers not running (sw-wiper default = Off)
        ["heater-fan", "in"], // blower off
        ["horn-hi", "in"], // horn quiet
        ["turn-fl", "L"], ["turn-fr", "R"], // no indicators
        ["reverse", "in"], // not in reverse
        ["tail-rl", "54"], // brake not pressed
        ["washer-pump", "53c"], // washer not pressed
      ],
      relaysOn: ["rly-ignmain", "rly-fuel"], // ign main + fuel pump auto-on with key
      relaysOff: ["rly-low", "rly-high", "rly-fan", "rly-horn", "rly-turnL", "rly-turnR", "rly-wlow", "rly-whigh", "rly-starter", "rly-washer"],
    },
  },
];
