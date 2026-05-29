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
    qtyOwned: 6, // 5 from order 77657766 + 1 from order 280336112 (fan-adapter sub-build)
    unitPrice: 6.79,
    currency: "USD",
    order: "77657766 + 280336112",
    role: "Change-over relays: headlight enable, hi/lo, wiper self-park, starter interlock, fan-adapter SPDT, + spare.",
  },
  {
    mfgPn: "301-1A-C-R1-U03-12VDC",
    mouserPn: "893-3011ACR1U0312VDC",
    desc: "Song Chuan ISO-280 micro relay — SPST (1 Form A), 12 Vdc, 35 A.",
    category: "relay",
    qtyOwned: 7, // 6 from order 87705868 + 1 from order 280336112 (washer relay-base-extra)
    unitPrice: 38.98, // NOK incl. VAT
    currency: "NOK",
    order: "87705868 + 280336112",
    role: "On/off load relays: low beam, high beam, horn, heater fan gate, fuel pump, ignition main, + the deferred washer relay.",
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
    desc: "Aptiv/Delphi 12-way GT 280 secondary lock / TPA (grey).",
    category: "lock",
    qtyOwned: 8, // 6 from order 77657766 + 2 spares from order 280336112
    unitPrice: 0.832,
    currency: "USD",
    order: "77657766 + 280336112",
    role: "TPA for the 6 × 12-way GT 280 halves (bh2 + bh4 + em1 ×2 sides each), + 2 spares.",
  },
  {
    mfgPn: "15436198",
    mouserPn: "829-15436198",
    desc: "Aptiv/Delphi 6-way GT 280 secondary lock / TPA (grey).",
    category: "lock",
    qtyOwned: 2,
    unitPrice: 8.08,
    currency: "NOK",
    order: "280336112",
    role: "TPA for the 2 × 6-way GT 280 gauge connectors (speedo + tach).",
  },
  {
    mfgPn: "15430900",
    mouserPn: "829-15430900",
    desc: "Aptiv/Delphi 10-way GT 280 secondary lock / TPA (grey).",
    category: "lock",
    qtyOwned: 2,
    unitPrice: 6.38,
    currency: "NOK",
    order: "280336112",
    role: "TPA for the 2 × 10-way GT 280 halves on bh1 (dash power).",
  },

  // --- 6/8/10-way GT 280 connector housings (order 280336112) ----------------
  {
    mfgPn: "15326640",
    mouserPn: "829-15326640",
    desc: "Aptiv/Delphi 6-way MALE GT 280 sealed connector.",
    category: "connector-housing",
    qtyOwned: 2,
    unitPrice: 37.83,
    currency: "NOK",
    order: "280336112",
    role: "Male half × 2 — speedo + tach gauge plugs (one cavity blanked each).",
  },
  {
    mfgPn: "13521467",
    mouserPn: "829-13521467",
    desc: "Aptiv/Delphi 6-way FEMALE GT 280 sealed connector.",
    category: "connector-housing",
    qtyOwned: 2,
    unitPrice: 38.06,
    currency: "NOK",
    order: "280336112",
    role: "Female half × 2 — speedo + tach gauge plugs.",
  },
  {
    mfgPn: "15326655",
    mouserPn: "829-15326655",
    desc: "Aptiv/Delphi 8-way MALE GT 280 sealed connector.",
    category: "connector-housing",
    qtyOwned: 1,
    unitPrice: 26.78,
    currency: "NOK",
    order: "280336112",
    role: "Male half × 1 — bh3 (rear/boot bulkhead).",
  },
  {
    mfgPn: "15326654",
    mouserPn: "829-15326654",
    desc: "Aptiv/Delphi 8-way FEMALE GT 280 sealed connector.",
    category: "connector-housing",
    qtyOwned: 1,
    unitPrice: 38.95,
    currency: "NOK",
    order: "280336112",
    role: "Female half × 1 — bh3 (rear/boot bulkhead).",
  },
  {
    mfgPn: "15326661",
    mouserPn: "829-15326661",
    desc: "Aptiv/Delphi 10-way MALE GT 280 sealed connector.",
    category: "connector-housing",
    qtyOwned: 2,
    unitPrice: 29.46,
    currency: "NOK",
    order: "280336112",
    role: "Male half × 2 — bh1 dash power (split into two 10-way plugs).",
  },
  {
    mfgPn: "15326660",
    mouserPn: "829-15326660",
    desc: "Aptiv/Delphi 10-way FEMALE GT 280 sealed connector.",
    category: "connector-housing",
    qtyOwned: 2,
    unitPrice: 31.36,
    currency: "NOK",
    order: "280336112",
    role: "Female half × 2 — bh1 dash power.",
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
    role: "Metri-Pack 280 female crimp — RTMR/PDM rear cavities + device ends. NOT for the GT 280 bulkhead plugs (those need GT 280 female sockets — see gaps).",
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
    desc: "Aptiv/Delphi GT 280 MALE terminal, tin (for the GT 280 bulkhead plug MALE halves).",
    category: "terminal",
    qtyOwned: 25,
    unitPrice: 0.348,
    currency: "USD",
    order: "77657766",
    role: "GT 280 male crimp — for the GT 280 bulkhead plug MALE halves (≈41 male needed; you own ~75).",
  },
  {
    mfgPn: "15304731-L",
    mouserPn: "829-15304731",
    desc: "Aptiv/Delphi GT 280 MALE terminal, tin (for the GT 280 bulkhead plug MALE halves).",
    category: "terminal",
    qtyOwned: 25,
    unitPrice: 0.386,
    currency: "USD",
    order: "77657766",
    role: "GT 280 male crimp — for the GT 280 bulkhead plug MALE halves (≈41 male needed; you own ~75).",
  },
  {
    mfgPn: "15304730-L",
    mouserPn: "829-15304730",
    desc: "Aptiv/Delphi GT 280 MALE terminal, tin (14-12 AWG).",
    category: "terminal",
    qtyOwned: 50, // 25 from order 77657766 + 25 from order 280336112
    unitPrice: 0.389,
    currency: "USD",
    order: "77657766 + 280336112",
    role: "GT 280 male crimp — for the GT 280 bulkhead plug MALE halves (heavy gauge tier).",
  },
  // --- GT 280 FEMALE terminals (order 280336112) — was the audit gap ---------
  {
    mfgPn: "15304718-L",
    mouserPn: "829-15304718",
    desc: "Aptiv/Delphi GT 280 FEMALE terminal, tin (22-20 AWG, cable rng 1.85-1.20 mm).",
    category: "terminal",
    qtyOwned: 60,
    unitPrice: 1.16,
    currency: "NOK",
    order: "280336112",
    role: "GT 280 female crimp — bulkhead-plug female halves at the signal gauge tier (22-20 AWG).",
  },
  {
    mfgPn: "15304719-L",
    mouserPn: "829-15304719",
    desc: "Aptiv/Delphi GT 280 FEMALE terminal, tin (18-16 AWG, cable rng 2.25-1.70 mm).",
    category: "terminal",
    qtyOwned: 25,
    unitPrice: 1.22,
    currency: "NOK",
    order: "280336112",
    role: "GT 280 female crimp — bulkhead-plug female halves at the medium gauge tier (18-16 AWG).",
  },
  {
    mfgPn: "15304720-L",
    mouserPn: "829-15304720",
    desc: "Aptiv/Delphi GT 280 FEMALE terminal, tin (14-12 AWG, cable rng 3.20-2.20 mm).",
    category: "terminal",
    qtyOwned: 10,
    unitPrice: 2.05,
    currency: "NOK",
    order: "280336112",
    role: "GT 280 female crimp — bulkhead-plug female halves at the heavy gauge tier (14-12 AWG).",
  },
  // --- MP 280 FEMALE 16-14 AWG (order 280336112) — fills the existing MP 280 gap
  {
    mfgPn: "12129409-L",
    mouserPn: "829-12129409",
    desc: "Aptiv/Delphi Metri-Pack 280 FEMALE sealed terminal, tin (16-14 AWG, cable rng 3.05-2.48 mm).",
    category: "terminal",
    qtyOwned: 25,
    unitPrice: 2.40,
    currency: "NOK",
    order: "280336112",
    role: "MP 280 female crimp at the 1.5 mm² (16-14 AWG) tier — block rears + device ends. The owned MP280 female set (12110843/45/847) skipped this gauge.",
  },
  // --- GT 280 cable seals (order 280336112) — was the audit gap --------------
  {
    mfgPn: "15366065",
    mouserPn: "829-15366065",
    desc: "Aptiv/Delphi GT 280 single-wire cable seal — ORANGE (22-20 AWG).",
    category: "seal",
    qtyOwned: 125,
    unitPrice: 0.212,
    currency: "NOK",
    order: "280336112",
    role: "GT 280 cable seal at the signal gauge tier — one per terminated cavity (both halves of every wire).",
  },
  {
    mfgPn: "15366066",
    mouserPn: "829-15366066",
    desc: "Aptiv/Delphi GT 280 single-wire cable seal — YELLOW (18-16 AWG).",
    category: "seal",
    qtyOwned: 50,
    unitPrice: 0.246,
    currency: "NOK",
    order: "280336112",
    role: "GT 280 cable seal at the medium gauge tier.",
  },
  {
    mfgPn: "15366067",
    mouserPn: "829-15366067",
    desc: "Aptiv/Delphi GT 280 single-wire cable seal — TAN (14-12 AWG).",
    category: "seal",
    qtyOwned: 25,
    unitPrice: 0.246,
    currency: "NOK",
    order: "280336112",
    role: "GT 280 cable seal at the heavy gauge tier.",
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
    role: "Metri-Pack 280 single-wire seal — for the MP280 side (block rears / device ends). The GT 280 bulkhead plugs need GT 280 seals (15366065/66/67) — see gaps.",
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

  // --- Diodes (order 280336112) ----------------------------------------------
  {
    mfgPn: "1N4007G",
    mouserPn: "863-1N4007G",
    desc: "ON Semi 1N4007G rectifier diode (1000 V / 1 A, DO-41).",
    category: "component",
    qtyOwned: 10,
    unitPrice: 1.23,
    currency: "NOK",
    order: "280336112",
    role: "Signal-OR isolation diodes: hazard→turn (d-haz-L/R), turn tell-tale (d-tell-L/R), fan-gate diode-OR (d-fan-hi-or, d-fan-lo-or) — six in use + spares.",
  },
  {
    mfgPn: "1N5822",
    mouserPn: "637-1N5822",
    desc: "Schottky rectifier diode (40 V / 3 A, DO-201).",
    category: "component",
    qtyOwned: 5,
    unitPrice: 4.42,
    currency: "NOK",
    order: "280336112",
    role: "Park-override OR-isolation Schottky on the ign-feed legs of the front/rear parking lights (d-park-ign-iso + d-park-ign-iso-rear) — 2 in use + 3 spares.",
  },
];

// ---------------------------------------------------------------------------
// Gaps — what the harness needs that the two orders do NOT cover.
// ---------------------------------------------------------------------------
export const bomGaps: BomGap[] = [
  {
    id: "recommended-spares",
    item: "Field-replacement spares — 1× of each relay type + 1× spare pair of each GT 280 housing size + 1× of each smaller TPA",
    qty: "2 relays + 6 housing pairs + 5 TPAs (~17 line items, ~kr 400-500)",
    category: "consumable",
    reason:
      "Both relay families (SPDT + SPST) and every GT 280 housing size are at EXACT build-count today — every owned part is allocated to a specific cavity. Dropping one connector on the garage floor or losing a relay to a roadside fault means stop-the-build (or stop-the-trip). One spare of each, kept in the glovebox / parts drawer, turns those moments into a 5-minute swap. The 2-way and 4-way bumps absorb naturally into the already-needed add-on quantities; the bigger pairs are deliberate +1 line items.",
    suggestion:
      "Relay spares (1× each):\n" +
      "  893-301-1C-S-R1-12VD × 1 (SPDT — was 5 owned; current allocation = 6; this makes 7 = +1 spare)\n" +
      "  893-3011ACR1U0312VDC × 1 (SPST — current = 7 owned, 6 active + 1 future washer; this makes 8 = +1 spare)\n" +
      "\nGT 280 housing spare pairs (1× M + 1× F each size in use):\n" +
      "  829-13518847 + 829-13518845 (2-way GT 280) — order 5 instead of 4 (+1 spare pair) — see service-break-connectors\n" +
      "  829-12065171 + 829-12065170 (1-way MP 280) — order 4 instead of 3 (+1 spare pair) — for snd-oil + sw-oillight + o2-sensor\n" +
      "  829-13521461 + 829-13521459 (4-way GT 280) — order 3 instead of 2 (+1 spare pair) — fc + dl + spare\n" +
      "  829-15326640 + 829-13521467 (6-way) — order 1 spare pair (you have 2 build-spec)\n" +
      "  829-15326655 + 829-15326654 (8-way) — order 1 spare pair (you have 1 build-spec)\n" +
      "  829-15326661 + 829-15326660 (10-way) — order 1 spare pair (you have 2 build-spec)\n" +
      "  829-15326915 + 829-15326910 (12-way) — order 1 spare pair (you have 3 build-spec)\n" +
      "\nGT 280 TPA spares (1× each smaller size — 12-way already has 2 spares incoming from 280336112):\n" +
      "  829-15430899 (2-way) — order 5 instead of 4 (+1 spare)\n" +
      "  829-15430898 (4-way) — order 3 instead of 2 (+1 spare)\n" +
      "  829-15436198 (6-way) — order 3 instead of 2 (+1 spare)\n" +
      "  829-15430896 (8-way) — order 3 instead of 2 (+1 spare)\n" +
      "  829-15430900 (10-way) — order 3 instead of 2 (+1 spare)\n" +
      "\nSkippable but worth considering for completeness: 1-2 spare faston terminals (1217084-1 and 170187-2) if existing stock is thin — currently 15 × 187-series owned which has ~3 spare.",
  },
  // Silicone wire was ordered separately (2026-05-28) from a non-Mouser
  // supplier; quantities by gauge tier to be transcribed to ownedParts when
  // the order is to hand. Kept off the active gap list to avoid double-buying.
  {
    id: "mini-fuses",
    item: "MINI (ATM) blade fuse assortment kit",
    qty: "1 kit (40 pieces, assorted ratings)",
    category: "fuse",
    reason:
      "The PDM and RTMRs ship empty — without fuses no circuit can come up. Design uses 9 × 10 A, 4 × 5 A, 4 × 7.5 A, 2 × 20 A, 1 × 15 A (~20 fuses installed). Buying the Littelfuse 'Super Value Pack' 40-piece kit covers every rating used plus a healthy spare of each — one line item, break-even with individual buys, more spares for the glovebox.",
    suggestion:
      "Mouser 576-00940462Z (Littelfuse 00940462Z 'MINI Super Value Pack' — 40 fuses assorted across 5/7.5/10/15/20/25/30 A ratings, ~$25-30). One kit covers the whole car + spares; no per-rating ordering needed. (Per-rating individual buys are an alternative if the kit's mix doesn't match well, but the design ratings overlap nicely with the kit assortment.)",
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
    qty: "3 holders + 3 fuses + 1-2 spares",
    category: "fuse",
    reason:
      "The battery→constant-bus, battery→PDM, and alternator-B+→battery main feeds are otherwise unfused (fire risk). Three holders: ~60–80 A on the constant feed, ~40 A on the PDM feed, ~60–80 A on the alternator B+. A battery master cut-off is a cheap classic-car safety add.",
    suggestion:
      "Mouser-orderable Littelfuse MIDI:\n" +
      "  Holders: 576-0FHM0001ZXJ (MIDI bolt-on holder) × 3\n" +
      "  Fuses:   576-0498040.WXNV (40 A MIDI) × 2 (PDM feed + 1 spare)\n" +
      "           576-0498080.WXNV (80 A MIDI) × 4 (constant + alt B+ + 2 spares)\n" +
      "Master cut-off (optional, non-Mouser): any 12 V battery isolator switch — Blue Sea, Hella, etc. Verify exact Mouser PNs at order time.",
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
    id: "service-break-connectors",
    item: "Service-break connectors at engine-bay devices — mix of 2-way GT 280 + 1-way MP 280",
    qty: "5× 2-way GT 280 sealed pairs + 4× 1-way MP 280 sealed pairs (housings only — terminals/seals from existing stock)",
    category: "connector-housing",
    reason:
      "Inline sealed connectors at devices that are routinely replaced or environmentally exposed — unplug for swap instead of cut-and-recrimp. Indicator-spare pairs (front turns + side repeaters) DROPPED per design review 2026-05-29 (can be added later if needed). Refined to use the right connector size per actual wire count: true 2-wire devices get 2-way GT 280, single-wire-with-case-ground devices (senders + narrowband O2) get 1-way MP 280. No more capped cavities — when a cavity will permanently be unused, use the smaller housing instead.",
    suggestion:
      "Two-way GT 280 sealed (for sw-brake, snd-temp, sw-reverse, fuel-pump — all true 2-wire devices + 1 spare pair):\n" +
      "  829-13518847 × 5 (2-way GT 280 MALE, was 15326678)\n" +
      "  829-13518845 × 5 (2-way GT 280 FEMALE, was 15326679)\n" +
      "  829-15430899 × 5 (2-way GT 280 TPA grey)\n" +
      "\nOne-way MP 280 sealed (for snd-oil, sw-oillight, o2-sensor — single-wire + case-grounded + 1 spare pair):\n" +
      "  829-12065171 × 4 (1-way MP 280 sealed MALE)\n" +
      "  829-12065170 × 4 (1-way MP 280 sealed FEMALE — assumed paired by family suffix, verify before ordering)\n" +
      "  (No TPA — 1-way primary lock is sufficient)\n" +
      "\nTerminals + seals: existing GT 280 + MP 280 stock covers both. 1-way uses MP 280 terminals (12110843/45/847/12129409 owned) and MP 280 single-wire seals (15324982/981/985 owned) — same as the block-rear / device-end crimps. 2-way uses GT 280 terminals + seals from order 280336112 (terminal top-up below covers the incremental draw). NOT modeled as wire-graph nodes — these are physical service-break points the builder inserts during assembly.",
  },
  {
    id: "service-break-terminals-topup",
    item: "Additional GT 280 terminals + seals — covers service-break connectors + fan-adapter draws on stock",
    qty: "see per-gauge breakdown",
    category: "terminal",
    reason:
      "Adding the 11 service-break connectors + the 4-way fan-adapter (fc) pulls more terminations from the GT 280 terminal + seal stock than order 280336112 covered. After both draws the 22-20 lines (female + male + seals) and the 14-12 lines (female + seals) go negative against the bulkhead need + 20% safety margin. This entry tops them up.",
    suggestion:
      "Per gauge (quantities include +20% margin). NOTE: counts updated 2026-05-29 after dropping the 4 indicator-spare connectors AND moving 3 single-wire devices (snd-oil, sw-oillight, o2-sensor) to MP 280 1-way (which uses owned MP 280 terminals, NOT GT 280 stock). Net 22-20 GT 280 reduction: 11 fewer wires than the previous count.\n" +
      "  22-20 AWG MALE:    BOTH 829-15304730 × +15 AND 829-15304724 × +15 (resolves the PN-to-AWG mapping uncertainty — model says 15304730 = 22-20, Aptiv catalog convention says 15304724 = 22-20. At ~kr 1.14 per terminal, ordering both = +kr 18 surplus to settle the question once the order arrives.)\n" +
      "  22-20 AWG FEMALE:  829-15304718 × +10 (have 60, need ~64 incl service-break + fc + dl)\n" +
      "  22-20 SEAL (ORN):  829-15366065 × +15 (have 125, need ~130)\n" +
      "  14-12 AWG FEMALE:  829-15304720 × +10 (have 10, need ~18)\n" +
      "  14-12 SEAL (TAN):  829-15366067 × +15 (have 25, need ~36)\n" +
      "18-16 + 14-12 male margins are comfortable from order 280336112 — no top-up needed there.",
  },
  {
    id: "service-break-strain-relief",
    item: "Heat-shrink for the 11 service-break pigtail strain reliefs",
    qty: "~1.5 m of ⌀6 mm + ~1 m of ⌀9 mm (3:1 adhesive-lined)",
    category: "consumable",
    reason:
      "Each service-break connector has a short (~5-15 cm) device-side pigtail that needs strain relief + moisture barrier at the connector body. Adhesive-lined 3:1 heat-shrink slipped over the wire bundle before the connector is crimped, then shrunk over the connector backshell + first few cm of wire. ~10-15 cm of shrink per pigtail × 11 = ~1.5 m total. Sizes match the existing heatshrink-spade order: ⌀6 mm for the 22-20 / 18-16 single-wire devices, ⌀9 mm for the 14-12 fuel-pump pigtail.",
    suggestion:
      "Already covered by the heatshrink-spade BOM line if you ordered generous quantities (the ~3 m of ⌀9 + ~1 m of ⌀6 noted there). If you ordered thin (just enough for spades), add another ~1.5 m of ⌀6 + ~1 m of ⌀9 dual-wall 3:1 adhesive-lined shrink — generic / non-Mouser.",
  },
  {
    id: "dim-adapter-sub-build",
    item: "Dim-adapter (dashboard illumination) module sub-build",
    qty: "1 sub-harness",
    category: "component",
    reason:
      "Detachable PWM dimmer for dashboard gauge illumination only — the existing instr-pwm module now lives BEHIND the new dl 4-pin connector. Mirrors the fan-adapter pattern: chassis loom universal, adapter is variant-specific (PWM today, passthrough swap available). DASHBOARD ONLY — interior dome light is on a separate constant-bus circuit with door-switch ground, unaffected by any of this.",
    suggestion:
      "Mouser add-on items (per dim-adapter):\n" +
      "  829-13521461 × 1 (4-way GT 280 male — chassis-side half of dl)\n" +
      "  829-13521459 × 1 (4-way GT 280 female — adapter-side half of dl)\n" +
      "  829-15430898 × 1 (4-way TPA grey, optional)\n" +
      "Already-stocked items (drawn from existing inventory):\n" +
      "  2× 1N5822 Schottky diodes (out of 5 owned from order 280336112; 2 already used for park-iso; 1 spare remains after dim-adapter)\n" +
      "  4× GT 280 male terminals + 3× GT 280 female terminals + 7-8× cable seals at 22-20 AWG (absorbed by the existing terminal top-up margin)\n" +
      "  1× cavity plug 15305170 (pin 1 unused on adapter-side female in PWM variant — absorbed by the 5 already in the order)\n" +
      "Non-Mouser:\n" +
      "  PWM dimmer module — aftermarket 12 V low-current dimmer with DIM + BRIGHT preset inputs and a PWM output (Amazon / eBay / icstation, ~$8-15). NOT Mouser.\n" +
      "  Small sealed plastic enclosure for the dimmer PCB (Amazon / local, ~$5).",
  },
  {
    id: "fan-adapter-sub-build",
    item: "Fan-adapter module sub-build — items NOT covered by order 280336112",
    qty: "1 sub-harness",
    category: "component",
    reason: "PARTIAL: order 280336112 covered the +1 SPDT (301-1C-S-R1) and the 2× 1N4007 fan-gate diodes. STILL MISSING: 4-way GT 280 connector pair (male 13521461 + female 13521459), 4-way GT 280 TPA grey 15430898, ISO-280 5-pin relay socket, and a small sealed enclosure. The 4-way GT 280 pair specifically was added to the BOM after the latest Mouser order shipped (fan-adapter refactor 2026-05-29).",
    suggestion: "Next Mouser order: 1× 13521461 (male) + 1× 13521459 (female) + 1× 15430898 (4-way grey TPA, optional). Source separately: 1× ISO-280 5-pin relay socket + small sealed enclosure (Amazon / local). GT 280 terminals (4 per side at the matching wire gauges) + cable seals are already covered from order 280336112.",
  },
  // gauge-connectors — RESOLVED via order 280336112 (15326640 × 2 + 13521467 × 2
  // + 15436198 × 2 TPA). Both speedo + tach plugs covered with the 6-way GT 280
  // pair (one cavity blanked each).
  // instr-dimmer — see `dim-adapter-sub-build` entry above. Per the dim-adapter
  // refactor 2026-05-29, the PWM module lives behind the dl 4-pin connector
  // inside the dim-adapter module (not loom-side as before). Aftermarket
  // sourcing unchanged — still Amazon / eBay / icstation, ~$8–15.
  // relay-base-extra — RESOLVED via order 280336112 (1× extra 301-1A-C-R1
  // SPST). The 7 SPST now owned cover all current allocations + the deferred
  // washer relay slot.
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
    id: "accessory",
    item: "USB-C PD fast-charge converter + Bluetooth-amp stereo",
    qty: "1 each",
    category: "component",
    reason:
      "Dash accessory circuit (ignition-switched, f-ign-3): a 12 V → USB-C PD converter for fast charging, plus a Bluetooth amplifier/head unit (no memory lead — it's key-on). Both user-supplied; the harness gives one ign-switched 12 V feed + ground at the dash, and the stereo jumpers off the USB feed.",
    suggestion: "Any 12 V USB-C PD converter (~20–60 W); a compact 12 V Bluetooth amplifier with USB jack. Not Mouser — general / automotive accessory supplier.",
  },
  // (led-flasher entry removed 2026-05-28 — superseded by flasher-iso280 below.
  // The flasher moved from external mount into rtmr-const cavity 5; the Bussmann
  // NO-762-LED is the chosen socket-mount part.)
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
  // diodes-signal — RESOLVED via order 280336112 (10× 1N4007G). Covers the 6
  // in-use signal diodes (hazard→turn ×2, turn tell-tale ×2, fan-gate ×2) + 4
  // spares.
  // diodes-park-iso — RESOLVED via order 280336112 (5× 1N5822 Schottky).
  // Covers the 2 in-use park-override Schottky diodes + 3 spares.
  {
    id: "flasher-iso280",
    item: "Bussmann NO-762-LED electronic flasher (ISO-280 socket mount)",
    qty: "2 (1 fitted in rtmr-const cavity 5 + 1 glovebox spare) — ~£20",
    category: "component",
    reason:
      "Committed 2026-05-28: the LED flasher moves OFF the external bracket and INTO rtmr-const cavity 5. Drop-in for an ISO-280 relay socket — same 4 pins, 2.8 mm spades. Buy 2: one fitted, one identical spare in the glovebox so a roadside failure is a 30-second swap (the same socket that takes any other ISO-280 relay). Pick the -LED variant unconditionally even with current incandescent indicators — it's load-independent so it'll flash either way, and forward-compatibility with an eventual LED-indicator swap costs nothing extra.",
    suggestion: "Mouser doesn't list the -LED variant in normal search (2026-05-28 — would need a special-order call). Direct alternates: Crimp Supply (US, crimpsupply.com), ozautoelectrics (AU). The plain NO.762 IS at Mouser BUT MUST NOT be substituted here: it sees only relay-coil current (~150-600 mA) in our setup, and the non-LED variant's minimum-current threshold is sized for incandescent bulb loads — risk of no-flash or hyperflash. Spec: 4-pin 2.8 mm ISO-280, 8-14 VDC operating, 162 W max (12.6 A), electronic / load-independent.",
  },
  // term-16-14 — RESOLVED via order 280336112 (12129409-L × 25, MP280 sealed
  // female at the 1.5 mm² / 16-14 AWG tier).
  // gt280-female-terms — RESOLVED via order 280336112: 15304718-L × 60 (22-20),
  // 15304719-L × 25 (18-16), 15304720-L × 10 (14-12) — covers all three tiers
  // of GT 280 female terminals for the bulkhead-plug female halves.
  // gt280-seals — RESOLVED via order 280336112: 15366065 × 125 (orange 22-20),
  // 15366066 × 50 (yellow 18-16), 15366067 × 25 (tan 14-12).
  // gt280-tpa — PARTIALLY RESOLVED via order 280336112 for 6-way (15436198 × 2),
  // 10-way (15430900 × 2), and 12-way spares (15436200 × 2 added to the 6 in
  // stock = 8). 8-way TPA: PN now CONFIRMED as 15430896 (verified via Waytek
  // 2026-05-29) — still needs to be ordered. Listed separately below.
  {
    id: "gt280-tpa-8way",
    item: "GT 280 8-way secondary lock / TPA (grey) — covers bh3",
    qty: "2 (1 per side of bh3 + 1 spare)",
    category: "lock",
    reason: "Order 280336112 covered the 6-way + 10-way + 12-way TPAs but missed the 8-way (PN was unconfirmed at order time, now verified). Bh3 (rear loom) uses an 8-way GT 280 pair; adding TPAs gives secondary lock for the boot environment.",
    suggestion: "Aptiv 15430896 (grey, 8-way GT 280 TPA). Mouser PN: 829-15430896. Order 2 (one per bh3 side + 1 spare).",
  },
  // --- Future brake-redundancy + brake-failure warning parts (provisioned in harness; buy when fitted) ---
  {
    id: "brake-switch-2",
    item: "Second hydraulic brake-light pressure switch (parallel redundancy — FUTURE)",
    qty: "1",
    category: "component",
    reason:
      "Period-correct safety redundancy: factory 105/115 wires TWO hydraulic pressure switches in parallel on the master cylinder so a single brake-circuit failure doesn't kill the brake lamps. Harness is pre-provisioned (jumper wires w-brake-in-2 + w-brake-out-2 already routed, sealed-capped at the future switch end). When the master cylinder is rebuilt / refitted, buy this switch and plug it in — no harness mods needed.",
    suggestion: "Standard automotive hydraulic pressure switch — Mecatecno / FAE / Hella ~5 bar, 2-spade. Confirm thread + pressure rating against your master cylinder's spare port.",
  },
  {
    id: "brake-failure-warning",
    item: "Brake-failure warning lamp + master-cylinder differential pressure switch (FUTURE)",
    qty: "1 + 1",
    category: "component",
    reason:
      "Period-correct brake-failure warning. A differential pressure switch in the master cylinder closes when one of the two hydraulic circuits loses pressure, lighting a red warning lamp on the dash. Harness pre-provisions all three new wires (w-wlbrake-feed daisy off wl-charge, w-wlbrake-sense across bh1, w-brakediff-gnd to engine ground). Bh1 is now at its 20-wire budget — adding more here would push it to a third plug.",
    suggestion: "Lamp: Veglia 24 mm red lens (period-correct) or modern LED equivalent matching the existing dash bezel. Diff switch: matches the brake-master-cylinder port — confirm part number when the master cylinder is in hand.",
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

export const terminalByGauge: TerminalSpec[] = [
  { mm2: 0.5, awg: "22-20", femalePn: "12110843-L", malePn: "15304730-L", owned: true, ownedF: 50, ownedM: 50, note: "Signal wires (20 AWG / 0.5 mm²) — 22-20 AWG terminal covers them. Male bumped to 50 in order 280336112." },
  { mm2: 0.75, awg: "18-16", femalePn: "12110847-L", malePn: "15304731-L", owned: true, ownedF: 50, ownedM: 25 },
  { mm2: 1.5, awg: "16-14", femalePn: "12129409-L", malePn: "16-14 male (confirm)", owned: true, ownedF: 25, ownedM: 0, note: "Female 12129409-L now in stock (25 from order 280336112). Male side at this gauge still TBD — confirm need based on final pin assignments." },
  { mm2: 2.5, awg: "14-12", femalePn: "12110845-L", malePn: "15304724-L", owned: true, ownedF: 25, ownedM: 25 },
  { mm2: 6, awg: "—", owned: false, isRing: true, note: "Ring terminal on a stud — not a connector terminal." },
  { mm2: 25, awg: "—", owned: false, isRing: true, note: "Ring terminal on a stud (battery/starter/ground hub)." },
];
