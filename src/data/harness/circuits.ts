import type { Circuit } from "./types";

// ===========================================================================
// Logical circuits. `originalFuse` maps back to the factory 10-fuse legend.
// ===========================================================================
export const circuits: Circuit[] = [
  {
    id: "c-power",
    name: "Battery, main distribution & grounds",
    group: "power",
    description:
      "Battery → main junction → fuse-block bus feeds. Dedicated star grounds in engine bay, dash and rear replace reliance on body return paths.",
    status: "upgrade",
  },
  {
    id: "c-charging",
    name: "Charging (alternator)",
    group: "charging",
    description:
      "Internally-regulated alternator. B+ to battery via mega-fuse; D+ excites and drives the charge warning lamp. Factory dynamo + external regulator removed.",
    status: "upgrade",
    compliance: ["alternator-swap"],
  },
  {
    id: "c-starting",
    name: "Starting",
    group: "starting",
    description: "Ignition position III (DIN 50) triggers the starter solenoid. Optional interlock via spare relay.",
    status: "core",
  },
  {
    id: "c-ignition",
    name: "Ignition (coil) + main relay",
    group: "ignition",
    description:
      "Ignition switch triggers the ignition main relay, which feeds the whole ignition bus. Coil + distributor + tach trigger.",
    status: "upgrade",
    originalFuse: "—",
  },
  {
    id: "c-headlights",
    name: "Headlights (relay-driven, ign-gated)",
    group: "headlights",
    description:
      "Headlight-enable relay (ign position I) → low-beam & high-beam relays in the PDM → H4 L/R. Flash-to-pass on the dip switch. Blue main-beam tell-tale.",
    status: "upgrade",
    originalFuse: "7,8,9,10",
    compliance: ["headlights-ign-gated", "required-lighting"],
  },
  {
    id: "c-position",
    name: "Position / tail / plate lights",
    group: "exterior-lights",
    description: "Front position + rear tail + number-plate lights — IGNITION-fed running lights: on with the key, no switch (the light switch only does headlights). Loses key-off parking lights, but the headlight switch carries zero load.",
    status: "core",
    originalFuse: "4,5",
    compliance: ["required-lighting", "indicator-colour"],
  },
  {
    id: "c-turn",
    name: "Turn signals (relay-driven)",
    group: "signals",
    description:
      "Electronic flasher → turn-L / turn-R relay commons. The weak column switch only triggers the coils. Green tell-tale fed from both sides via diodes.",
    status: "upgrade",
    originalFuse: "3",
    compliance: ["indicator-colour"],
  },
  {
    id: "c-hazard",
    name: "Hazard flashers (added)",
    group: "signals",
    description: "Hazard switch energises BOTH turn relays simultaneously via isolating signal diodes.",
    status: "upgrade",
    compliance: ["hazard-add"],
  },
  {
    id: "c-brake",
    name: "Brake lights",
    group: "signals",
    description: "Brake switch on the constant bus → rear stop filaments. Works key-off.",
    status: "core",
    originalFuse: "2",
    compliance: ["required-lighting"],
  },
  {
    id: "c-reverse",
    name: "Reverse light",
    group: "signals",
    description: "Gearbox switch on the ignition bus → reverse lamp.",
    status: "core",
    originalFuse: "4",
  },
  {
    id: "c-instruments",
    name: "Gauges, senders, warning & panel lights",
    group: "instruments",
    description:
      "Fuel, coolant-temp, oil-pressure gauges + senders; tachometer from coil −; oil & charge warning lamps; panel illumination fed from ignition position I.",
    status: "core",
    originalFuse: "6,1",
  },
  {
    id: "c-wipers",
    name: "Wipers + washer (2-speed self-park)",
    group: "wipers",
    description:
      "Bosch-type 2-speed self-parking motor (DIN 53/53b/53a/31). Dedicated 3-position switch; self-park relay holds power until rest.",
    status: "upgrade",
    originalFuse: "2",
  },
  {
    id: "c-cooling",
    name: "Heater blower fan",
    group: "cooling",
    description: "Single-speed blower, relay-driven. 3-position switch: off / low (resistor or PWM) / high.",
    status: "upgrade",
    originalFuse: "3",
  },
  {
    id: "c-fuel",
    name: "Electric fuel pump",
    group: "fuel",
    description: "Relay-driven, ignition-switched, through an inertia/oil-pressure safety cut-off.",
    status: "upgrade",
    compliance: ["fuel-pump-cutoff"],
  },
  {
    id: "c-horn",
    name: "Horns (relay-driven)",
    group: "comfort",
    description: "Horn relay carries the load; the button only grounds the coil.",
    status: "upgrade",
    originalFuse: "—",
  },
  {
    id: "c-interior",
    name: "Interior / courtesy light",
    group: "comfort",
    description: "Constant feed; door switches ground the lamp.",
    status: "core",
    originalFuse: "1",
  },
  {
    id: "c-accessory",
    name: "Stereo / USB accessory",
    group: "comfort",
    description: "Dash accessory feed — the USB-C fast-charge port + the Bluetooth-amp stereo. IGNITION-switched (on/off with the key): the stereo needs no memory and the USB can't drain the battery key-off. One feed across the firewall; the stereo jumpers off it at the dash.",
    status: "upgrade",
  },
  {
    id: "c-future-o2",
    name: "O2 sensor + AFR gauge (future)",
    group: "future",
    description:
      "Provisioned ignition-switched + fused circuit, ground and signal, with a capped pigtail at the manifold. Isolated until fitted.",
    status: "future",
    compliance: ["o2-future"],
  },
  {
    id: "c-future-spare",
    name: "Spare / expansion",
    group: "future",
    description: "Reserved fuse positions and connector pins for later additions (fog lights, etc.).",
    status: "future",
  },
];
