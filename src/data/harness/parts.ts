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
    item: "Automotive wire (TXL/GXL, single colour as planned)",
    qty: "≈ see length report — by gauge",
    category: "wire",
    reason:
      "Neither order includes wire. You chose one colour + Dymo labels, so order by gauge: 0.5, 0.75, 1.0, 2.5, 6.0 and 16 mm². Totals on the Lengths page.",
    suggestion: "TXL preferred (thinner wall, higher temp) for the engine bay.",
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
    item: "Ground bus / ring terminals / braid straps",
    qty: "3 ground points + engine-to-body strap",
    category: "consumable",
    reason: "Dedicated star grounds (engine bay, dash, rear) replace reliance on body return paths.",
  },
  {
    id: "loom",
    item: "Convoluted tubing / heat-shrink / Dymo heat-shrink cartridges / grommets",
    qty: "as needed",
    category: "consumable",
    reason: "Loom protection, bulkhead grommets and the printed wire labels themselves.",
  },
  {
    id: "fan-low",
    item: "Heater-fan low-speed resistor or PWM controller",
    qty: "1 (optional)",
    category: "component",
    reason: "Only needed if you implement the switch's low position as a reduced-speed setting.",
  },
  {
    id: "instr-dimmer",
    item: "Instrument-light PWM dimmer module",
    qty: "1",
    category: "component",
    reason:
      "Panel illumination now runs as one circuit through a PWM dimmer; the 3-way instrument-light switch picks two brightness presets. A simple low-side LED/bulb PWM dimmer (with a rotary pot, or two preset inputs) carries the small lamp load.",
    suggestion: "Any 12 V automotive LED PWM dimmer rated ≥ 3 A is plenty for panel lamps.",
  },
  {
    id: "relay-base-extra",
    item: "Headlight relays already covered — confirm relay count vs plan",
    qty: "0–1",
    category: "relay",
    reason:
      "Plan uses 6 SPST + 5 SPDT = exactly what you own. No spare SPST. Buy 1–2 spares if you want redundancy.",
  },
];
