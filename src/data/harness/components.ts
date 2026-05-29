import type { DeviceComponent, SwitchComponent } from "./types";

// Shorthand for a terminal.
const t = (id: string, label: string, din?: string) => ({ id, label, din });

// ===========================================================================
// POWER / CHARGING / STARTING / IGNITION
// ===========================================================================
const power: DeviceComponent[] = [
  {
    id: "battery",
    name: "Battery (12 V, neg. ground)",
    kind: "battery",
    zone: "battery",
    terminals: [t("+", "Positive — constant hot", "30"), t("-", "Negative — chassis ground", "31")],
  },
  {
    id: "gnd-eng",
    name: "Ground HUB — engine bay / battery",
    kind: "ground",
    zone: "engine-front",
    terminals: [t("g", "Central star-ground hub (battery − + engine block + body)", "31")],
    note: "The star point. Battery − and the engine-block strap land here; every module ground block (front / dash / rear) runs ONE thick cable back to this hub. Engine, alternator and coil/sender grounds are local to this block.",
  },
  {
    id: "gnd-front",
    name: "Ground block — front clip",
    kind: "ground",
    zone: "engine-front",
    terminals: [t("g", "Front-clip ground block", "31")],
    note: "Collects every ground in the detachable front clip (headlights, side repeaters, horns). One thick trunk (GND.FRONT) runs back to the battery hub; detaches with the clip as a heavy ring/stud, separate from the BH4 signal plug.",
  },
  {
    id: "gnd-dash",
    name: "Ground block — dash",
    kind: "ground",
    zone: "dash",
    terminals: [t("g", "Dash ground block", "31")],
    note: "Collects the dash module grounds (gauges, tell-tales, dimmer, horn button). One thick trunk (GND.DASH) back to the battery hub through BH1.",
  },
  {
    id: "gnd-rear",
    name: "Ground block — rear / boot",
    kind: "ground",
    zone: "rear",
    terminals: [t("g", "Rear ground block (boot)", "31")],
    note: "Collects the rear module grounds (tails, plates, fuel pump). One thick trunk (GND.REAR) runs the length of the car straight back to the battery hub — not daisy-chained through the dash.",
  },
  // =========================================================================
  // K6+ kit components (engine-155ts module — FUTURE swap). All marked future
  // so they don't affect today's Nord-engine propagation. Live behind the
  // engine-side EM1 mating face. Wired in engine-155ts internal wires below.
  // =========================================================================
  {
    id: "k6plus-ecu",
    name: "Emerald K6+ ECU (155 TS, via Alfaholics 3D Mapped Ignition Kit)",
    kind: "sensor", // closest match in current kinds
    zone: "engine-rear",
    future: true,
    terminals: [
      t("+12V", "Power in (from EM1 pin 1)", ""),
      t("gnd", "Ground (to EM1 pin 2)", ""),
      t("tach-out", "Tach signal to EM1 pin 3", ""),
      t("temp-in", "Coolant-temp signal in (from EM1 pin 4)", ""),
      t("temp-gnd", "Coolant-temp ground (to EM1 pin 5)", ""),
      t("oil-in", "Oil-pressure signal in (from EM1 pin 6 — pass-through to gauge)", ""),
      t("oil-warn-in", "Oil-pressure warning in (from EM1 pin 7 — pass-through to lamp)", ""),
      t("fan-trg-out", "ECU fan trigger (to EM1 pin 10)", ""),
      t("cts-pass", "Coolant-temp pass-through (to EM1 pin 11 — secondary gauge)", ""),
      t("cps-in", "Crank position sensor input", ""),
      t("tps-in", "Throttle position sensor input", ""),
      t("coil-1-trg", "Coil pack 1 trigger out (to amp 1)", ""),
      t("coil-2-trg", "Coil pack 2 trigger out (to amp 2)", ""),
      t("5V-ref", "5V sensor reference (to CPS / TPS)", ""),
    ],
    note: "Emerald K6+ ECU embedded in the Alfaholics kit's universal loom. All inputs/outputs route via EM1 or internally within engine-155ts. FUTURE — only active when state.engine='155'.",
  },
  {
    id: "k6plus-amp-1",
    name: "Ignition amplifier 1 (cyl 1+4 — Twin Spark waste-spark)",
    kind: "sensor",
    zone: "engine-rear",
    future: true,
    terminals: [
      t("+12V", "Power in (from k6plus-ecu.+12V via kit-internal jumper)", ""),
      t("gnd", "Ground (to k6plus-ecu.gnd)", ""),
      t("trg-in", "Trigger in (from k6plus-ecu.coil-1-trg)", ""),
      t("coil-out", "Drive out to coil pack 1", ""),
    ],
    note: "FUTURE 155 TS kit component.",
  },
  {
    id: "k6plus-amp-2",
    name: "Ignition amplifier 2 (cyl 2+3 — Twin Spark waste-spark)",
    kind: "sensor",
    zone: "engine-rear",
    future: true,
    terminals: [
      t("+12V", "Power in", ""),
      t("gnd", "Ground", ""),
      t("trg-in", "Trigger in (from k6plus-ecu.coil-2-trg)", ""),
      t("coil-out", "Drive out to coil pack 2", ""),
    ],
    note: "FUTURE 155 TS kit component.",
  },
  {
    id: "k6plus-coil-1",
    name: "Coil pack 1 (155 TS waste-spark, cyl 1+4)",
    kind: "coil",
    zone: "engine-rear",
    future: true,
    terminals: [
      t("+", "Coil + (driven by amp 1)", ""),
      t("HT-1", "HT out to cyl 1 plug", ""),
      t("HT-4", "HT out to cyl 4 plug", ""),
    ],
    note: "FUTURE 155 TS kit component.",
  },
  {
    id: "k6plus-coil-2",
    name: "Coil pack 2 (155 TS waste-spark, cyl 2+3)",
    kind: "coil",
    zone: "engine-rear",
    future: true,
    terminals: [
      t("+", "Coil + (driven by amp 2)", ""),
      t("HT-2", "HT out to cyl 2 plug", ""),
      t("HT-3", "HT out to cyl 3 plug", ""),
    ],
    note: "FUTURE 155 TS kit component.",
  },
  {
    id: "k6plus-cps",
    name: "Crank position sensor (155 TS)",
    kind: "sensor",
    zone: "engine-rear",
    future: true,
    terminals: [
      t("sig", "Signal to k6plus-ecu.cps-in", ""),
      t("+5V", "5V ref from ECU", ""),
      t("gnd", "Ground to ECU", ""),
    ],
    note: "FUTURE 155 TS kit component.",
  },
  {
    id: "k6plus-tps",
    name: "Throttle position sensor (155 TS)",
    kind: "sensor",
    zone: "engine-rear",
    future: true,
    terminals: [
      t("sig", "Signal to k6plus-ecu.tps-in", ""),
      t("+5V", "5V ref from ECU", ""),
      t("gnd", "Ground to ECU", ""),
    ],
    note: "FUTURE 155 TS kit component.",
  },
  {
    id: "snd-temp-155",
    name: "Coolant temp sender (155 TS — different curve than Nord)",
    kind: "sender",
    zone: "engine-rear",
    future: true,
    terminals: [t("s", "Signal to EM1 pin 4", ""), t("g", "Ground to EM1 pin 5 (or block thread)", "")],
    note: "FUTURE — 155 TS-spec sender. Different resistance curve from Nord; calibration done in K6+ ECU + dash gauge (may need a calibration resistor).",
  },
  {
    id: "snd-oil-155",
    name: "Oil pressure sender (155 TS)",
    kind: "sender",
    zone: "engine-rear",
    future: true,
    terminals: [t("s", "Signal to EM1 pin 6 (via ECU pass-through)", ""), t("g", "Ground via block thread", "31")],
    note: "FUTURE — 155 TS-spec sender. The K6+ ECU pass-throughs the signal to the chassis gauge so calibration matches.",
  },
  {
    id: "sw-oillight-155",
    name: "Oil pressure warning switch (155 TS)",
    kind: "sender",
    zone: "engine-rear",
    future: true,
    terminals: [t("s", "Signal to EM1 pin 7", ""), t("g", "Ground via block thread", "31")],
    note: "FUTURE — 155 TS-spec warning switch.",
  },
  {
    id: "alternator-155",
    name: "Alternator (155 TS — bolt-on with engine)",
    kind: "alternator",
    zone: "engine-rear",
    future: true,
    terminals: [
      t("B+", "Battery charge output (direct stud-mount cable to battery, NOT via EM1)", "B+"),
      t("D+", "Warning-lamp / excitation (to EM1 pin 8)", "D+"),
      t("g", "Case ground (engine block bond)", "31"),
    ],
    note: "FUTURE — bolts to the 155 TS engine, swaps with the engine. Same chassis interface as the Nord alternator (D+ to EM1 pin 8, B+ direct to battery, case ground via engine block).",
  },
  {
    id: "starter-155",
    name: "Starter motor (155 TS — bolt-on with engine)",
    kind: "motor",
    zone: "engine-rear",
    future: true,
    terminals: [
      t("30", "Battery + (heavy stud, NOT via EM1)", "30"),
      t("50", "Solenoid trigger from EM1 pin 9", "50"),
    ],
    note: "FUTURE — bolts to the 155 TS engine. Same chassis interface as the Nord starter (50 trigger from EM1 pin 9, 30 direct to battery).",
  },
  {
    id: "em1",
    name: "Engine-management interface (chassis ↔ engine module)",
    kind: "connector",
    zone: "engine-rear",
    terminals: [
      t("pin-1", "+12V ignition supply (HIGH gauge — sized for K6+ peak)", ""),
      t("pin-2", "Engine ground return (HIGH gauge — clean ground for ECU/amps)", ""),
      t("pin-3", "Tach signal (← Nord coil.1 / ← K6+ tach-out)", ""),
      t("pin-4", "Coolant temp signal", ""),
      t("pin-5", "Coolant temp ground", ""),
      t("pin-6", "Oil pressure gauge signal", ""),
      t("pin-7", "Oil pressure warning lamp", ""),
      t("pin-8", "Alternator D+ (charge lamp / excitation)", ""),
      t("pin-9", "Starter solenoid trigger (DIN 50)", ""),
      t("pin-10", "(Nord: unused) / (155: ECU fan trigger)", ""),
      t("pin-11", "(Nord: unused) / (155: CTS pass-through)", ""),
      t("pin-12", "Spare (both engines)", ""),
    ],
    note: "The single 12-way Metri-Pack 280 boundary connector between the chassis loom and whatever engine is fitted. Chassis side = MALE pins (permanent, protected from shorts when engine disconnected); engine module side = FEMALE mating half (swappable). Pin functions are FIXED on the chassis side — both engine modules (engine-nord today, engine-155ts future) plug into the same chassis pin assignments. Each engine module wires its mating face to USE, REPURPOSE, or leave OPEN each pin per its needs. Today's Nord engine uses pins 1-9; future K6+ uses pins 1-12. The same chassis loom serves both, swap is unplug-one-plug-the-other. See ARCHITECTURE.md §4 for the canonical pin map.",
  },
  {
    id: "alternator",
    name: "Alternator (internally regulated)",
    kind: "alternator",
    zone: "engine-rear",
    terminals: [
      t("B+", "Battery charge output", "B+"),
      t("D+", "Warning-lamp / excitation", "D+"),
      t("g", "Case ground", "31"),
    ],
    note: "Replaces the factory dynamo + external voltage regulator (now removed). B+ to battery via mega-fuse; D+ drives the charge warning lamp.",
  },
  {
    id: "starter",
    name: "Starter motor + solenoid",
    kind: "motor",
    zone: "engine-rear",
    terminals: [t("B+", "Heavy battery feed", "30"), t("50", "Solenoid trigger (crank)", "50")],
  },
  {
    id: "coil",
    name: "Ignition coil",
    kind: "coil",
    zone: "engine-rear",
    terminals: [t("15", "Coil + (ignition feed)", "15"), t("1", "Coil − (to distributor / tach)", "1")],
  },
  {
    id: "dist",
    name: "Distributor",
    kind: "coil",
    zone: "engine-rear",
    terminals: [t("1", "Points / module to coil −", "1")],
  },
];

// ---------------------------------------------------------------------------
// Ignition switch — 4 positions. Position I (first detent) provides the
// "lights enable" feed the user wants for the headlamps.
// ---------------------------------------------------------------------------
const ignitionSwitch: SwitchComponent = {
  id: "ign-switch",
  name: "Ignition switch",
  kind: "ignition-switch",
  zone: "dash",
  terminals: [
    t("30", "Constant battery in", "30"),
    t("15", "RUN out — ignition + headlight enable", "15"),
    t("50", "START out — cranking", "50"),
  ],
  positions: [
    { name: "Off", closes: [] },
    { name: "Run", closes: [["30", "15"]], note: "Feeds ignition AND the headlight-enable, so the beams need the key on." },
    {
      name: "Start",
      closes: [
        ["30", "15"],
        ["30", "50"],
      ],
      note: "Spring-returns to Run.",
    },
  ],
};

// ===========================================================================
// HEADLIGHTS & EXTERIOR LAMPS
// ===========================================================================
const lamps: DeviceComponent[] = [
  {
    id: "hl-L",
    name: "Headlight LEFT (H4)",
    kind: "lamp",
    zone: "engine-front",
    terminals: [t("56b", "Dip/low filament", "56b"), t("56a", "Main/high filament", "56a"), t("g", "Ground", "31")],
  },
  {
    id: "hl-R",
    name: "Headlight RIGHT (H4)",
    kind: "lamp",
    zone: "engine-front",
    terminals: [t("56b", "Dip/low filament", "56b"), t("56a", "Main/high filament", "56a"), t("g", "Ground", "31")],
  },
  {
    id: "park-fl",
    name: "Front position/park LEFT",
    kind: "lamp",
    zone: "engine-front",
    terminals: [t("58", "Position feed", "58"), t("g", "Ground", "31")],
  },
  {
    id: "park-fr",
    name: "Front position/park RIGHT",
    kind: "lamp",
    zone: "engine-front",
    terminals: [t("58", "Position feed", "58"), t("g", "Ground", "31")],
  },
  {
    id: "turn-fl",
    name: "Front turn LEFT",
    kind: "lamp",
    zone: "engine-front",
    terminals: [t("L", "Left flash feed", "C2"), t("g", "Ground", "31")],
  },
  {
    id: "turn-fr",
    name: "Front turn RIGHT",
    kind: "lamp",
    zone: "engine-front",
    terminals: [t("R", "Right flash feed", "C3"), t("g", "Ground", "31")],
  },
  {
    id: "side-l",
    name: "Side marker/repeater LEFT (front fender)",
    kind: "lamp",
    zone: "engine-front",
    terminals: [t("in", "Flash feed (with LH turn)", "C2"), t("g", "Ground", "31")],
    note: "Factory 'Side Signal'. Wired as an EU repeater (flashes with the indicator). For a steady US-style marker, feed from the position circuit instead.",
  },
  {
    id: "side-r",
    name: "Side marker/repeater RIGHT (front fender)",
    kind: "lamp",
    zone: "engine-front",
    terminals: [t("in", "Flash feed (with RH turn)", "C3"), t("g", "Ground", "31")],
    note: "Factory 'Side Signal'. Repeater wiring — see side-l.",
  },
  {
    id: "tail-rl",
    name: "Tail/position + brake LEFT",
    kind: "lamp",
    zone: "rear",
    terminals: [t("58", "Tail/position", "58"), t("54", "Brake/stop", "54"), t("g", "Ground", "31")],
  },
  {
    id: "tail-rr",
    name: "Tail/position + brake RIGHT",
    kind: "lamp",
    zone: "rear",
    terminals: [t("58", "Tail/position", "58"), t("54", "Brake/stop", "54"), t("g", "Ground", "31")],
  },
  {
    id: "turn-rl",
    name: "Rear turn LEFT",
    kind: "lamp",
    zone: "rear",
    terminals: [t("L", "Left flash feed", "C2"), t("g", "Ground", "31")],
  },
  {
    id: "turn-rr",
    name: "Rear turn RIGHT",
    kind: "lamp",
    zone: "rear",
    terminals: [t("R", "Right flash feed", "C3"), t("g", "Ground", "31")],
  },
  {
    id: "plate",
    name: "Number-plate light LEFT",
    kind: "lamp",
    zone: "rear",
    terminals: [t("58", "Position feed", "58"), t("g", "Ground", "31")],
  },
  {
    id: "plate-r",
    name: "Number-plate light RIGHT",
    kind: "lamp",
    zone: "rear",
    terminals: [t("58", "Position feed", "58"), t("g", "Ground", "31")],
    note: "Factory car has two plate lamps (split across fuses 4 & 5 originally).",
  },
  {
    id: "reverse",
    name: "Reverse light",
    kind: "lamp",
    zone: "rear",
    terminals: [t("in", "Reverse feed", "61"), t("g", "Ground", "31")],
  },
];

// ===========================================================================
// HORNS
// ===========================================================================
const horns: DeviceComponent[] = [
  {
    id: "horn-hi",
    name: "Horn (high tone)",
    kind: "horn",
    zone: "engine-front",
    terminals: [t("in", "Power", "85?"), t("g", "Ground", "31")],
  },
  {
    id: "horn-lo",
    name: "Horn (low tone)",
    kind: "horn",
    zone: "engine-front",
    terminals: [t("in", "Power", "85?"), t("g", "Ground", "31")],
  },
];

// ===========================================================================
// SWITCHES (column, dash) — most now only switch RELAY COILS.
// ===========================================================================
const switches: SwitchComponent[] = [
  {
    id: "sw-headlight",
    name: "Headlight switch (4-pin: dash knob OFF/PARK/HEADLIGHTS + dash lever UP/DOWN for dip/main)",
    kind: "switch",
    zone: "dash",
    terminals: [
      t("30", "Constant feed in (battery via constant bus)", "30"),
      t("58", "PARK out — key-off parking-light override", "58"),
      t("56b", "LOW out → low-beam relay coil (knob=HEADLIGHTS, lever=UP)", "56b"),
      t("56a", "HIGH out → high-beam relay coil (knob=HEADLIGHTS, lever=DOWN)", "56a"),
    ],
    positions: [
      { name: "Off", closes: [], note: "Nothing energised at the switch contacts." },
      { name: "Park", closes: [["30", "58"]], note: "PARK output hot — key-off parking-light override (trafikkreglene § 17 roadside-parking) OR redundant with auto-ign feed when key on." },
      { name: "Low", closes: [["30", "56b"]], note: "LOW output hot. Bulb lights ONLY when key on (LOW relay common ign-gated via f-ign-6). Daily-driving 'set and forget' position." },
      { name: "High", closes: [["30", "56a"]], note: "HIGH output hot. Mutually exclusive with LOW at the switch contacts (per AlfaBB confirmation 2026-05-28 — see task #17 closing note). Bulb lights regardless of key (HIGH relay common is constant via PDM) — works as emergency lighting key-off. The ONLY way both filaments light is to hold the column flash stalk while the dash switch is at LOW; the dash switch itself can never energise both outputs simultaneously." },
    ],
    note: "Period 4-pin dash assembly with mutually-exclusive contacts: only one of PARK / LOW / HIGH outputs can be hot at any time. Confirmed via AlfaBB thread responses (2026-05-28) — three independent enthusiasts (one with the same 1300 Junior 2-headlight, one with general 2-headlight switch knowledge, one with same-vintage Spider experience) all reported the same. The 4-headlight GTV variant has overlapping contacts (LOW stays on when HIGH is selected, so all 4 lamps light at high) — that's a different switch part, not this one. The only path to both H4 filaments lighting on this car is the column flash stalk (sw-flash) momentarily added on top of LOW — by design, like every car with flash-to-pass. All 4 wires signal-level (relay-coil triggers + park OR-input); switch carries no beam current except the PARK leg (~2 A continuous when engaged with key off).",
  },
  {
    id: "sw-flash",
    name: "Column flash-to-pass (column lever, separate from turn contacts)",
    kind: "switch",
    zone: "dash",
    terminals: [
      t("in", "Constant feed in (key-independent)", "15a"),
      t("out", "→ high-beam relay coil (OR'd with HL switch HIGH)", "56a"),
    ],
    positions: [
      { name: "Released", closes: [] },
      { name: "Flash", closes: [["in", "out"]], note: "Spring-loaded — push column lever forward = momentary high beams, regardless of dash switch position or key state." },
    ],
    note: "Physically the same column lever as sw-turn (turn signals), but a separate set of electrical contacts. Modelled as its own component to keep the wire topology honest. OR'd with sw-headlight.56a at the high-beam relay coil — no diode needed because both sources are fed from the same constant bus (f-con-5), so closing either path lands the same +12 V at the same coil terminal with no back-feed to isolate (unlike the hazard/turn case where the two sources are constant vs ign and DO need diodes). DELIBERATE DEVIATION FROM FACTORY: factory 105/115 wiring flashes LOW beams on stalk-push (confirmed via AlfaBB threads + '67 Step nose owner report, 2026-05-28). We flash HIGH instead because: (a) HIGH is more visible as a daylight warning, (b) it integrates cleanly with our asymmetric ign-gating (rly-high common is constant from the PDM, rly-low is ign-gated — flash-LOW would force a tradeoff), (c) matches every modern car's stalk expectation. See PHYSICAL-TODO.md for the verification trail.",
  },
  {
    id: "sw-turn",
    name: "Turn-signal switch (column) — WEAK CONTACT",
    kind: "switch",
    zone: "dash",
    terminals: [t("in", "Ignition feed (coil select)", "15"), t("L", "Left → turn-L relay coil", "C2"), t("R", "Right → turn-R relay coil", "C3")],
    positions: [
      { name: "Centre", closes: [] },
      { name: "Left", closes: [["in", "L"]] },
      { name: "Right", closes: [["in", "R"]] },
    ],
    note: "Known poor contact — so it now carries ONLY relay-coil current (≈0.15 A). The flasher feeds the relay COMMONS (flashing); this switch just selects which coil. Ignition-fed, so turns only work key-on.",
  },
  {
    id: "sw-hazard",
    name: "Hazard switch (added — in the old cigar-lighter location)",
    kind: "switch",
    zone: "dash",
    terminals: [t("30", "Constant feed", "30"), t("L", "→ turn-L relay coil", "C2"), t("R", "→ turn-R relay coil", "C3"), t("tell", "Tell-tale", "")],
    note: "Not in the factory diagram. Fitted where the cigar lighter used to be; the lighter/aux circuit is removed.",
    positions: [
      { name: "Off", closes: [] },
      { name: "On", closes: [["30", "L"], ["30", "R"], ["30", "tell"]], note: "Energises BOTH turn relays via isolating diodes." },
    ],
  },
  {
    id: "sw-wiper",
    name: "Wiper switch (3-position) — DEDICATED, low-current",
    kind: "switch",
    zone: "dash",
    terminals: [t("in", "Ignition feed (coil supply)", "15"), t("low", "→ wiper-LOW relay coil", ""), t("high", "→ wiper-HIGH relay coil", "")],
    positions: [
      { name: "Off", closes: [], note: "Both wiper relays de-energised → LOW relay NC contact feeds 53a so the motor self-parks." },
      { name: "Low", closes: [["in", "low"]] },
      { name: "High", closes: [["in", "high"]] },
    ],
    note: "Vintage-style switch — carries only relay-coil current. The wiper-LOW (with self-park) and wiper-HIGH relays carry the Bosch motor (DIN 53/53b/53a/31).",
  },
  {
    id: "sw-instr",
    name: "Instrument-light switch (3-position)",
    kind: "switch",
    zone: "dash",
    terminals: [t("in", "Position-I feed", "58"), t("dim", "→ dimmer DIM preset", ""), t("bright", "→ dimmer BRIGHT preset", "")],
    positions: [
      { name: "Off", closes: [] },
      { name: "Dim", closes: [["in", "dim"]] },
      { name: "Bright", closes: [["in", "bright"]] },
    ],
    note: "Fed from ignition position I so the panel lights come up at the first key detent. Drives the instrument-light PWM dimmer: Dim/Bright pick two brightness presets and the dimmer carries the lamp feed as one circuit to all gauges.",
  },
  {
    id: "sw-heaterfan",
    name: "Heater-fan switch (3-position) — DEDICATED, low-current",
    kind: "switch",
    zone: "dash",
    terminals: [t("in", "Ignition feed (coil/enable supply)", "15"), t("low", "→ PWM/resistor ENABLE (low current)", ""), t("high", "→ fan relay coil", "")],
    positions: [
      { name: "Off", closes: [] },
      { name: "Low", closes: [["in", "low"]], note: "Enables the PWM/resistor module — which carries the motor current, not the switch." },
      { name: "High", closes: [["in", "high"]] },
    ],
    note: "Vintage-style switch — carries only coil/enable current, never the blower motor. HIGH → fan relay; LOW → PWM/resistor module enable.",
  },
  {
    id: "sw-brake",
    name: "Brake-light switch (primary hydraulic pressure switch)",
    kind: "switch",
    zone: "engine-rear",
    terminals: [t("in", "Constant feed", "30"), t("out", "To brake lamps", "54")],
    positions: [
      { name: "Released", closes: [] },
      { name: "Pressed", closes: [["in", "out"]] },
    ],
    note: "Hydraulic pressure switch on the master cylinder. Brake lights kept on constant feed so they work key-off. Factory wiring uses TWO switches in parallel (one per brake circuit) so a single hydraulic-circuit failure doesn't kill the brake lamps — sw-brake-2 is the future-provisioned twin; the harness has the jumper wires pre-run so adding the second switch is plug-in.",
  },
  {
    id: "sw-brake-2",
    name: "Brake-light switch — REAR circuit (future / parallel redundancy)",
    kind: "switch",
    zone: "engine-rear",
    future: true,
    terminals: [t("in", "Constant feed (paralleled with sw-brake)", "30"), t("out", "To brake lamps (paralleled with sw-brake)", "54")],
    positions: [
      { name: "Released", closes: [] },
      { name: "Pressed", closes: [["in", "out"]] },
    ],
    note: "Future-provisioned twin to sw-brake. Wired in parallel — same input from f-con-3, same output to the brake-lamp feed. Period-correct safety redundancy: factory 105/115 has BOTH switches so a single hydraulic-circuit failure (front OR rear) still triggers the brake lamps via the surviving circuit. Harness today: jumper wires w-brake-in-2 + w-brake-out-2 are pre-run from sw-brake's spades to where this second switch will sit, terminated with sealed caps. When the second pressure switch is bought (modern hydraulic-pressure switch sized for ~5 bar, two-spade), it plugs in — no harness cuts needed.",
  },
  {
    id: "sw-brake-diff",
    name: "Brake-failure differential pressure switch (future / master cylinder)",
    kind: "switch",
    zone: "engine-rear",
    future: true,
    terminals: [
      t("in", "From wl-brake.s (lamp ground side)", ""),
      t("out", "Chassis ground (closes when circuits diverge)", "31"),
    ],
    positions: [
      { name: "OK", closes: [], note: "Brake circuits in normal balance — differential piston centred, switch open." },
      { name: "Failed", closes: [["in", "out"]], note: "One brake circuit has lost pressure — differential piston off-centre, switch closed, lamp grounded → wl-brake lights." },
    ],
    note: "Period-correct brake-failure warning: a piston in the master-cylinder body senses pressure differential between the two hydraulic circuits. If one fails, the piston shifts off-centre and closes the switch, lighting wl-brake on the dash. Future-provisioned — the sense wire w-wlbrake-sense + ground wire w-brakediff-gnd are pre-run; switch (typically a brass body that screws into the master cylinder differential bore) plugs in when fitted.",
  },
  {
    id: "sw-reverse",
    name: "Reverse switch (gearbox)",
    kind: "switch",
    zone: "engine-rear",
    terminals: [t("in", "Ignition feed", "15"), t("out", "To reverse lamp", "61")],
    positions: [
      { name: "Not reverse", closes: [] },
      { name: "Reverse", closes: [["in", "out"]] },
    ],
  },
  {
    id: "sw-horn",
    name: "Horn button",
    kind: "switch",
    zone: "dash",
    terminals: [t("in", "From horn-relay coil", "86"), t("g", "Ground", "31")],
    positions: [
      { name: "Released", closes: [] },
      { name: "Pressed", closes: [["in", "g"]], note: "Grounds the horn-relay coil — switch only carries coil current." },
    ],
  },
  {
    id: "sw-washer",
    name: "Washer push button (momentary, period-correct)",
    kind: "switch",
    zone: "dash",
    terminals: [t("in", "Ignition feed (low current)", ""), t("out", "→ washer-pump relay coil", "")],
    positions: [
      { name: "Released", closes: [] },
      { name: "Pressed", closes: [["in", "out"]], note: "Triggers the washer-pump relay coil only — the vintage button carries no load." },
    ],
    note: "Period-correct dash button kept as a LOW-CURRENT TRIGGER: it drives rly-washer and the modern electric pump hides behind the relay (vintage look, no load on the button). Factory foot pump retired. Relay + pump install is DEFERRED — provisioned and capped; fitting is plug-in.",
  },
];

// ===========================================================================
// WIPER / WASHER / HEATER FAN
// ===========================================================================
const motors: DeviceComponent[] = [
  {
    id: "wiper",
    name: "Wiper motor (Bosch-type, 2-speed self-park, DIN 72552 pinout)",
    kind: "motor",
    zone: "engine-rear",
    terminals: [
      t("53", "Low speed +", "53"),
      t("53b", "High speed +", "53b"),
      t("53a", "Park switch feed", "53a"),
      t("31", "Ground", "31"),
    ],
    note: "Harness wired for the FULL 4-wire DIN-72552 Bosch topology (53/53a/53b/31) — the modern replacement Bosch motors sold for 105/115 cars by Classic Alfa, Alfaholics, Centerline etc. all expose these 4 pins. The SPDT rly-wlow (87 → 53 energised, 87a → 53a de-energised) provides the park-return path back to the motor's internal park-cam contact, giving full self-park. 3-WIRE compatibility: an original 3-wire Bosch motor (e.g. 0 390 326 002, Alfa PN 105 02 65 052 04, common on the 1960s/early-1970s 105 cars) omits 53a — leave w-wpark-out unconnected at the motor end (cap + heat-shrink) and the other three wires (53/53b/31) still work. CAVEAT: without the 53a return, those motors lose external self-park; they stop wherever the switch was released. Some 3-wire variants self-park internally via a different mechanism — verify against the specific motor's data sheet. If you're sourcing a motor now, the 4-wire variant is the safer choice for full functionality with this harness; see PHYSICAL-TODO.md for the verification checklist.",
  },
  {
    id: "washer-pump",
    name: "Washer pump (electric — install deferred)",
    kind: "pump",
    zone: "engine-rear",
    future: true,
    terminals: [t("53c", "Power (from washer relay)", "53c"), t("g", "Ground", "31")],
  },
  {
    id: "heater-fan",
    name: "Heater blower fan (single speed)",
    kind: "motor",
    zone: "engine-rear",
    terminals: [t("in", "Power (from fan relay)", "30"), t("g", "Ground", "31")],
  },
  {
    id: "fan-resistor",
    name: "Heater-fan PWM / resistor module (low speed, optional)",
    kind: "resistor",
    zone: "engine-rear",
    future: true,
    terminals: [
      t("en", "Enable — from switch LOW (low current)", ""),
      t("pwr", "Power in — high current (ign bus)", "30"),
      t("out", "To blower motor", ""),
    ],
    note: "Carries the blower current at reduced speed; the switch only supplies the low-current enable. Omit if you don't want a low speed.",
  },
  {
    id: "instr-pwm",
    name: "Instrument-light PWM dimmer module",
    kind: "resistor",
    zone: "engine-rear",
    terminals: [
      t("lo", "In — DIM preset (from switch)", ""),
      t("hi", "In — BRIGHT preset (from switch)", ""),
      t("out", "To panel illumination (single circuit)", "58"),
      t("g", "Ground reference", "31"),
    ],
    note: "Mounts on the loom/firewall side with the 3-way switch cluster (so the switches signal only the main loom). The switch powers one of two preset inputs (Dim/Bright); the module PWMs a single output that crosses into the dash and daisy-chains every gauge's illumination lamp. (Prefer a rotary-knob dimmer? Wire the switch as plain Off/On into one input and set brightness on the knob.)",
  },
];

// ===========================================================================
// GAUGES / WARNING LAMPS / SENDERS
// ===========================================================================
const instruments: DeviceComponent[] = [
  {
    id: "g-fuel",
    name: "Fuel gauge (Veglia)",
    kind: "gauge",
    zone: "dash",
    terminals: [t("+", "Ignition feed", "15"), t("s", "Tank sender signal", ""), t("ill", "Illumination", "58"), t("g", "Ground", "31")],
  },
  {
    id: "g-temp",
    name: "Coolant-temp gauge",
    kind: "gauge",
    zone: "dash",
    terminals: [t("+", "Ignition feed", "15"), t("s", "Temp sender signal", ""), t("ill", "Illumination", "58"), t("g", "Ground", "31")],
  },
  {
    id: "g-oil",
    name: "Oil-pressure gauge",
    kind: "gauge",
    zone: "dash",
    terminals: [t("+", "Ignition feed", "15"), t("s", "Oil sender signal", ""), t("ill", "Illumination", "58"), t("g", "Ground", "31")],
  },
  {
    id: "g-speedo",
    name: "Speedometer",
    kind: "gauge",
    zone: "dash",
    terminals: [t("ill", "Illumination", "58"), t("g", "Ground", "31")],
    note: "Mechanical (cable) — electrically only illumination + tell-tales housed here.",
  },
  {
    id: "g-tach",
    name: "Tachometer (mechanical cable-driven)",
    kind: "gauge",
    zone: "dash",
    terminals: [t("+", "Ignition feed", "15"), t("ill", "Illumination", "58"), t("g", "Ground", "31")],
    note: "Mechanical cable-driven from the cam/distributor today (Nord). The 155 TS swap retains the mechanical tach via a gear adapter on the 155 engine — not a harness concern. EM1 pin 3 reserved as spare in case a future electric-tach gauge is fitted.",
  },
  {
    id: "wl-oil",
    name: "Warning — oil pressure",
    kind: "warning-light",
    zone: "dash",
    terminals: [t("+", "Ignition feed", "15"), t("s", "From oil-pressure switch", "")],
  },
  {
    id: "wl-brake",
    name: "Warning — brake failure (future)",
    kind: "warning-light",
    zone: "dash",
    future: true,
    terminals: [t("+", "Ignition feed (daisy off wl-charge.+)", "15"), t("s", "To brake-failure differential pressure switch (lamp ground side)", "")],
    note: "Future-provisioned brake-failure warning lamp. Lights red when sw-brake-diff (master-cylinder differential pressure switch) closes — i.e. one of the two hydraulic circuits has lost pressure. Feed daisy-chains off the existing warning-lamp jumper at the dash (wl-charge.+ → wl-brake.+ via w-wlbrake-feed); sense wire crosses bh1 to sw-brake-diff on the master cylinder. Lamp + switch + wires pre-provisioned today; lamp is a standard red dash-warning unit (e.g. Veglia 24 mm red lens or modern LED equivalent).",
  },
  {
    id: "wl-charge",
    name: "Warning — charge (alternator)",
    kind: "warning-light",
    zone: "dash",
    terminals: [t("+", "Ignition feed", "15"), t("d", "To alternator D+", "D+")],
    note: "Excites the alternator and lights until it charges.",
  },
  {
    id: "wl-main",
    name: "Tell-tale — main beam (blue)",
    kind: "warning-light",
    zone: "dash",
    terminals: [t("in", "From high-beam feed", "56a"), t("g", "Ground", "31")],
  },
  {
    id: "wl-turn",
    name: "Tell-tale — turn (green)",
    kind: "warning-light",
    zone: "dash",
    terminals: [t("in", "Flash feed (L or R, OR-ed via diodes)", "C2"), t("g", "Ground", "31")],
    note: "ONE lamp fed from BOTH turn outputs through isolation diodes (d-tell-L/R) into a shared node, then grounded — the diodes stop one side back-feeding the other's lamps via this common node.",
  },
  {
    id: "snd-temp",
    name: "Coolant-temp sender",
    kind: "sender",
    zone: "engine-rear",
    terminals: [t("s", "Signal", ""), t("g", "Ground (block)", "31")],
  },
  {
    id: "snd-oil",
    name: "Oil-pressure gauge sender",
    kind: "sender",
    zone: "engine-rear",
    terminals: [t("s", "Signal", ""), t("g", "Ground (block)", "31")],
  },
  {
    id: "sw-oillight",
    name: "Oil-pressure warning switch",
    kind: "sender",
    zone: "engine-rear",
    terminals: [t("s", "Switched to ground at low pressure", "")],
  },
  {
    id: "snd-fuel",
    name: "Fuel-tank sender",
    kind: "sender",
    zone: "rear",
    terminals: [t("s", "Signal", ""), t("g", "Ground", "31")],
  },
];

// ===========================================================================
// COMFORT / MISC
// ===========================================================================
const comfort: (DeviceComponent | SwitchComponent)[] = [
  {
    id: "int-light",
    name: "Interior / courtesy light",
    kind: "lamp",
    zone: "cabin",
    terminals: [t("+", "Constant feed", "30"), t("sw", "Door-switch ground", "31")],
  },
  {
    id: "usb-charge",
    name: "USB-C charge port (12 V → USB-C PD converter)",
    kind: "socket",
    zone: "dash",
    terminals: [t("in", "12 V feed (ignition-switched)", "15"), t("g", "Ground", "31")],
    note: "Modern USB-C fast-charge converter on the dash — the electrical replacement for the deleted cigar lighter. On the shared Stereo/USB accessory circuit, IGNITION-switched (f-ign-3) so it only powers key-on — no key-off battery drain.",
  },
  {
    id: "stereo",
    name: "Stereo (Bluetooth amplifier + USB jack)",
    kind: "audio",
    zone: "dash",
    terminals: [t("+B", "12 V (ignition-switched)", "15"), t("g", "Ground", "31")],
    note: "A BT amplifier with a USB jack — no constant/memory lead needed, so it's simply IGNITION-on (on/off with the key). Jumpers off the USB accessory feed at the dash (one feed across the firewall). Speakers are outside harness scope.",
  },
  {
    id: "sw-door-l",
    name: "Door switch LEFT",
    kind: "switch",
    zone: "cabin",
    terminals: [t("in", "From interior light", ""), t("g", "Ground", "31")],
    positions: [
      { name: "Closed", closes: [] },
      { name: "Open", closes: [["in", "g"]] },
    ],
  },
  {
    id: "sw-door-r",
    name: "Door switch RIGHT",
    kind: "switch",
    zone: "cabin",
    terminals: [t("in", "From interior light", ""), t("g", "Ground", "31")],
    positions: [
      { name: "Closed", closes: [] },
      { name: "Open", closes: [["in", "g"]] },
    ],
  },
  {
    id: "flasher",
    name: "Turn/hazard flasher (electronic, LED, load-independent)",
    kind: "flasher",
    zone: "engine-front",
    terminals: [t("49", "Feed in", "49"), t("49a", "Flashing out", "49a"), t("31", "Ground", "31")],
    note: "MUST be electronic / load-independent — the indicators are LED, and this flasher feeds the turn-relay commons so it carries the (tiny) LED load; a thermal flasher won't flash on it. Mounts in rtmr-const cavity 5 (ISO-280 socket) using a Bussmann NO-762-LED: drop-in replacement for an ISO-280 relay, so it bypasses w-flasher-in entirely (cavity 30 = +12 bus, cavity 87 = flashing output, cavity 85 = ground via new w-flasher-gnd). The future washer relay was evicted from this cavity — when fitted, it goes external next to the RTMR. The weak column switch is unaffected — it only triggers the relay coils.",
  },
  {
    id: "fuel-pump",
    name: "Electric fuel pump",
    kind: "pump",
    zone: "rear",
    terminals: [t("in", "Power (from fuel relay)", "30"), t("g", "Ground", "31")],
  },
];

// ===========================================================================
// FUTURE — O2 / AFR
// ===========================================================================
const future: DeviceComponent[] = [
  {
    id: "o2-sensor",
    name: "Wideband O2 sensor (future — in exhaust)",
    kind: "sensor",
    zone: "engine-rear",
    future: true,
    terminals: [t("htr+", "Heater +", ""), t("htr-", "Heater −", ""), t("sig", "Signal to AFR gauge", ""), t("g", "Ground", "31")],
    note: "Mounted in the EXHAUST manifold / downpipe. The exhaust system stays with the car (it bolts to the chassis, not the engine), so the O2 sensor is a CHASSIS component — not part of either engine module. Single sensor regardless of which engine is fitted. Wired direct to the AFR gauge via BH1 (the gauge contains the wideband controller; sensor signal goes straight to gauge.sig). Capped pigtail until fitted.",
  },
  {
    id: "g-afr",
    name: "AFR gauge (future)",
    kind: "gauge",
    zone: "dash",
    future: true,
    terminals: [t("+", "Ignition feed", "15"), t("sig", "From O2 controller", ""), t("ill", "Illumination", "58"), t("g", "Ground", "31")],
  },
];

export const components: DeviceComponent[] = [
  ...power,
  ignitionSwitch,
  ...lamps,
  ...horns,
  ...switches,
  ...motors,
  ...instruments,
  ...comfort,
  ...future,
];

export const switchComponents = components.filter(
  (c): c is SwitchComponent => c.kind === "switch" || c.kind === "ignition-switch",
);
