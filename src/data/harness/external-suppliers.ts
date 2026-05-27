// =============================================================================
// NOT-AT-MOUSER — suggested sources for the parts Mouser doesn't stock as
// finished products (PWM modules, the LED flasher, silicone wire, the classic
// stud ground busbars, Dymo cassettes, and the one-time tools). External
// aftermarket links — treat as references; find EU/Norway-local equivalents
// where freight/VAT make sense. `specs` lists the must-match figures so you
// don't buy the wrong variant.
// =============================================================================

export interface ExternalOption {
  name: string;
  url: string;
  note?: string;
}

export interface ExternalItem {
  id: string;
  item: string;
  why: string;
  specs: string;
  options: ExternalOption[];
}

export const externalSuggestions: ExternalItem[] = [
  {
    id: "instr-dimmer",
    item: "Instrument-light PWM dimmer (low current)",
    why: "Panel lamps are a small load — any 12 V rotary LED PWM dimmer works.",
    specs: "12 V; ≥3 A; LED-compatible PWM; rotary pot or knob; common-positive switching is fine (panel lamps).",
    options: [
      { name: "Abeltronics DIM12 (10 A, rotary)", url: "https://www.abeltronics.co.uk/products/led-dimmer-rotary-potentiometer-controlled-pwm-12v-24v-10a-low-voltage/dim12", note: "UK — ships EU" },
      { name: "Oznium 12 V LED dimmer knob", url: "https://www.oznium.com/switches/led-dimmer-knob" },
      { name: "Marinebeam 12-24 V PWM dimmer", url: "https://store.marinebeam.com/12-24v-pwm-digital-led-dimmer-module/", note: "marine-grade" },
    ],
  },
  {
    id: "fan-pwm",
    item: "Heater-fan speed controller",
    why: "Must be rated for an INDUCTIVE MOTOR load (a 'DC motor speed controller'), NOT a resistive LED-only dimmer — a motor will cook an LED unit. (Or use a fixed dropping resistor.)",
    specs: "12 V; ≥15 A continuous (blower draws ~5 A but allow inrush headroom); rated for DC MOTOR / inductive load; heatsinked.",
    options: [
      { name: "PWM DC motor speed controller, 20 A", url: "https://www.amazon.com/Controller-Variable-Regulator-Forward-Reverse-20A/dp/B0FGJYYC92", note: "motor-rated" },
      { name: "SuperLightingLED 8/16/30 A PWM", url: "https://www.superlightingled.com/dc1224v-max-8a-16a-30a-universal-pwm-mechanical-dimmer-with-manual-potentiometer-controller-for-quad-row-led-strip-lights-p-328.html" },
    ],
  },
  {
    id: "led-flasher",
    item: "Electronic LED flasher (load-independent)",
    why: "Indicators are LED and the flasher feeds the relay commons, so a thermal flasher won't work.",
    specs: "12 V; ELECTRONIC / load-independent (flashes 0 W–full); a standard 3-pin unit — 49 (in) / 49a (out) / 31 (gnd) — mounted beside the constant RTMR. (The in-block ISO-280 cavity is reserved for the future washer relay, so mount external.)",
    options: [
      { name: "Memotronics EF32RLNP", url: "https://www.amazon.com/EF32RLNP-Electronic-Compatible-APPROVED-INDEPENDENT/dp/B01GIU9M0Y", note: "2-pin + ground — mount beside the block" },
      { name: "Custom LED ELFR-1", url: "https://www.customled.com/products/elfr-1-electronic-led-flasher-relay" },
    ],
  },
  {
    id: "silicone-wire",
    item: "Silicone-insulated tinned-copper wire",
    why: "Heat-resistant + durable; Mouser is thin on bulk silicone spools.",
    specs: "Tinned copper, silicone insulation (150–200 °C), ≥600 V. Gauges to match the tiers: 0.75 mm² ≈ 18 AWG, 1.5 ≈ 16, 2.5 ≈ 14, 6 ≈ 10, 25 ≈ 4 AWG. NB silicone OD is fatter than PVC — drives the label/shrink size-up.",
    options: [
      { name: "BNTECHGO silicone wire (spools)", url: "https://bntechgo.com/", note: "200 °C, tinned, all gauges/colours, ships intl" },
      { name: "TUOFENG silicone wire (Amazon)", url: "https://www.amazon.com/TUOFENG-18-Stranded-Insulated-Automotive/dp/B07G744V5Z" },
      { name: "Local/EU auto-electrical supplier", url: "https://www.google.com/search?q=silikon+kabel+fortinnet+kobber+bil", note: "cheaper freight on bulk copper" },
    ],
  },
  {
    id: "ground-busbar",
    item: "Ground busbars (stud type)",
    why: "Mouser has terminal-block busbars; the classic multi-stud automotive/marine busbar is easier elsewhere.",
    specs: "HUB block: one M8 stud (battery − + engine strap, 16–25 mm² lugs), ≥100 A. MODULE blocks (front/dash/rear): M6 studs for the 6 mm² trunks + small device grounds. Match RING TERMINALS to stud × wire: 25 mm²→M8, 16 mm²→M8, 6 mm²→M6, lamp grounds (0.75–2.5 mm²)→M5/M6. Tinned, insulated boots on the heavy ones.",
    options: [
      { name: "MICTUNING bus-bar kit (studs + cover)", url: "https://www.amazon.com/MICTUNING-Terminal-Cover-Ground-Distribution/dp/B07NX6QF7W" },
      { name: "Blue Sea Systems 2300-series", url: "https://www.bluesea.com/products/category/3/19/Bus_Bars", note: "marine-grade; EU chandleries stock these" },
    ],
  },
  {
    id: "dymo",
    item: "Dymo Rhino printer + heat-shrink cassettes",
    why: "Label-supply item, not Mouser. (Printer only if you don't already own one.)",
    specs: "HEAT-SHRINK cassettes (not vinyl tape), black-on-white: 9 mm 18053 (0.75 mm² wire) + 12 mm 18055 (1.5–2.5 mm²); 19 mm 18057 + 24 mm 1805443 for the heavy feeds. Sized UP one step for the fatter silicone OD.",
    options: [
      { name: "Dymo Rhino heat-shrink range (dymo.eu)", url: "https://dymo.eu/labels-tapes/rhino-tapes/heat-shrink-tubing.html" },
      { name: "LabelCity 18053 (9 mm) / 18055 (12 mm)", url: "https://www.labelcity.com/RHINO-WHITE-HEAT-SHRINK-TUBES-18053" },
    ],
  },
  {
    id: "tools",
    item: "Specialty tools (one-time, source anywhere)",
    why: "MP280 open-barrel crimper, terminal-release tool, heavy-lug crimper, heat gun, multimeter/test light.",
    specs: "MP280 crimper: OPEN-BARREL ratchet, 0.3–3 mm² (double-crimp wire + seal). Lug crimper: hex/hydraulic, 6–25 mm². Heat gun for the Dymo shrink + adhesive shrink; DMM or 12 V test light for circuit checks.",
    options: [
      { name: "IWISS open-barrel ratchet crimper (MP280-class)", url: "https://www.amazon.com/s?k=IWISS+open+barrel+crimper+ratchet", note: "0.3–3 mm² dies" },
      { name: "Hydraulic/hex lug crimper (6–25 mm²)", url: "https://www.amazon.com/s?k=hex+lug+crimper+6-25mm2" },
    ],
  },
];
