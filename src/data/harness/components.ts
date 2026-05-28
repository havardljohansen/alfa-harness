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
    note: "Physically the same column lever as sw-turn (turn signals), but a separate set of electrical contacts. Modelled as its own component to keep the wire topology honest. Diode-OR'd with sw-headlight.56a at the high-beam relay coil so neither path back-feeds the other. DELIBERATE DEVIATION FROM FACTORY: factory 105/115 wiring flashes LOW beams on stalk-push (confirmed via AlfaBB threads + '67 Step nose owner report, 2026-05-28). We flash HIGH instead because: (a) HIGH is more visible as a daylight warning, (b) it integrates cleanly with our asymmetric ign-gating (rly-high common is constant from the PDM, rly-low is ign-gated — flash-LOW would force a tradeoff), (c) matches every modern car's stalk expectation. See PHYSICAL-TODO.md for the verification trail.",
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
