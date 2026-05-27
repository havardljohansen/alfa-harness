import type { Wire } from "./types";

// ===========================================================================
// WIRE SCHEDULE
// ---------------------------------------------------------------------------
// Label scheme (printed on Dymo heat-shrink, both ends). All one wire colour,
// so the label IS the identity:
//
//   <SYSTEM>.<FUNCTION>[.<SIDE>]
//
//   Function suffixes:
//     +B    constant battery feed        TRG   relay-coil trigger (switch→86)
//     +I    ignition (RUN) feed          OUT   relay output → load (87→load)
//     +IL   ignition position-I feed     SW    feed into a manual switch
//     SIG   sender/sensor signal         GND   ground (DIN 31)
//
//   e.g.  HORN.TRG  (button→relay coil)   vs  HORN.OUT (relay→horns)
//         HL.LO.OUT.L                      TEMP.SIG       CHG.B+
//
// `route` lists the zones the wire passes through (drives length deduction).
// `via` lists bulkhead connectors it passes through.
// gaugeClass → mm²/AWG resolved in zones.ts gaugeSpecs.
// ===========================================================================

export const wires: Wire[] = [
  // =========================================================================
  // POWER / GROUNDS
  // =========================================================================
  { id: "w-bat-main", label: "BAT.+B", name: "Battery + to constant bus stud", circuit: "c-power", from: { component: "battery", terminal: "+" }, to: { component: "rtmr-const", terminal: "BUS" }, gaugeClass: "main", route: ["battery", "engine-front"], note: "PROTECT at the battery with a ~60–80 A MIDI/MEGA fuse — this main feed is otherwise unfused." },
  { id: "w-pdm-main", label: "PDM.+B", name: "Battery + to PDM input (headlight power)", circuit: "c-power", from: { component: "battery", terminal: "+" }, to: { component: "pdm", terminal: "BUS" }, gaugeClass: "feed", route: ["battery", "engine-front"], note: "PROTECT at the battery with a ~40 A MIDI fuse." },
  { id: "w-bat-gnd", label: "BAT.GND", name: "Battery − to engine-bay ground", circuit: "c-power", from: { component: "battery", terminal: "-" }, to: { component: "gnd-eng", terminal: "g" }, gaugeClass: "main", route: ["battery", "engine-front"] },
  { id: "w-ignmain-bus", label: "IGN.BUS.+I", name: "Ignition main relay → ignition bus stud", circuit: "c-ignition", from: { component: "rly-ignmain", terminal: "87" }, to: { component: "rtmr-ign", terminal: "BUS" }, gaugeClass: "feed", route: ["engine-front"] },
  // Per-module ground trunks: each module's ground block runs ONE thick cable
  // back to the engine-bay/battery hub (gnd-eng). No body-as-return reliance,
  // no daisy-chaining one module's return through another.
  // (A thin parallel backup ground + a chassis-bond backup were both considered
  // 2026-05-27 and declined: a regular-gauge wire can't carry a high-current
  // module's full return if the primary trunk fails — so it's not a true backup —
  // and a chassis bond reintroduces the body-return we're avoiding. The heavy
  // stud trunk + a good ring terminal is the reliable path.)
  { id: "w-gnd-front", label: "GND.FRONT", name: "Front-clip ground block → battery hub", circuit: "c-power", from: { component: "gnd-front", terminal: "g" }, to: { component: "gnd-eng", terminal: "g" }, gaugeClass: "feed", route: ["engine-front"], note: "Detaches with the front clip (heavy ring/stud, not through the BH4 signal plug)." },
  { id: "w-gnd-dash", label: "GND.DASH", name: "Dash ground block → battery hub", circuit: "c-power", from: { component: "gnd-dash", terminal: "g" }, to: { component: "gnd-eng", terminal: "g" }, gaugeClass: "feed", route: ["dash", "engine-rear"], note: "Heavy ring/stud cable to the hub — NOT through BH1 (6 mm² won't fit the MP280 connector terminals, and a ground belongs on a stud, not a signal pin). Matches the front/rear ground trunks." },
  { id: "w-gnd-rear", label: "GND.REAR", name: "Rear ground block → battery hub (direct, not via dash)", circuit: "c-power", from: { component: "gnd-rear", terminal: "g" }, to: { component: "gnd-eng", terminal: "g" }, gaugeClass: "feed", route: ["rear", "cabin", "dash", "engine-rear", "engine-front"] },

  // =========================================================================
  // CHARGING (alternator)
  // =========================================================================
  { id: "w-alt-b", label: "CHG.B+", name: "Alternator B+ to battery (via mega-fuse)", circuit: "c-charging", from: { component: "alternator", terminal: "B+" }, to: { component: "battery", terminal: "+" }, gaugeClass: "main", route: ["engine-rear", "engine-front", "battery"], note: "Protect with a 60–80 A mega-fuse at the battery." },
  { id: "w-alt-d", label: "CHG.L", name: "Alternator D+ to charge warning lamp", circuit: "c-charging", from: { component: "alternator", terminal: "D+" }, to: { component: "wl-charge", terminal: "d" }, gaugeClass: "signal", route: ["engine-rear", "dash"], via: ["bh1"] },
  { id: "w-alt-gnd", label: "CHG.GND", name: "Alternator case ground", circuit: "c-charging", from: { component: "alternator", terminal: "g" }, to: { component: "gnd-eng", terminal: "g" }, gaugeClass: "feed", route: ["engine-rear", "engine-front"] },

  // =========================================================================
  // STARTING
  // =========================================================================
  { id: "w-start-b", label: "STRT.B+", name: "Battery to starter (heavy)", circuit: "c-starting", from: { component: "battery", terminal: "+" }, to: { component: "starter", terminal: "B+" }, gaugeClass: "main", route: ["battery", "engine-rear"] },
  { id: "w-start-trg", label: "STRT.TRG", name: "Ignition START → starter relay coil", circuit: "c-starting", from: { component: "ign-switch", terminal: "50" }, to: { component: "rly-starter", terminal: "86" }, gaugeClass: "signal", route: ["dash", "engine-front"], via: ["bh1"] },
  { id: "w-starter-30", label: "STRT.+B", name: "Battery → starter relay common", circuit: "c-starting", from: { component: "battery", terminal: "+" }, to: { component: "rly-starter", terminal: "30" }, gaugeClass: "high", route: ["battery", "engine-front"] },
  { id: "w-starter-out", label: "STRT.OUT", name: "Starter relay → solenoid (DIN 50)", circuit: "c-starting", from: { component: "rly-starter", terminal: "87" }, to: { component: "starter", terminal: "50" }, gaugeClass: "high", route: ["engine-front", "engine-rear"] },

  // =========================================================================
  // IGNITION
  // =========================================================================
  { id: "w-ign-30", label: "IGN.30.+B", name: "Battery feed to ignition switch", circuit: "c-ignition", from: { component: "rtmr-const", terminal: "BUS" }, to: { component: "ign-switch", terminal: "30" }, gaugeClass: "medium", route: ["engine-front", "dash"], via: ["bh1"] },
  { id: "w-ignmain-trg", label: "IGN.MAIN.TRG", name: "Ignition RUN → main relay coil", circuit: "c-ignition", from: { component: "ign-switch", terminal: "15" }, to: { component: "rly-ignmain", terminal: "86" }, gaugeClass: "signal", route: ["dash", "engine-front"], via: ["bh1"], diodes: ["d-coil-ignmain"] },
  { id: "w-ignmain-30", label: "IGN.MAIN.+B", name: "Battery to ignition main relay common", circuit: "c-ignition", from: { component: "rtmr-const", terminal: "BUS" }, to: { component: "rly-ignmain", terminal: "30" }, gaugeClass: "feed", route: ["engine-front"] },
  { id: "w-coil-15", label: "COIL.+I", name: "Ignition bus → coil +", circuit: "c-ignition", from: { component: "rtmr-ign", terminal: "f-ign-1" }, to: { component: "coil", terminal: "15" }, gaugeClass: "medium", route: ["engine-front", "engine-rear"] },
  { id: "w-coil-dist", label: "COIL.1", name: "Coil − to distributor", circuit: "c-ignition", from: { component: "coil", terminal: "1" }, to: { component: "dist", terminal: "1" }, gaugeClass: "signal", route: ["engine-rear"] },

  // =========================================================================
  // HEADLIGHTS  (PDM, relay-driven, ignition-gated)
  // =========================================================================
  { id: "w-hl-en", label: "HL.EN.+I", name: "Ignition Run → headlight switch beam-enable in", circuit: "c-headlights", from: { component: "ign-switch", terminal: "15" }, to: { component: "sw-headlight", terminal: "30i" }, gaugeClass: "signal", route: ["dash"] },
  { id: "w-hl-head", label: "HL.HEAD", name: "Headlight switch beam-enable → dip/flash switch", circuit: "c-headlights", from: { component: "sw-headlight", terminal: "56" }, to: { component: "sw-dipflash", terminal: "56" }, gaugeClass: "signal", route: ["dash"] },
  { id: "w-flash-feed", label: "HL.FLASH.+I", name: "Ignition Run → dip/flash switch FLASH feed (bypasses headlight switch)", circuit: "c-headlights", from: { component: "ign-switch", terminal: "15" }, to: { component: "sw-dipflash", terminal: "flash" }, gaugeClass: "signal", route: ["dash"] },
  { id: "w-hl-lo-trg", label: "HL.LO.TRG", name: "Dip switch DIP → low-beam relay coil", circuit: "c-headlights", from: { component: "sw-dipflash", terminal: "56b" }, to: { component: "rly-low", terminal: "86" }, gaugeClass: "signal", route: ["dash", "engine-front"], via: ["bh2", "bh4"] },
  { id: "w-hl-hi-trg", label: "HL.HI.TRG", name: "Dip/flash switch MAIN → high-beam relay coil", circuit: "c-headlights", from: { component: "sw-dipflash", terminal: "56a" }, to: { component: "rly-high", terminal: "86" }, gaugeClass: "signal", route: ["dash", "engine-front"], via: ["bh2", "bh4"] },
  { id: "w-hl-lo-L", label: "HL.LO.OUT.L", name: "Low beam LEFT", circuit: "c-headlights", from: { component: "pdm", terminal: "f-pdm-1" }, to: { component: "hl-L", terminal: "56b" }, gaugeClass: "high", route: ["engine-front"] },
  { id: "w-hl-lo-R", label: "HL.LO.OUT.R", name: "Low beam RIGHT", circuit: "c-headlights", from: { component: "pdm", terminal: "f-pdm-2" }, to: { component: "hl-R", terminal: "56b" }, gaugeClass: "high", route: ["engine-front"] },
  { id: "w-hl-hi-L", label: "HL.HI.OUT.L", name: "High beam LEFT", circuit: "c-headlights", from: { component: "pdm", terminal: "f-pdm-3" }, to: { component: "hl-L", terminal: "56a" }, gaugeClass: "high", route: ["engine-front"] },
  { id: "w-hl-hi-R", label: "HL.HI.OUT.R", name: "High beam RIGHT", circuit: "c-headlights", from: { component: "pdm", terminal: "f-pdm-4" }, to: { component: "hl-R", terminal: "56a" }, gaugeClass: "high", route: ["engine-front"] },
  { id: "w-hl-tell", label: "HL.HI.TELL", name: "High beam → blue tell-tale", circuit: "c-headlights", from: { component: "rly-high", terminal: "87" }, to: { component: "wl-main", terminal: "in" }, gaugeClass: "signal", route: ["engine-front", "dash"], via: ["bh4", "bh2"] },
  { id: "w-hl-L-gnd", label: "HL.GND.L", name: "Headlight LEFT ground", circuit: "c-headlights", from: { component: "hl-L", terminal: "g" }, to: { component: "gnd-front", terminal: "g" }, gaugeClass: "high", route: ["engine-front"] },
  { id: "w-hl-R-gnd", label: "HL.GND.R", name: "Headlight RIGHT ground", circuit: "c-headlights", from: { component: "hl-R", terminal: "g" }, to: { component: "gnd-front", terminal: "g" }, gaugeClass: "high", route: ["engine-front"] },

  // =========================================================================
  // POSITION / TAIL / PLATE (constant bus)
  // =========================================================================
  { id: "w-pos-front", label: "POS.OUT.F", name: "Ign bus → front position (running light; jumpers L→R at the lamp)", circuit: "c-position", from: { component: "rtmr-ign", terminal: "f-ign-10" }, to: { component: "park-fl", terminal: "58" }, gaugeClass: "medium", route: ["engine-front"], via: ["bh4"], note: "Position lamps now run as IGNITION-on running lights (no switch) — front feed goes hub→front clip, no longer via the dash." },
  { id: "w-pos-fr", label: "POS.FRONT.JMP", name: "Front position jumper LEFT → RIGHT (piggyback at the lamp)", circuit: "c-position", from: { component: "park-fl", terminal: "58" }, to: { component: "park-fr", terminal: "58" }, gaugeClass: "medium", route: ["engine-front"], slackMm: 1000, note: "Same node as the LH lamp — jumper instead of a second parallel feed through the firewall. ~1.3 m across the front panel (car width 1580 / track 1324)." },
  { id: "w-pos-rear-L", label: "POS.REAR.L", name: "Ign bus → rear LEFT tail (running light)", circuit: "c-position", from: { component: "rtmr-ign", terminal: "f-ign-10" }, to: { component: "tail-rl", terminal: "58" }, gaugeClass: "medium", route: ["engine-front", "dash", "rear"], via: ["bh3"], note: "Rear tails on the ignition running-light feed (on with the key)." },
  { id: "w-pos-rear-R", label: "POS.REAR.R", name: "Rear LEFT → rear RIGHT tail (jumper)", circuit: "c-position", from: { component: "tail-rl", terminal: "58" }, to: { component: "tail-rr", terminal: "58" }, gaugeClass: "medium", route: ["rear"], slackMm: 1000, note: "~1.3 m across the rear panel (car width)." },
  { id: "w-plate", label: "PLATE.L", name: "Position → number-plate light LEFT", circuit: "c-position", from: { component: "tail-rl", terminal: "58" }, to: { component: "plate", terminal: "58" }, gaugeClass: "low", route: ["rear"] },
  { id: "w-plate-r", label: "PLATE.R", name: "Position → number-plate light RIGHT", circuit: "c-position", from: { component: "tail-rr", terminal: "58" }, to: { component: "plate-r", terminal: "58" }, gaugeClass: "low", route: ["rear"] },
  { id: "w-tail-L-gnd", label: "TAIL.GND.L", name: "Rear LEFT lamp ground", circuit: "c-position", from: { component: "tail-rl", terminal: "g" }, to: { component: "gnd-rear", terminal: "g" }, gaugeClass: "medium", route: ["rear"] },
  { id: "w-tail-R-gnd", label: "TAIL.GND.R", name: "Rear RIGHT lamp ground", circuit: "c-position", from: { component: "tail-rr", terminal: "g" }, to: { component: "gnd-rear", terminal: "g" }, gaugeClass: "medium", route: ["rear"] },
  { id: "w-plate-gnd", label: "PLATE.GND.L", name: "Plate light LEFT ground", circuit: "c-position", from: { component: "plate", terminal: "g" }, to: { component: "gnd-rear", terminal: "g" }, gaugeClass: "low", route: ["rear"] },
  { id: "w-plate-r-gnd", label: "PLATE.GND.R", name: "Plate light RIGHT ground", circuit: "c-position", from: { component: "plate-r", terminal: "g" }, to: { component: "gnd-rear", terminal: "g" }, gaugeClass: "low", route: ["rear"] },

  // =========================================================================
  // TURN SIGNALS (relay-driven) + HAZARD
  // =========================================================================
  { id: "w-flasher-in", label: "FLSH.+B", name: "Constant bus → flasher feed (so hazards work key-off)", circuit: "c-turn", from: { component: "rtmr-const", terminal: "f-con-8" }, to: { component: "flasher", terminal: "49" }, gaugeClass: "low", route: ["engine-front"], note: "One shared fuse feeds the flasher → both turn-relay commons. Per-side fusing was considered (decided 2026-05-27, declined): it would need INLINE fuses (the bussed RTMR can't fuse the flasher output) and the flasher is a shared single point anyway, so the marginal benefit (surviving a single-side branch short) wasn't worth the only out-of-block fuses in the build." },
  { id: "w-turn-sw-feed", label: "TURN.SW.+I", name: "Ignition bus → turn switch (coil select)", circuit: "c-turn", from: { component: "rtmr-ign", terminal: "f-ign-4" }, to: { component: "sw-turn", terminal: "in" }, gaugeClass: "signal", route: ["engine-front", "dash"], via: ["bh1"] },
  { id: "w-turnL-trg", label: "TURN.L.TRG", name: "Turn switch LEFT → turn-L relay coil", circuit: "c-turn", from: { component: "sw-turn", terminal: "L" }, to: { component: "rly-turnL", terminal: "86" }, gaugeClass: "signal", route: ["dash", "engine-front"], via: ["bh2"] },
  { id: "w-turnR-trg", label: "TURN.R.TRG", name: "Turn switch RIGHT → turn-R relay coil", circuit: "c-turn", from: { component: "sw-turn", terminal: "R" }, to: { component: "rly-turnR", terminal: "86" }, gaugeClass: "signal", route: ["dash", "engine-front"], via: ["bh2"] },
  { id: "w-turnL-30", label: "TURN.L.COM", name: "Flasher (flashing) → turn-L relay common", circuit: "c-turn", from: { component: "flasher", terminal: "49a" }, to: { component: "rly-turnL", terminal: "30" }, gaugeClass: "medium", route: ["engine-front"], note: "Flasher and both turn relays are all engine-side — stays on the hub, no bulkhead crossing." },
  { id: "w-turnR-30", label: "TURN.COM.JMP", name: "Turn-L common → turn-R common (piggyback; same flasher node)", circuit: "c-turn", from: { component: "rly-turnL", terminal: "30" }, to: { component: "rly-turnR", terminal: "30" }, gaugeClass: "medium", route: ["engine-front"], note: "Both relay commons share the flasher output — one jumper, no parallel run." },
  { id: "w-turnL-fr", label: "TURN.L.OUT.F", name: "Turn-L relay → front LEFT", circuit: "c-turn", from: { component: "rly-turnL", terminal: "87" }, to: { component: "turn-fl", terminal: "L" }, gaugeClass: "medium", route: ["engine-front"], via: ["bh4"] },
  { id: "w-turnL-rr", label: "TURN.L.OUT.R", name: "Turn-L relay → rear LEFT", circuit: "c-turn", from: { component: "rly-turnL", terminal: "87" }, to: { component: "turn-rl", terminal: "L" }, gaugeClass: "medium", route: ["engine-front", "dash", "rear"], via: ["bh3"] },
  { id: "w-turnR-fr", label: "TURN.R.OUT.F", name: "Turn-R relay → front RIGHT", circuit: "c-turn", from: { component: "rly-turnR", terminal: "87" }, to: { component: "turn-fr", terminal: "R" }, gaugeClass: "medium", route: ["engine-front"], via: ["bh4"] },
  { id: "w-turnR-rr", label: "TURN.R.OUT.R", name: "Turn-R relay → rear RIGHT", circuit: "c-turn", from: { component: "rly-turnR", terminal: "87" }, to: { component: "turn-rr", terminal: "R" }, gaugeClass: "medium", route: ["engine-front", "dash", "rear"], via: ["bh3"] },
  { id: "w-side-L", label: "SIDE.L", name: "Front turn LEFT → side repeater LEFT (piggyback at the front)", circuit: "c-turn", from: { component: "turn-fl", terminal: "L" }, to: { component: "side-l", terminal: "in" }, gaugeClass: "low", route: ["engine-front"], note: "Repeater jumps off the front indicator — same node, no separate feed through BH4." },
  { id: "w-side-R", label: "SIDE.R", name: "Front turn RIGHT → side repeater RIGHT (piggyback at the front)", circuit: "c-turn", from: { component: "turn-fr", terminal: "R" }, to: { component: "side-r", terminal: "in" }, gaugeClass: "low", route: ["engine-front"], note: "Repeater jumps off the front indicator — same node, no separate feed through BH4." },
  { id: "w-side-L-gnd", label: "SIDE.GND.L", name: "Side marker LEFT ground", circuit: "c-turn", from: { component: "side-l", terminal: "g" }, to: { component: "gnd-front", terminal: "g" }, gaugeClass: "low", route: ["engine-front"] },
  { id: "w-side-R-gnd", label: "SIDE.GND.R", name: "Side marker RIGHT ground", circuit: "c-turn", from: { component: "side-r", terminal: "g" }, to: { component: "gnd-front", terminal: "g" }, gaugeClass: "low", route: ["engine-front"] },
  { id: "w-tell-L", label: "TURN.TELL.L", name: "Turn-L output → green tell-tale (via diode)", circuit: "c-turn", from: { component: "rly-turnL", terminal: "87" }, to: { component: "wl-turn", terminal: "in" }, gaugeClass: "signal", route: ["engine-front", "dash"], via: ["bh2"], diodes: ["d-tell-L"] },
  { id: "w-tell-R", label: "TURN.TELL.R", name: "Turn-R output → green tell-tale (via diode)", circuit: "c-turn", from: { component: "rly-turnR", terminal: "87" }, to: { component: "wl-turn", terminal: "in" }, gaugeClass: "signal", route: ["engine-front", "dash"], via: ["bh2"], diodes: ["d-tell-R"] },
  { id: "w-tell-gnd", label: "TURN.TELL.GND", name: "Turn tell-tale ground", circuit: "c-turn", from: { component: "wl-turn", terminal: "g" }, to: { component: "gnd-dash", terminal: "g" }, gaugeClass: "signal", route: ["dash"] },
  // hazard
  { id: "w-haz-in", label: "HAZ.+B", name: "Constant bus → hazard switch (coil supply)", circuit: "c-hazard", from: { component: "rtmr-const", terminal: "f-con-1" }, to: { component: "sw-hazard", terminal: "30" }, gaugeClass: "signal", route: ["engine-front", "dash"], via: ["bh1"] },
  { id: "w-haz-L-trg", label: "HAZ.L.TRG", name: "Hazard → turn-L relay coil (via diode)", circuit: "c-hazard", from: { component: "sw-hazard", terminal: "L" }, to: { component: "rly-turnL", terminal: "86" }, gaugeClass: "signal", route: ["dash", "engine-front"], via: ["bh2"], diodes: ["d-haz-L"] },
  { id: "w-haz-R-trg", label: "HAZ.R.TRG", name: "Hazard → turn-R relay coil (via diode)", circuit: "c-hazard", from: { component: "sw-hazard", terminal: "R" }, to: { component: "rly-turnR", terminal: "86" }, gaugeClass: "signal", route: ["dash", "engine-front"], via: ["bh2"], diodes: ["d-haz-R"] },

  // =========================================================================
  // BRAKE / REVERSE
  // =========================================================================
  { id: "w-brake-in", label: "BRK.+B", name: "Constant bus → brake switch", circuit: "c-brake", from: { component: "rtmr-const", terminal: "f-con-3" }, to: { component: "sw-brake", terminal: "in" }, gaugeClass: "medium", route: ["engine-front", "engine-rear"] },
  { id: "w-brake-L", label: "BRK.OUT.L", name: "Brake switch → rear stop LEFT", circuit: "c-brake", from: { component: "sw-brake", terminal: "out" }, to: { component: "tail-rl", terminal: "54" }, gaugeClass: "medium", route: ["engine-rear", "dash", "rear"], via: ["bh3"] },
  { id: "w-brake-R", label: "BRK.JMP", name: "Rear stop LEFT → rear stop RIGHT (piggyback at the lamp)", circuit: "c-brake", from: { component: "tail-rl", terminal: "54" }, to: { component: "tail-rr", terminal: "54" }, gaugeClass: "medium", route: ["rear"], slackMm: 1000, note: "Both stops share the brake-switch output — jumper at the rear (~1.3 m across the rear panel), one feed through BH3." },
  { id: "w-rev-in", label: "REV.+I", name: "Ignition bus → reverse switch", circuit: "c-reverse", from: { component: "rtmr-ign", terminal: "f-ign-7" }, to: { component: "sw-reverse", terminal: "in" }, gaugeClass: "low", route: ["engine-front", "engine-rear"] },
  { id: "w-rev-out", label: "REV.OUT", name: "Reverse switch → reverse lamp", circuit: "c-reverse", from: { component: "sw-reverse", terminal: "out" }, to: { component: "reverse", terminal: "in" }, gaugeClass: "low", route: ["engine-rear", "dash", "rear"], via: ["bh3"] },

  // =========================================================================
  // INSTRUMENTS / SENDERS / WARNING
  // =========================================================================
  { id: "w-g-fuel-i", label: "GAUGE.+I", name: "Ignition bus → gauges feed", circuit: "c-instruments", from: { component: "rtmr-ign", terminal: "f-ign-2" }, to: { component: "g-fuel", terminal: "+" }, gaugeClass: "signal", route: ["engine-front", "dash"], via: ["bh1"] },
  { id: "w-fuel-sig", label: "FUEL.SIG", name: "Tank sender → fuel gauge", circuit: "c-instruments", from: { component: "snd-fuel", terminal: "s" }, to: { component: "g-fuel", terminal: "s" }, gaugeClass: "signal", route: ["rear", "dash"], via: ["bh3"] },
  { id: "w-temp-sig", label: "TEMP.SIG", name: "Coolant-temp sender → gauge", circuit: "c-instruments", from: { component: "snd-temp", terminal: "s" }, to: { component: "g-temp", terminal: "s" }, gaugeClass: "signal", route: ["engine-rear", "dash"], via: ["bh1"] },
  { id: "w-oilp-sig", label: "OILP.SIG", name: "Oil sender → oil-pressure gauge", circuit: "c-instruments", from: { component: "snd-oil", terminal: "s" }, to: { component: "g-oil", terminal: "s" }, gaugeClass: "signal", route: ["engine-rear", "dash"], via: ["bh1"] },
  { id: "w-oil-wl", label: "OIL.WL", name: "Oil-pressure switch → warning lamp", circuit: "c-instruments", from: { component: "sw-oillight", terminal: "s" }, to: { component: "wl-oil", terminal: "s" }, gaugeClass: "signal", route: ["engine-rear", "dash"], via: ["bh1"] },
  { id: "w-tach-sig", label: "TACH.SIG", name: "Coil − → tachometer", circuit: "c-instruments", from: { component: "coil", terminal: "1" }, to: { component: "g-tach", terminal: "sig" }, gaugeClass: "signal", route: ["engine-rear", "dash"], via: ["bh1"] },
  { id: "w-wl-i", label: "WL.+I", name: "Gauges feed → warning lamps (jumper at the dash)", circuit: "c-instruments", from: { component: "g-fuel", terminal: "+" }, to: { component: "wl-oil", terminal: "+" }, gaugeClass: "signal", route: ["dash"], note: "Warning lamps jumper off the gauges feed at the dash (both on the instruments fuse) — frees an ign slot for the accessory circuit, no parallel run." },
  { id: "w-ill-dim", label: "ILL.DIM", name: "Instrument-light switch DIM → dimmer preset", circuit: "c-instruments", from: { component: "sw-instr", terminal: "dim" }, to: { component: "instr-pwm", terminal: "lo" }, gaugeClass: "low", route: ["engine-rear"], via: ["sw3"] },
  { id: "w-ill-brt", label: "ILL.BRT", name: "Instrument-light switch BRIGHT → dimmer preset", circuit: "c-instruments", from: { component: "sw-instr", terminal: "bright" }, to: { component: "instr-pwm", terminal: "hi" }, gaugeClass: "low", route: ["engine-rear"], via: ["sw3"] },
  { id: "w-ill-out", label: "ILL.OUT", name: "Dimmer → panel illumination (single circuit into the dash, daisy-chains all gauges)", circuit: "c-instruments", from: { component: "instr-pwm", terminal: "out" }, to: { component: "g-fuel", terminal: "ill" }, gaugeClass: "low", route: ["engine-rear", "dash"], via: ["bh1"] },
  { id: "w-ill-pwm-gnd", label: "ILL.PWM.GND", name: "Dimmer module ground reference (loom-side hub)", circuit: "c-instruments", from: { component: "instr-pwm", terminal: "g" }, to: { component: "gnd-eng", terminal: "g" }, gaugeClass: "signal", route: ["engine-rear", "engine-front"] },
  { id: "w-g-gnd", label: "GAUGE.GND", name: "Gauges ground", circuit: "c-instruments", from: { component: "g-fuel", terminal: "g" }, to: { component: "gnd-dash", terminal: "g" }, gaugeClass: "signal", route: ["dash"] },
  { id: "w-temp-gnd", label: "TEMP.GND", name: "Temp sender ground (block)", circuit: "c-instruments", from: { component: "snd-temp", terminal: "g" }, to: { component: "gnd-eng", terminal: "g" }, gaugeClass: "signal", route: ["engine-rear", "engine-front"] },

  // =========================================================================
  // WIPERS / WASHER  (Bosch 2-speed self-park)
  // =========================================================================
  // One signal+ feeds the whole 3-way switch cluster, piggybacked across the three switch commons.
  { id: "w-sw3-feed", label: "SW3.+I", name: "Ignition bus → 3-way switch cluster supply (single feed)", circuit: "c-instruments", from: { component: "rtmr-ign", terminal: "f-ign-9" }, to: { component: "sw-wiper", terminal: "in" }, gaugeClass: "signal", route: ["engine-front", "engine-rear"], via: ["sw3"] },
  { id: "w-sw3-jmp-wi", label: "SW3.+I.J1", name: "Switch-supply piggyback: wiper → instrument-light", circuit: "c-instruments", from: { component: "sw-wiper", terminal: "in" }, to: { component: "sw-instr", terminal: "in" }, gaugeClass: "signal", route: ["engine-rear"], note: "Internal cluster jumper — does not leave the switch cluster." },
  { id: "w-sw3-jmp-if", label: "SW3.+I.J2", name: "Switch-supply piggyback: instrument-light → heater-fan", circuit: "c-instruments", from: { component: "sw-instr", terminal: "in" }, to: { component: "sw-heaterfan", terminal: "in" }, gaugeClass: "signal", route: ["engine-rear"], note: "Internal cluster jumper — does not leave the switch cluster." },
  { id: "w-wlow-trg", label: "WIPE.LO.TRG", name: "Wiper switch LOW → wiper-LOW relay coil", circuit: "c-wipers", from: { component: "sw-wiper", terminal: "low" }, to: { component: "rly-wlow", terminal: "86" }, gaugeClass: "signal", route: ["engine-rear", "engine-front"], via: ["sw3"] },
  { id: "w-whigh-trg", label: "WIPE.HI.TRG", name: "Wiper switch HIGH → wiper-HIGH relay coil", circuit: "c-wipers", from: { component: "sw-wiper", terminal: "high" }, to: { component: "rly-whigh", terminal: "86" }, gaugeClass: "signal", route: ["engine-rear", "engine-front"], via: ["sw3"] },
  { id: "w-wlow-30", label: "WIPE.LO.+", name: "Ignition bus → wiper-LOW relay common", circuit: "c-wipers", from: { component: "rtmr-ign", terminal: "f-ign-5" }, to: { component: "rly-wlow", terminal: "30" }, gaugeClass: "medium", route: ["engine-front"] },
  { id: "w-whigh-30", label: "WIPE.HI.+", name: "Ignition bus → wiper-HIGH relay common", circuit: "c-wipers", from: { component: "rtmr-ign", terminal: "f-ign-5" }, to: { component: "rly-whigh", terminal: "30" }, gaugeClass: "high", route: ["engine-front"] },
  { id: "w-wlow-out", label: "WIPE.53", name: "Wiper-LOW relay → motor 53 (run)", circuit: "c-wipers", from: { component: "rly-wlow", terminal: "87" }, to: { component: "wiper", terminal: "53" }, gaugeClass: "medium", route: ["engine-front", "engine-rear"] },
  { id: "w-wpark-out", label: "WIPE.53a", name: "Wiper-LOW relay NC → motor 53a (self-park)", circuit: "c-wipers", from: { component: "rly-wlow", terminal: "87a" }, to: { component: "wiper", terminal: "53a" }, gaugeClass: "medium", route: ["engine-front", "engine-rear"] },
  { id: "w-whigh-out", label: "WIPE.53b", name: "Wiper-HIGH relay → motor 53b", circuit: "c-wipers", from: { component: "rly-whigh", terminal: "87" }, to: { component: "wiper", terminal: "53b" }, gaugeClass: "high", route: ["engine-front", "engine-rear"] },
  { id: "w-wipe-gnd", label: "WIPE.31", name: "Wiper motor ground", circuit: "c-wipers", from: { component: "wiper", terminal: "31" }, to: { component: "gnd-eng", terminal: "g" }, gaugeClass: "medium", route: ["engine-rear", "engine-front"] },
  { id: "w-wash-feed", label: "WASH.+I", name: "Ignition bus → washer button (trigger supply)", circuit: "c-wipers", from: { component: "rtmr-ign", terminal: "f-ign-5" }, to: { component: "sw-washer", terminal: "in" }, gaugeClass: "signal", route: ["engine-front", "dash"], via: ["bh1"], note: "Vintage washer button fed key-on off the wiper/washer fuse — coil-trigger current only." },
  { id: "w-wash-trg", label: "WASH.TRG", name: "Washer button → washer-pump relay coil", circuit: "c-wipers", from: { component: "sw-washer", terminal: "out" }, to: { component: "rly-washer", terminal: "86" }, gaugeClass: "signal", route: ["dash", "engine-front"], via: ["bh1"], note: "Button only triggers the relay coil — the relay carries the pump." },
  { id: "w-wash-com", label: "WASH.+B", name: "Wiper/washer fuse → washer-pump relay common", circuit: "c-wipers", from: { component: "rtmr-ign", terminal: "f-ign-5" }, to: { component: "rly-washer", terminal: "30" }, gaugeClass: "medium", route: ["engine-front"], note: "Relay common (pump feed) on the wiper/washer fuse — key-on." },
  { id: "w-wash-out", label: "WASH.OUT", name: "Washer relay → electric washer pump", circuit: "c-wipers", from: { component: "rly-washer", terminal: "87" }, to: { component: "washer-pump", terminal: "53c" }, gaugeClass: "medium", route: ["engine-front", "engine-rear"], note: "Capped at the pump connector until the (deferred) electric pump is fitted — then it's plug-in." },
  { id: "w-wash-gnd", label: "WASH.31", name: "Washer pump ground (local to the engine-bay hub)", circuit: "c-wipers", from: { component: "washer-pump", terminal: "g" }, to: { component: "gnd-eng", terminal: "g" }, gaugeClass: "medium", route: ["engine-rear", "engine-front"], note: "Pump grounds locally to the hub." },

  // =========================================================================
  // HEATER FAN
  // =========================================================================
  { id: "w-fan-trg", label: "FAN.TRG", name: "Heater-fan switch HIGH → fan relay coil", circuit: "c-cooling", from: { component: "sw-heaterfan", terminal: "high" }, to: { component: "rly-fan", terminal: "86" }, gaugeClass: "signal", route: ["engine-rear", "engine-front"], via: ["sw3"] },
  { id: "w-fan-lo", label: "FAN.LOW.EN", name: "Heater-fan switch LOW → PWM/resistor enable (low current)", circuit: "c-cooling", from: { component: "sw-heaterfan", terminal: "low" }, to: { component: "fan-resistor", terminal: "en" }, gaugeClass: "signal", route: ["engine-rear"], via: ["sw3"], future: true },
  { id: "w-fan-pwr", label: "FAN.PWM.+", name: "Constant blower fuse → PWM/resistor power in (high current)", circuit: "c-cooling", from: { component: "rtmr-const", terminal: "f-con-4" }, to: { component: "fan-resistor", terminal: "pwr" }, gaugeClass: "high", route: ["engine-front", "engine-rear"], future: true },
  { id: "w-fan-pwm-out", label: "FAN.LOW.OUT", name: "PWM/resistor → blower (low speed)", circuit: "c-cooling", from: { component: "fan-resistor", terminal: "out" }, to: { component: "heater-fan", terminal: "in" }, gaugeClass: "high", route: ["engine-rear"], future: true },
  { id: "w-fan-out", label: "FAN.OUT", name: "Fan relay → heater blower (full speed)", circuit: "c-cooling", from: { component: "rly-fan", terminal: "87" }, to: { component: "heater-fan", terminal: "in" }, gaugeClass: "high", route: ["engine-front", "engine-rear"] },
  { id: "w-fan-30", label: "FAN.+", name: "Constant blower fuse → fan relay common", circuit: "c-cooling", from: { component: "rtmr-const", terminal: "f-con-4" }, to: { component: "rly-fan", terminal: "30" }, gaugeClass: "high", route: ["engine-front"], note: "Blower power on the constant bus; the ignition-gated coil keeps it key-on only — keeps ~15 A off the ignition-main relay." },
  { id: "w-fan-gnd", label: "FAN.GND", name: "Heater blower ground", circuit: "c-cooling", from: { component: "heater-fan", terminal: "g" }, to: { component: "gnd-eng", terminal: "g" }, gaugeClass: "high", route: ["engine-rear", "engine-front"] },

  // =========================================================================
  // FUEL PUMP
  // =========================================================================
  { id: "w-fuel-trg", label: "FUEL.TRG", name: "Ignition → fuel-pump relay coil", circuit: "c-fuel", from: { component: "rtmr-ign", terminal: "f-ign-8" }, to: { component: "rly-fuel", terminal: "86" }, gaugeClass: "signal", route: ["engine-front"], diodes: ["d-coil-fuel"], note: "Plain ignition-switched — pump runs key-on, stops key-off. (Low-pressure carb pump, so no inertia cut-off; add one in this wire only if you later fit a high-pressure EFI pump.)" },
  { id: "w-fuel-30", label: "FUEL.+", name: "Ignition bus → fuel relay common", circuit: "c-fuel", from: { component: "rtmr-ign", terminal: "f-ign-8" }, to: { component: "rly-fuel", terminal: "30" }, gaugeClass: "high", route: ["engine-front"] },
  { id: "w-fuel-out", label: "FUEL.OUT", name: "Fuel relay → pump", circuit: "c-fuel", from: { component: "rly-fuel", terminal: "87" }, to: { component: "fuel-pump", terminal: "in" }, gaugeClass: "high", route: ["engine-front", "dash", "rear"], via: ["bh3"] },
  { id: "w-fuel-gnd", label: "FUEL.GND", name: "Fuel pump ground", circuit: "c-fuel", from: { component: "fuel-pump", terminal: "g" }, to: { component: "gnd-rear", terminal: "g" }, gaugeClass: "high", route: ["rear"] },

  // =========================================================================
  // HORN
  // =========================================================================
  { id: "w-horn-30", label: "HORN.+B", name: "Constant bus → horn relay common", circuit: "c-horn", from: { component: "rtmr-const", terminal: "f-con-2" }, to: { component: "rly-horn", terminal: "30" }, gaugeClass: "high", route: ["engine-front"] },
  { id: "w-horn-out", label: "HORN.OUT", name: "Horn relay → horns", circuit: "c-horn", from: { component: "rly-horn", terminal: "87" }, to: { component: "horn-hi", terminal: "in" }, gaugeClass: "high", route: ["engine-front"], via: ["bh4"] },
  { id: "w-horn-out2", label: "HORN.OUT2", name: "Horn relay → low-tone horn", circuit: "c-horn", from: { component: "horn-hi", terminal: "in" }, to: { component: "horn-lo", terminal: "in" }, gaugeClass: "high", route: ["engine-front"] },
  { id: "w-horn-trg", label: "HORN.TRG", name: "Horn relay coil → horn button", circuit: "c-horn", from: { component: "rly-horn", terminal: "86" }, to: { component: "sw-horn", terminal: "in" }, gaugeClass: "signal", route: ["engine-front", "dash"], via: ["bh2"] },
  { id: "w-horn-btn-gnd", label: "HORN.BTN.GND", name: "Horn button ground", circuit: "c-horn", from: { component: "sw-horn", terminal: "g" }, to: { component: "gnd-dash", terminal: "g" }, gaugeClass: "signal", route: ["dash"] },
  { id: "w-horn-gnd", label: "HORN.GND", name: "Horn ground", circuit: "c-horn", from: { component: "horn-hi", terminal: "g" }, to: { component: "gnd-front", terminal: "g" }, gaugeClass: "high", route: ["engine-front"] },

  // =========================================================================
  // INTERIOR / AUX
  // =========================================================================
  { id: "w-int-feed", label: "INT.+B", name: "Constant bus → interior light", circuit: "c-interior", from: { component: "rtmr-const", terminal: "f-con-6" }, to: { component: "int-light", terminal: "+" }, gaugeClass: "low", route: ["engine-front", "dash", "cabin"], via: ["bh1"] },
  { id: "w-int-door-l", label: "INT.DOOR.L", name: "Interior light → door switch LEFT", circuit: "c-interior", from: { component: "int-light", terminal: "sw" }, to: { component: "sw-door-l", terminal: "in" }, gaugeClass: "low", route: ["cabin"] },
  { id: "w-int-door-r", label: "INT.DOOR.R", name: "Interior light → door switch RIGHT", circuit: "c-interior", from: { component: "int-light", terminal: "sw" }, to: { component: "sw-door-r", terminal: "in" }, gaugeClass: "low", route: ["cabin"] },

  // ACCESSORY — dash USB-C charge port + Bluetooth-amp stereo (ignition-switched)
  { id: "w-acc-feed", label: "ACC.+I", name: "Ignition bus → dash accessory (USB / stereo)", circuit: "c-accessory", from: { component: "rtmr-ign", terminal: "f-ign-3" }, to: { component: "usb-charge", terminal: "in" }, gaugeClass: "medium", route: ["engine-front", "dash"], via: ["bh1"], note: "One ignition-switched accessory feed across the firewall; the stereo jumpers off it at the dash (piggyback, no parallel run). Key-on only — no parasitic drain." },
  { id: "w-acc-usb-gnd", label: "USB.GND", name: "USB charge port ground", circuit: "c-accessory", from: { component: "usb-charge", terminal: "g" }, to: { component: "gnd-dash", terminal: "g" }, gaugeClass: "medium", route: ["dash"] },
  { id: "w-acc-stereo", label: "ACC.STEREO.JMP", name: "Accessory feed → stereo (jumper at the dash)", circuit: "c-accessory", from: { component: "usb-charge", terminal: "in" }, to: { component: "stereo", terminal: "+B" }, gaugeClass: "medium", route: ["dash"], note: "Same node as the USB feed — jumper at the dash, no second firewall run." },
  { id: "w-acc-stereo-gnd", label: "STEREO.GND", name: "Stereo ground", circuit: "c-accessory", from: { component: "stereo", terminal: "g" }, to: { component: "gnd-dash", terminal: "g" }, gaugeClass: "medium", route: ["dash"] },

  // =========================================================================
  // FUTURE — O2 / AFR (provisioned, capped)
  // =========================================================================
  { id: "w-o2-feed", label: "O2.+I", name: "Gauges feed → AFR gauge (future; jumper at the dash)", circuit: "c-future-o2", from: { component: "g-fuel", terminal: "+" }, to: { component: "g-afr", terminal: "+" }, gaugeClass: "low", route: ["dash"], future: true, note: "Future AFR gauge taps the instruments feed at the dash (its old dedicated ign slot, f-ign-10, was reassigned to the running lights — O2 on a carb is speculative)." },
  { id: "w-o2-sig", label: "O2.SIG", name: "O2 controller → AFR gauge (future)", circuit: "c-future-o2", from: { component: "o2-sensor", terminal: "sig" }, to: { component: "g-afr", terminal: "sig" }, gaugeClass: "signal", route: ["engine-rear", "dash"], via: ["bh1"], future: true },
  { id: "w-o2-gnd", label: "O2.GND", name: "O2 sensor ground (future)", circuit: "c-future-o2", from: { component: "o2-sensor", terminal: "g" }, to: { component: "gnd-eng", terminal: "g" }, gaugeClass: "signal", route: ["engine-rear", "engine-front"], future: true },
];
