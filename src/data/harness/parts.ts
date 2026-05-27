import type { PartItem, BomGap } from "./types";

// ---------------------------------------------------------------------------
// Parts already owned — transcribed from the two Mouser orders in /reference.
//   Order 1: Invoice 77657766 (05-FEB-2024, USD)
//   Order 2: Invoice 87705868 (03-DEC-2025, NOK)
// Everything unifies on the Aptiv/Delphi Metri-Pack 280 terminal system, which
// is also what the Littelfuse PDM and Bussmann RTMRs accept at the rear.
// ---------------------------------------------------------------------------
export const ownedParts: PartItem[] = [
  // --- Power distribution -----------------------------------------------------
  {
    mfgPn: "PDM31002ZXM",
    mouserPn: "576-PDM31002ZXM",
    desc: "Littelfuse HWB18 hard-wired PDM — 9 circuit, 100 A, IP67/69K. MINI fuses + 4-pin SPST / 5-pin SPDT relays, Metri-Pack 280 rear terminals.",
    category: "distribution",
    qtyOwned: 1,
    unitPrice: 27.14,
    currency: "USD",
    order: "77657766",
    role: "Engine-bay HEADLIGHT power centre — holds the low/high-beam relays and the four beam fuses.",
  },
  {
    mfgPn: "15305-4-0-4",
    mouserPn: "504-15305-4-0-4",
    desc: "Bussmann/Eaton RTMR mini fuse/relay panel — NON-BUSSED, no input studs. IP66, MINI fuses + ISO-280 relays, Metri-Pack 280 rear terminals, 30 A/terminal.",
    category: "distribution",
    qtyOwned: 1,
    unitPrice: 29.81,
    currency: "USD",
    order: "77657766",
    role: "SURPLUS — not used in this harness. The design now runs on the PDM + two bussed RTMRs; the non-bussed panel isn't needed. Keep on the shelf as a spare / for a future independent-feed circuit.",
  },
  {
    mfgPn: "15306-2-2-4",
    mouserPn: "504-15306-2-2-4",
    desc: "Bussmann/Eaton RTMR fuse/relay panel — BUSSED (common input stud). IP66, MINI fuses + ISO-280 relays, Metri-Pack 280 rear terminals.",
    category: "distribution",
    qtyOwned: 2,
    unitPrice: 487.43, // NOK incl. VAT (per Order 2, qty 2 = 974.86)
    currency: "NOK",
    order: "87705868",
    role: "Two bussed centres — one CONSTANT (battery) bus, one IGNITION-switched bus (fed by the main ignition relay).",
  },

  // --- Relays -----------------------------------------------------------------
  {
    mfgPn: "301-1C-S-R1-12VDC",
    mouserPn: "893-301-1C-S-R1-12VD",
    desc: "Song Chuan ISO-280 micro relay — SPDT (1 Form C), 12 Vdc, 35 A.",
    category: "relay",
    qtyOwned: 5,
    unitPrice: 6.79,
    currency: "USD",
    order: "77657766",
    role: "Change-over relays: headlight enable, hi/lo, wiper self-park, starter interlock, + spare.",
  },
  {
    mfgPn: "301-1A-C-R1-U03-12VDC",
    mouserPn: "893-3011ACR1U0312VDC",
    desc: "Song Chuan ISO-280 micro relay — SPST (1 Form A), 12 Vdc, 35 A.",
    category: "relay",
    qtyOwned: 6,
    unitPrice: 38.98, // NOK incl. VAT
    currency: "NOK",
    order: "87705868",
    role: "On/off load relays: low beam, high beam, horn, heater fan, fuel pump, ignition main.",
  },

  // --- Inter-harness connectors (Metri-Pack 280 GT, sealed) -------------------
  {
    mfgPn: "15326915",
    mouserPn: "829-15326915",
    desc: "Aptiv/Delphi 12-way MALE GT 280 sealed connector.",
    category: "connector-housing",
    qtyOwned: 3,
    unitPrice: 3.01,
    currency: "USD",
    order: "77657766",
    role: "Male half of the three big bulkhead plugs (dash↔engine, etc.).",
  },
  {
    mfgPn: "15326910",
    mouserPn: "829-15326910",
    desc: "Aptiv/Delphi 12-way FEMALE GT 280 sealed connector.",
    category: "connector-housing",
    qtyOwned: 3,
    unitPrice: 3.37,
    currency: "USD",
    order: "77657766",
    role: "Female half of the three big bulkhead plugs.",
  },
  {
    mfgPn: "15436200",
    mouserPn: "829-15436200",
    desc: "Aptiv/Delphi secondary lock / TPA for GT 280 connector.",
    category: "lock",
    qtyOwned: 6,
    unitPrice: 0.832,
    currency: "USD",
    order: "77657766",
    role: "Terminal position assurance for the 6 connector halves.",
  },

  // --- Metri-Pack 280 terminals ----------------------------------------------
  {
    mfgPn: "12110847-L",
    mouserPn: "829-12110847",
    desc: "Aptiv/Delphi Metri-Pack 280 FEMALE terminal, tin.",
    category: "terminal",
    qtyOwned: 50,
    unitPrice: 0.382,
    currency: "USD",
    order: "77657766",
    role: "Female crimp terminals for connectors / fuse-block rear.",
  },
  {
    mfgPn: "12110845-L",
    mouserPn: "829-12110845",
    desc: "Aptiv/Delphi Metri-Pack 280 FEMALE terminal, tin (alt. wire range).",
    category: "terminal",
    qtyOwned: 25,
    unitPrice: 0.461,
    currency: "USD",
    order: "77657766",
    role: "Female crimp terminals (heavier wire range).",
  },
  {
    mfgPn: "12110843-L",
    mouserPn: "829-12110843-L",
    desc: "Aptiv/Delphi Metri-Pack 280 FEMALE terminal, tin.",
    category: "terminal",
    qtyOwned: 50,
    unitPrice: 0.364,
    currency: "USD",
    order: "77657766",
    role: "Female crimp terminals.",
  },
  {
    mfgPn: "15304724-L",
    mouserPn: "829-15304724",
    desc: "Aptiv/Delphi Metri-Pack 280 MALE terminal, tin.",
    category: "terminal",
    qtyOwned: 25,
    unitPrice: 0.348,
    currency: "USD",
    order: "77657766",
    role: "Male crimp terminals.",
  },
  {
    mfgPn: "15304731-L",
    mouserPn: "829-15304731",
    desc: "Aptiv/Delphi Metri-Pack 280 MALE terminal, tin.",
    category: "terminal",
    qtyOwned: 25,
    unitPrice: 0.386,
    currency: "USD",
    order: "77657766",
    role: "Male crimp terminals.",
  },
  {
    mfgPn: "15304730-L",
    mouserPn: "829-15304730",
    desc: "Aptiv/Delphi Metri-Pack 280 MALE terminal, tin.",
    category: "terminal",
    qtyOwned: 25,
    unitPrice: 0.389,
    currency: "USD",
    order: "77657766",
    role: "Male crimp terminals.",
  },

  // --- Single-wire seals ------------------------------------------------------
  {
    mfgPn: "15324982",
    mouserPn: "829-15324982",
    desc: "Aptiv/Delphi single-wire seal (cable seal).",
    category: "seal",
    qtyOwned: 100,
    unitPrice: 0.058,
    currency: "USD",
    order: "77657766",
    role: "Per-wire seal at each sealed connector cavity.",
  },
  {
    mfgPn: "15324981",
    mouserPn: "829-15324981",
    desc: "Aptiv/Delphi single-wire seal (cable seal).",
    category: "seal",
    qtyOwned: 50,
    unitPrice: 0.06,
    currency: "USD",
    order: "77657766",
    role: "Per-wire seal (alt. wire range).",
  },
  {
    mfgPn: "15324985",
    mouserPn: "829-15324985",
    desc: "Aptiv/Delphi single-wire seal (cable seal).",
    category: "seal",
    qtyOwned: 100,
    unitPrice: 0.125,
    currency: "USD",
    order: "77657766",
    role: "Per-wire seal.",
  },

  // --- Device-end spade terminals --------------------------------------------
  {
    mfgPn: "1217084-1",
    mouserPn: "571-1217084-1",
    desc: "TE/AMP 187-series (4.8 mm) faston receptacle.",
    category: "spade",
    qtyOwned: 15,
    unitPrice: 0.229,
    currency: "USD",
    order: "77657766",
    role: "Small spade terminations — gauges, senders, small switches.",
  },
  {
    mfgPn: "170187-2",
    mouserPn: "571-170187-2",
    desc: "TE/AMP 250-series (6.3 mm) faston receptacle.",
    category: "spade",
    qtyOwned: 50,
    unitPrice: 0.349,
    currency: "USD",
    order: "77657766",
    role: "Standard spade terminations — lamps, switches, horns, relays' device side.",
  },
];

// ---------------------------------------------------------------------------
// Gaps — what the harness needs that the two orders do NOT cover.
// ---------------------------------------------------------------------------
export const bomGaps: BomGap[] = [
  {
    id: "wire",
    item: "Silicone-insulated tinned-copper wire (single colour + Dymo labels)",
    qty: "≈ see length report — by gauge",
    category: "wire",
    reason:
      "Silicone-insulated tinned-copper chosen for heat resistance + long-term durability. One colour throughout — identity is the Dymo heat-shrink labels. Order by gauge tier: 0.75 / 1.5 / 2.5 / 6 / 25 mm² (totals on the Lengths page). Note: silicone insulation is FATTER than PVC/XLPE of the same gauge, which sizes up the label + heat-shrink (see the Dymo line).",
    suggestion: "Silicone tinned-copper, AWG matched to each gauge tier.",
  },
  {
    id: "mini-fuses",
    item: "MINI (ATM) blade fuses",
    qty: "1 set per fuse position + spares",
    category: "fuse",
    reason: "The PDM and RTMRs ship empty. Ratings are listed per position on the Fuses page.",
    suggestion: "Assorted 3/5/7.5/10/15/20/25 A MINI fuses.",
  },
  {
    id: "alt-charge",
    item: "Alternator B+ charge cable + ring terminals + fusible link / mega-fuse",
    qty: "1",
    category: "charging",
    reason:
      "Modern alternator is fitted; needs a 6 mm²+ B+ run to the battery/junction, protected by a mega-fuse or fusible link near the battery.",
    suggestion: "16 mm² (6 AWG) B+; 60–80 A mega-fuse at the battery.",
  },
  {
    id: "main-fusing",
    item: "MIDI/MEGA fuse holders + fuses at the battery (+ optional master cut-off)",
    qty: "2–3",
    category: "fuse",
    reason:
      "The battery→constant-bus and battery→PDM main feeds are otherwise unfused (fire risk). Add a ~60–80 A on the constant feed and ~40 A on the PDM feed, plus the alternator B+ mega-fuse. A battery master cut-off is a cheap classic-car safety add.",
    suggestion: "Littelfuse/Blue Sea MIDI holders; battery isolator switch.",
  },
  {
    id: "ground",
    item: "Ground blocks/busbars (×4) + thick trunk cable + ring terminals + engine-to-body strap",
    qty: "4 ground blocks (hub + front + dash + rear), 3 module trunks, 1 engine strap",
    category: "consumable",
    reason:
      "Each detachable module has its own ground block collecting that section's grounds, with ONE thick (≈6 mm²) trunk back to the engine-bay/battery hub. No body-as-return reliance. Hub→battery − is the heavy main bond.",
    suggestion: "Small brass/tinned busbars or M6 ground studs for the blocks; 6 mm² for the trunks, 16 mm² hub-to-battery.",
  },
  {
    id: "loom",
    item: "Convoluted tubing / grommets / cable ties / cloth loom tape",
    qty: "as needed",
    category: "consumable",
    reason: "Loom protection, bulkhead grommets, and cable ties + cloth loom tape to dress and secure the bundles. (Wire labels + the spade adhesive shrink are their own lines.)",
  },
  {
    id: "dymo-labels",
    item: "Dymo Rhino heat-shrink label cartridges — sized for the silicone wire",
    qty: "2–3× 9 mm (18053) + 2–3× 12 mm (18055); +1× 19 mm (18057) & 1× 24 mm (1805443) if labelling the heavy feeds",
    category: "consumable",
    reason:
      "One wire colour — the printed heat-shrink labels are the identity. Pick the cartridge whose RECOVERED Ø range covers the wire OD so it slides on then shrinks snug. Silicone insulation is fatter than PVC, so size UP one step. Recovered ranges: 6mm 18051 = 1.18–2.33, 9mm 18053 = 1.73–3.73, 12mm 18055 = 2.97–5.13, 19mm 18057 = 4.64–8.70, 24mm 1805443 = 6.00–11.0 mm. Silicone-adjusted mapping: 0.75 mm² → 9mm (18053); 1.5 + 2.5 mm² → 12mm (18055); 6 mm² → 19mm (18057); 25 mm² → 24mm (1805443). MEASURE your actual wire OD and confirm before buying.",
    suggestion:
      "DYMO Rhino 18053 (9 mm) + 18055 (12 mm) cover the signal/power wires; 18057 (19 mm) + 1805443 (24 mm) for the heavy feeds. https://dymo.eu/labels-tapes/rhino-tapes/heat-shrink-tubing.html",
  },
  {
    id: "heatshrink-spade",
    item: "Adhesive-lined heat-shrink (dual-wall, 3:1) for the spade terminations — sized",
    qty: "~3 m of ⌀9 mm + ~1 m of ⌀6 mm (≈133 ends + spares)",
    category: "consumable",
    reason:
      "Adhesive 3:1 shrink over each device-end faston crimp for insulation + strain relief. Size to the terminal series: ⌀9 mm (⅜″) over the 250-series (6.3 mm) fastons — the bulk (lamps/switches/horns/relay device side, 1.0–2.5 mm²); ⌀6 mm (¼″) over the 187-series (4.8 mm) fastons (gauges/small switches, 0.75 mm²). The 3:1 ratio lets it shrink from the wide crimp barrel down onto the thinner wire.",
    suggestion: "Dual-wall adhesive-lined 3:1, ⌀9 mm + ⌀6 mm. (Heavier ring/B+ ends use boots — see battery terminals.)",
  },
  {
    id: "battery-terminals",
    item: "Battery terminal clamps + heavy cable lugs/boots",
    qty: "2 posts + lugs",
    category: "consumable",
    reason: "The battery + (to PDM + constant bus + starter) and battery − (to the ground hub) need proper post clamps and heavy ring lugs with insulating boots — distinct from the in-harness MP280 terminals.",
    suggestion: "Brass/lead post clamps to suit the battery; 16–25 mm² ring lugs + red/black boots.",
  },
  {
    id: "fan-low",
    item: "Heater-fan low-speed resistor or PWM controller",
    qty: "1 (optional)",
    category: "component",
    reason: "Only needed if you implement the switch's low position as a reduced-speed setting.",
    suggestion: "Aftermarket (not Mouser) — a 10–20 A 12 V PWM motor controller, or a blower dropping resistor.",
  },
  {
    id: "gauge-connectors",
    item: "Gauge connectors for the two main dials (speedo + tach) — replace the vintage 5-pin plugs",
    qty: "2 pairs",
    category: "connector-housing",
    reason:
      "The speedo and tach carry vintage 5-pin connectors; replacing them keeps the whole car on the Metri-Pack 280 terminal system. GT 280 has no 5-way (the ladder skips 5, 7, 9, 11), so use a GT 280 6-way with one cavity blanked (male 15326640 + matching female) — in-family, 1 spare. Alternative: a Metri-Pack 280 5-way (exact size, same terminals, different housing family).",
    suggestion: "GT 280 6-way (15326640 M + matching F), one cavity blanked; reuse owned MP280 terminals/seals.",
  },
  {
    id: "instr-dimmer",
    item: "Instrument-light PWM dimmer module",
    qty: "1",
    category: "component",
    reason:
      "Panel illumination now runs as one circuit through a PWM dimmer; the 3-way instrument-light switch picks two brightness presets. A simple low-side LED/bulb PWM dimmer (with a rotary pot, or two preset inputs) carries the small lamp load.",
    suggestion: "Aftermarket (not Mouser) — any 12 V LED PWM dimmer module rated ≥ 3 A (Amazon/eBay/icstation, ~$8–15).",
  },
  {
    id: "relay-base-extra",
    item: "SPST relay — 1 more (for the deferred washer pump) + optional spares",
    qty: "1 (+ spares)",
    category: "relay",
    reason:
      "The 6 SPST + 5 SPDT you own are all allocated to the in-use circuits. The washer pump (deferred) is relay-driven so its period-correct button stays a low-current trigger — that needs one more SPST (ISO-280, Song Chuan 301-1A-C-R1-U03-12VDC), which reserves the constant-RTMR's last cavity. Buy it with the pump. Add 1–2 further spares if you want headlight redundancy.",
    suggestion: "Song Chuan 301-1A-C-R1-U03-12VDC (same as owned) ×1 for the washer + spares.",
  },
  {
    id: "washer",
    item: "Electric washer pump + period-correct dash push button (DEFERRED install)",
    qty: "1 pump + 1 button",
    category: "component",
    reason:
      "The factory foot pump is retired; the rebuild fits a modern electric washer pump, relay-driven (see the +1 SPST above) so the visible dash button stays period-correct and carries no load. Provisioned + capped in the harness now; fit the pump + button later (plug-in). The pump is ~2–4 A on the wiper/washer fuse.",
    suggestion: "Any 12 V universal washer pump (~$8); a period-correct momentary push button to match the dash. Not Mouser — restoration/accessory supplier.",
  },
  {
    id: "led-flasher",
    item: "Electronic LED flasher — ISO-280 footprint",
    qty: "1",
    category: "component",
    reason:
      "Indicators are LED. The flasher feeds the turn-relay commons, so it carries the (tiny) LED load — a thermal flasher won't flash. Mount it EXTERNALLY next to the RTMR: the constant-RTMR's last ISO-280 cavity is now reserved for the future washer relay, so the drop-in-slot option isn't free. A standard 3-pin electronic LED flasher next to the block is the norm anyway.",
    suggestion: "Aftermarket (not Mouser) — a standard 3-pin electronic LED flasher (Memotronics EF32RLNP, Custom LED ELFR-1, Painless 80230) mounted next to the block.",
  },
  // --- Specialty tools (one-time; not consumed in the harness) ---------------
  {
    id: "tool-mp280-crimp",
    item: "Metri-Pack 280 crimp tool (open-barrel, double-crimp: wire + seal)",
    qty: "1",
    category: "tool",
    reason:
      "The whole car is on MP280 terminals — every connector/block/relay end needs a proper open-barrel crimp (core + seal). A generic insulated-terminal crimper won't do it right.",
    suggestion: "An open-barrel ratchet crimper sized for MP280 (≈0.3–3 mm² / 22–12 AWG), e.g. an IWISS/Engineer PA-style with open-barrel dies.",
  },
  {
    id: "tool-term-release",
    item: "GT 280 / MP280 terminal release (extraction) tool",
    qty: "1 set",
    category: "tool",
    reason: "To back terminals out of GT 280 / MP280 cavities cleanly when fixing a mis-pin or re-pinning the bulkheads — you will need this.",
    suggestion: "Aptiv/Delphi MP280 release tool, or a generic automotive terminal-removal kit that includes the 2.8 mm size.",
  },
  {
    id: "tool-lug-crimp",
    item: "Heavy-lug crimper (hex / hydraulic) for ring terminals",
    qty: "1",
    category: "tool",
    reason: "The battery/starter/ground-hub rings are 6–25 mm² — too big for the MP280 crimper. Needs a proper lug crimper.",
    suggestion: "Hex or hydraulic lug crimper covering 6–25 mm² (10–4 AWG).",
  },
  {
    id: "tool-label",
    item: "Dymo Rhino label printer (heat-shrink cartridges)",
    qty: "1",
    category: "tool",
    reason: "One wire colour throughout — the printed heat-shrink labels ARE the wire identity. The printer is the tool; the cartridges are the consumable (in the loom line).",
    suggestion: "Dymo Rhino 4200/5200/6000 with IND heat-shrink tube cartridges in the gauges you use.",
  },
  {
    id: "tool-heatgun",
    item: "Heat gun + automotive wire strippers + a multimeter / test light",
    qty: "1 each",
    category: "tool",
    reason: "Heat gun for the Dymo shrink labels + adhesive heat-shrink; strippers for clean cuts; a meter/test light to verify each circuit against its build sheet as you bring it up.",
    suggestion: "Any decent heat gun; auto-stripper; a basic DMM or a 12 V test light.",
  },
  {
    id: "diodes",
    item: "Signal / flyback diodes (1N4007, or 1N4148 for the tell-tales)",
    qty: "6 + spares (buy a 10-pack)",
    category: "component",
    reason:
      "4 inline signal diodes — hazard→turn isolation (×2) and the single turn tell-tale OR-ed from both sides (×2) — plus 2 relay-coil flyback diodes (fuel + ignition-main). All on ≤0.2 A signal/coil wires. The 2 flyback diodes are only needed if the Song Chuan relays lack built-in coil suppression — check the relay datasheet first.",
    suggestion: "1N4007 (1 A) general purpose; 1N4148 fine for the tell-tale OR-ing.",
  },
  {
    id: "term-16-14",
    item: "Metri-Pack 280 terminals, 16-14 AWG (female + male) — for the 1.5 mm² wires",
    qty: "~20 + spares",
    category: "terminal",
    reason:
      "Owned terminals are 22-20 / 18-16 / 14-12 AWG and skip 16-14, which is the ideal range for the 1.5 mm² medium wires. Buy the 16-14 range so every wire gets its correct terminal.",
    suggestion: "Female 12129409-L (sealed, verified); pair with the matching 16-14 AWG sealed male (confirm PN at order).",
  },
];

// ---------------------------------------------------------------------------
// Terminal-by-gauge — the IDEAL MP280 terminal range for each recommended wire
// gauge, mirroring the wire-tier approach (ideal size, consolidated per gauge).
// Heavy feeds (6 / 25 mm²) don't go in a connector — they're rings on studs.
// ---------------------------------------------------------------------------
export interface TerminalSpec {
  mm2: number;
  awg: string;
  femalePn?: string;
  malePn?: string;
  owned: boolean;
  ownedF?: number; // owned female count (from the invoices)
  ownedM?: number; // owned male count
  isRing?: boolean;
  note?: string;
}

// ---------------------------------------------------------------------------
// Owned wire stock (this build). Silicone tinned-copper. Signal runs on the
// 22 AWG for THIS build (all wires loom-wrapped, so the thin-wire vibration
// concern is mitigated). The CLEAN-BUILD recommendation stays the optimal
// gauge (signal = 0.5 mm² / 20 AWG — see gaugeSpecs); 22 AWG is a deviation.
// ---------------------------------------------------------------------------
export interface OwnedWire {
  awg: string;
  mm2: number;
  meters: number;
  forClass: string; // which build gauge-class this stock serves
}
export const ownedWire: OwnedWire[] = [
  { awg: "22", mm2: 0.35, meters: 50, forClass: "signal" },
  { awg: "18", mm2: 0.75, meters: 50, forClass: "low" }, // spare 18 AWG also backs up signal
  { awg: "12", mm2: 2.5, meters: 8, forClass: "high" }, // 12 AWG (3.3 mm²) covers the 2.5 tier
  { awg: "10", mm2: 6, meters: 13, forClass: "feed" },
];

export const terminalByGauge: TerminalSpec[] = [
  { mm2: 0.35, awg: "22-20", femalePn: "12110843-L", malePn: "15304730-L", owned: true, ownedF: 50, ownedM: 25, note: "THIS build's signal wires (22 AWG) — now puts the owned 22-20 terminals to use." },
  { mm2: 0.75, awg: "18-16", femalePn: "12110847-L", malePn: "15304731-L", owned: true, ownedF: 50, ownedM: 25 },
  { mm2: 1.5, awg: "16-14", femalePn: "12129409-L", malePn: "16-14 male (confirm)", owned: false, ownedF: 0, ownedM: 0, note: "Buy — owned set skips 16-14. Female 12129409-L verified." },
  { mm2: 2.5, awg: "14-12", femalePn: "12110845-L", malePn: "15304724-L", owned: true, ownedF: 25, ownedM: 25 },
  { mm2: 6, awg: "—", owned: false, isRing: true, note: "Ring terminal on a stud — not a connector terminal." },
  { mm2: 25, awg: "—", owned: false, isRing: true, note: "Ring terminal on a stud (battery/starter/ground hub)." },
];
