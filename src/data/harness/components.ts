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
    name: "Ground — engine bay",
    kind: "ground",
    zone: "engine-front",
    terminals: [t("g", "Engine-bay star ground (to block + body)", "31")],
    note: "Bond to engine block and body. Alternator case + PDM grounds land here.",
  },
  {
    id: "gnd-dash",
    name: "Ground — dash",
    kind: "ground",
    zone: "dash",
    terminals: [t("g", "Dash star ground", "31")],
  },
  {
    id: "gnd-rear",
    name: "Ground — rear",
    kind: "ground",
    zone: "rear",
    terminals: [t("g", "Rear star ground (boot)", "31")],
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
    t("P1", "Position I out — lights enable / accessory", "15a"),
    t("15", "RUN out — ignition", "15"),
    t("50", "START out — cranking", "50"),
  ],
  positions: [
    { name: "0 — Off", closes: [] },
    { name: "I — Lights/Acc", closes: [["30", "P1"]], note: "First detent: energises the headlight-enable relay." },
    {
      name: "II — Run",
      closes: [
        ["30", "P1"],
        ["30", "15"],
      ],
    },
    {
      name: "III — Start",
      closes: [
        ["30", "P1"],
        ["30", "15"],
        ["30", "50"],
      ],
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
    name: "Headlight / position switch",
    kind: "switch",
    zone: "dash",
    terminals: [
      t("30c", "Constant in — position lamps", "30"),
      t("30i", "Ignition pos-I in — beam enable", "15a"),
      t("58", "Position lamps out", "58"),
      t("56", "Beam enable out → dip switch", "56"),
    ],
    positions: [
      { name: "Off", closes: [] },
      { name: "Position", closes: [["30c", "58"]] },
      { name: "Head", closes: [["30c", "58"], ["30i", "56"]] },
    ],
    note: "Dual-pole: position lamps run off CONSTANT (key-off OK); the beam-enable feed comes from ignition position I, so the beam relays can only fire with the key in. Carries only coil + small position-lamp current.",
  },
  {
    id: "sw-dipflash",
    name: "Dip / flash (column)",
    kind: "switch",
    zone: "dash",
    terminals: [
      t("56", "From headlight switch (Head-gated)", "56"),
      t("flash", "Flash feed — direct from ign pos-I", "15a"),
      t("56b", "Dip / low relay coil", "56b"),
      t("56a", "Main / high relay coil", "56a"),
    ],
    positions: [
      { name: "Dip", closes: [["56", "56b"]] },
      { name: "Main", closes: [["56", "56a"]] },
      { name: "Flash", closes: [["flash", "56a"]], note: "Spring-loaded flash-to-pass — fed straight from ign pos-I, so it works with the headlight switch OFF." },
    ],
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
    terminals: [t("in", "Position-I lights feed", "58"), t("dim", "Dim", "58d"), t("bright", "Bright", "58")],
    positions: [
      { name: "Off", closes: [] },
      { name: "Dim", closes: [["in", "dim"]] },
      { name: "Bright", closes: [["in", "bright"]] },
    ],
    note: "Fed from ignition position I so the panel lights come up at the first key detent. Dim position can go via a resistor if desired.",
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
    name: "Brake-light switch",
    kind: "switch",
    zone: "engine-rear",
    terminals: [t("in", "Constant feed", "30"), t("out", "To brake lamps", "54")],
    positions: [
      { name: "Released", closes: [] },
      { name: "Pressed", closes: [["in", "out"]] },
    ],
    note: "Brake lights kept on constant feed so they work key-off.",
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
];

// ===========================================================================
// WIPER / WASHER / HEATER FAN
// ===========================================================================
const motors: DeviceComponent[] = [
  {
    id: "wiper",
    name: "Wiper motor (Bosch-type, 2-speed self-park)",
    kind: "motor",
    zone: "engine-rear",
    terminals: [
      t("53", "Low speed +", "53"),
      t("53b", "High speed +", "53b"),
      t("53a", "Park switch feed", "53a"),
      t("31", "Ground", "31"),
    ],
  },
  {
    id: "washer-pump",
    name: "Washer pump",
    kind: "pump",
    zone: "engine-rear",
    terminals: [t("53c", "Power", "53c"), t("g", "Ground", "31")],
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
    name: "Tachometer",
    kind: "gauge",
    zone: "dash",
    terminals: [t("+", "Ignition feed", "15"), t("sig", "Coil − trigger", "1"), t("ill", "Illumination", "58"), t("g", "Ground", "31")],
  },
  {
    id: "wl-oil",
    name: "Warning — oil pressure",
    kind: "warning-light",
    zone: "dash",
    terminals: [t("+", "Ignition feed", "15"), t("s", "From oil-pressure switch", "")],
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
    id: "wl-park",
    name: "Tell-tale — position/parking (green)",
    kind: "warning-light",
    zone: "dash",
    terminals: [t("in", "From switched position feed", "58"), t("g", "Ground", "31")],
    note: "Factory dash had a parking-lights tell-tale alongside the main-beam one.",
  },
  {
    id: "wl-turn",
    name: "Tell-tale — turn (green)",
    kind: "warning-light",
    zone: "dash",
    terminals: [t("L", "Left flash", "C2"), t("R", "Right flash", "C3"), t("g", "Ground", "31")],
    note: "Fed from both turn outputs via diodes so one lamp shows either side.",
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
    name: "Turn/hazard flasher (electronic, load-independent)",
    kind: "flasher",
    zone: "dash",
    terminals: [t("49", "Feed in", "49"), t("49a", "Flashing out", "49a"), t("31", "Ground", "31")],
    note: "Electronic so it flashes correctly with the relay-driven, LED-capable load.",
  },
  {
    id: "fuel-pump",
    name: "Electric fuel pump",
    kind: "pump",
    zone: "rear",
    terminals: [t("in", "Power (from fuel relay)", "30"), t("g", "Ground", "31")],
  },
  {
    id: "fuel-safety",
    name: "Inertia / oil-pressure cut-off (recommended)",
    kind: "sensor",
    zone: "rear",
    future: true,
    terminals: [t("in", "Pump-relay coil", "86"), t("out", "Continue to ground/coil", "")],
    note: "Opens the pump-relay coil in a crash or with no oil pressure. See compliance: fuel-pump-cutoff.",
  },
];

// ===========================================================================
// FUTURE — O2 / AFR
// ===========================================================================
const future: DeviceComponent[] = [
  {
    id: "o2-sensor",
    name: "Wideband O2 sensor (future)",
    kind: "sensor",
    zone: "engine-rear",
    future: true,
    terminals: [t("htr+", "Heater +", ""), t("htr-", "Heater −", ""), t("sig", "Signal to controller", ""), t("g", "Ground", "31")],
    note: "Capped pigtail at the manifold until fitted.",
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
