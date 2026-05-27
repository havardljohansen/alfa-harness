// =============================================================================
// FACTORY NETLIST — wire-by-wire trace of the ORIGINAL diagram (10530, 11/69).
// -----------------------------------------------------------------------------
// Companion to factory.ts: factory.ts holds the ARCHITECTURE (so there's no
// confusion when building the new harness); this is the wire-level detail.
//
//   • CONNECTIVITY (from → to, terminals) follows the printed fuse legend, the
//     DIN terminal numbers, and the standard Giulia GT layout — high confidence.
//   • GROUNDS are deliberate and verified: the factory car is a BODY-RETURN
//     system. Every load returns to the steel body (the `body` node), via a
//     black wire or its metal mounting. This is exactly what the modern harness
//     replaces with dedicated star grounds, so it's the part to get right.
//   • COLOUR is filled for every wire. `conf` flags certainty: "read" = legible
//     on the diagram / a black ground; "scheme" = filled from the standard
//     Giulia colour code where the dense dash bundle wasn't resolvable at scan
//     resolution (worth a glance at the PDF).
//   • loadA = approximate steady operating current (A) at ~12 V, from typical
//     period bulb/motor ratings. Lighting uses ~5 W ÷ 12 ≈ 0.4 A markers, 21 W
//     ≈ 1.75 A stop/turn, ~45–55 W ≈ 4–5 A beams. Ground wires carry the return
//     of whatever they earth. Starter/charging figures are intermittent PEAKS,
//     flagged in the note — size those by peak, not steady draw.
//   • mm² omitted = 1.0 (the diagram's default: "all wires 1.0 unless noted").
// =============================================================================

export type ColourConf = "read" | "scheme";

export interface FactoryNetWire {
  id: string;
  color: string;
  conf: ColourConf;
  loadA: number; // approx operating current (A); see header for basis
  mm2?: number;
  from: { comp: string; term?: string };
  to: { comp: string; term?: string };
  fuse?: number; // fusebox position this wire passes through, if any
  section: string;
  note?: string;
}

export const FACTORY_GROUND = "body";

export const factoryNet: FactoryNetWire[] = [
  // ===========================================================================
  // BATTERY · CHARGING · STARTING  (the heavy gauges)
  // ===========================================================================
  { id: "o-bat-pos-starter", color: "Red", conf: "read", loadA: 150, mm2: 4.0, from: { comp: "battery", term: "+" }, to: { comp: "starter", term: "30" }, section: "power", note: "Main battery feed to the starter post. PEAK: ~120–200 A while cranking." },
  { id: "o-bat-neg-body", color: "Black", conf: "read", loadA: 150, mm2: 4.0, from: { comp: "battery", term: "-" }, to: { comp: "body" }, section: "ground", note: "GROUND: battery − strap to body — returns the whole car; PEAK = cranking current." },
  { id: "o-engine-body", color: "Black", conf: "read", loadA: 150, mm2: 4.0, from: { comp: "engine-block" }, to: { comp: "body" }, section: "ground", note: "GROUND: engine/gearbox to body — the starter's return path (PEAK while cranking)." },
  { id: "o-starter-ign", color: "Yellow/Black", conf: "scheme", loadA: 1, from: { comp: "starter", term: "50" }, to: { comp: "ign-switch", term: "50" }, section: "starting", note: "Solenoid trigger from key START. PEAK ~10–20 A pull-in, ~1 A hold." },

  { id: "o-gen-out", color: "Blue", conf: "scheme", loadA: 25, mm2: 4.0, from: { comp: "generator", term: "51" }, to: { comp: "regulator", term: "51" }, section: "charging", note: "Dynamo output (D+/51). PEAK = full charge ~25–30 A." },
  { id: "o-gen-df", color: "Green", conf: "read", loadA: 2, mm2: 4.0, from: { comp: "generator", term: "DF" }, to: { comp: "regulator", term: "DF" }, section: "charging", note: "Dynamo field." },
  { id: "o-reg-bat", color: "Red", conf: "scheme", loadA: 25, mm2: 4.0, from: { comp: "regulator", term: "51" }, to: { comp: "battery", term: "+" }, section: "charging", note: "Regulated output back to the battery / junction." },
  { id: "o-reg-61", color: "White/Black", conf: "scheme", loadA: 0.1, from: { comp: "regulator", term: "61" }, to: { comp: "wl-charge", term: "61" }, section: "charging", note: "Charge warning lamp (61)." },
  { id: "o-gen-body", color: "Black", conf: "read", loadA: 1, from: { comp: "generator" }, to: { comp: "body" }, section: "ground", note: "GROUND: dynamo case to body (via mounting)." },

  // ===========================================================================
  // IGNITION · COIL · DISTRIBUTOR · TACH
  // ===========================================================================
  { id: "o-bat-ign", color: "Red", conf: "scheme", loadA: 12, from: { comp: "battery", term: "+" }, to: { comp: "ign-switch", term: "30" }, section: "ignition", note: "Battery feed to the ignition switch (30) — carries all key-on loads." },
  { id: "o-ign-coil", color: "Red/Black", conf: "read", loadA: 3.5, from: { comp: "ign-switch", term: "15" }, to: { comp: "coil", term: "15" }, section: "ignition", note: "Run (15) feeds the coil +." },
  { id: "o-ign-fusebox", color: "Red", conf: "scheme", loadA: 10, from: { comp: "ign-switch", term: "15" }, to: { comp: "fusebox", term: "in-ign" }, section: "ignition", note: "Run (15) feeds the ignition-side fuses (gauges, wipers, fan, turn)." },
  { id: "o-coil-dist", color: "Green/Black", conf: "read", loadA: 3.5, from: { comp: "coil", term: "1" }, to: { comp: "dist", term: "1" }, section: "ignition", note: "Coil − to distributor (points)." },
  { id: "o-coil-tach", color: "Green", conf: "scheme", loadA: 0.05, from: { comp: "coil", term: "1" }, to: { comp: "tach", term: "sig" }, section: "instruments", note: "Coil − also drives the tachometer (signal)." },
  { id: "o-dist-body", color: "Black", conf: "read", loadA: 3.5, from: { comp: "dist" }, to: { comp: "body" }, section: "ground", note: "GROUND: distributor/points through the block." },

  // ===========================================================================
  // FUSEBOX — constant (battery) feed to the always-hot fuses
  // ===========================================================================
  { id: "o-bat-fusebox", color: "Red", conf: "scheme", loadA: 10, from: { comp: "battery", term: "+" }, to: { comp: "fusebox", term: "in-const" }, section: "power", note: "Constant feed for the always-hot fuses (lighter/courtesy, brake)." },
  { id: "o-light-sw-feed", color: "Gray", conf: "scheme", loadA: 15, from: { comp: "battery", term: "+" }, to: { comp: "headlight-switch", term: "in" }, section: "lighting", note: "Light switch fed from the battery — carries all lighting when full-on." },

  // ===========================================================================
  // HEADLIGHTS  (fuses 7–10) + dip switch + main-beam tell-tale
  // ===========================================================================
  { id: "o-lightsw-head", color: "Gray", conf: "scheme", loadA: 10, from: { comp: "headlight-switch", term: "head" }, to: { comp: "dip-switch", term: "in" }, section: "lighting", note: "Head position feeds the dip switch (both beams ~10 A)." },
  { id: "o-dip-main", color: "White", conf: "scheme", loadA: 9, from: { comp: "dip-switch", term: "main" }, to: { comp: "fusebox", term: "f7-in" }, fuse: 7, section: "lighting", note: "Dip switch MAIN → main-beam fuses (both sides)." },
  { id: "o-dip-dip", color: "Yellow", conf: "scheme", loadA: 8, from: { comp: "dip-switch", term: "dip" }, to: { comp: "fusebox", term: "f9-in" }, fuse: 9, section: "lighting", note: "Dip switch DIPPED → dipped-beam fuses (both sides)." },

  { id: "o-f7-hlL-main", color: "White", conf: "scheme", loadA: 4.5, from: { comp: "fusebox", term: "f7" }, to: { comp: "hl-L", term: "56a" }, fuse: 7, section: "lighting", note: "L main beam." },
  { id: "o-f8-hlR-main", color: "White/Black", conf: "scheme", loadA: 4.5, from: { comp: "fusebox", term: "f8" }, to: { comp: "hl-R", term: "56a" }, fuse: 8, section: "lighting", note: "R main beam." },
  { id: "o-f9-hlL-dip", color: "Yellow", conf: "scheme", loadA: 4, from: { comp: "fusebox", term: "f9" }, to: { comp: "hl-L", term: "56b" }, fuse: 9, section: "lighting", note: "L dipped beam." },
  { id: "o-f10-hlR-dip", color: "Yellow/Black", conf: "scheme", loadA: 4, from: { comp: "fusebox", term: "f10" }, to: { comp: "hl-R", term: "56b" }, fuse: 10, section: "lighting", note: "R dipped beam." },
  { id: "o-mainbeam-tell", color: "Blue", conf: "read", loadA: 0.1, from: { comp: "hl-L", term: "56a" }, to: { comp: "wl-main", term: "in" }, section: "lighting", note: "Main-beam (blue) tell-tale tapped off the main feed." },
  { id: "o-hlL-body", color: "Black", conf: "read", loadA: 4.5, from: { comp: "hl-L", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: left headlight (one beam at a time)." },
  { id: "o-hlR-body", color: "Black", conf: "read", loadA: 4.5, from: { comp: "hl-R", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: right headlight (one beam at a time)." },

  // ===========================================================================
  // PARKING / POSITION + SIDE MARKERS  (fuses 4 & 5)
  // ===========================================================================
  { id: "o-lightsw-park", color: "Gray", conf: "scheme", loadA: 3, from: { comp: "headlight-switch", term: "park" }, to: { comp: "fusebox", term: "f4-in" }, fuse: 4, section: "position", note: "Park position feeds tail/plate/parking (all position lamps ~3 A)." },
  { id: "o-f4-park-fr", color: "Black", conf: "scheme", loadA: 0.4, from: { comp: "fusebox", term: "f4" }, to: { comp: "park-fr", term: "58" }, fuse: 4, section: "position", note: "RF parking light (~5 W)." },
  { id: "o-f5-park-lf", color: "Black", conf: "scheme", loadA: 0.4, from: { comp: "fusebox", term: "f5" }, to: { comp: "park-fl", term: "58" }, fuse: 5, section: "position", note: "LF parking light (~5 W)." },
  { id: "o-parkfr-body", color: "Black", conf: "read", loadA: 0.4, from: { comp: "park-fr", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: RF parking light." },
  { id: "o-parkfl-body", color: "Black", conf: "read", loadA: 0.4, from: { comp: "park-fl", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: LF parking light." },
  { id: "o-sideL-body", color: "Black", conf: "read", loadA: 0.3, from: { comp: "side-l", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: left side marker (~4 W)." },
  { id: "o-sideR-body", color: "Black", conf: "read", loadA: 0.3, from: { comp: "side-r", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: right side marker (~4 W)." },

  // ===========================================================================
  // TURN SIGNALS + FLASHER  (fuse 3)
  // ===========================================================================
  { id: "o-f3-flasher", color: "Green/Black", conf: "scheme", loadA: 3.5, from: { comp: "fusebox", term: "f3" }, to: { comp: "flasher", term: "49" }, fuse: 3, section: "turn", note: "Fuse 3 feeds the flasher (one side = front+rear ~3.5 A)." },
  { id: "o-flasher-sw", color: "Green/Black", conf: "scheme", loadA: 3.5, from: { comp: "flasher", term: "49a" }, to: { comp: "turn-switch", term: "in" }, section: "turn", note: "Flasher output to the column turn switch." },
  { id: "o-turn-L", color: "Pink", conf: "read", loadA: 3.5, from: { comp: "turn-switch", term: "L" }, to: { comp: "turn-fl", term: "in" }, section: "turn", note: "Left turn (front + rear, ~21 W each)." },
  { id: "o-turn-L-rear", color: "Pink", conf: "read", loadA: 1.75, from: { comp: "turn-fl", term: "in" }, to: { comp: "turn-rl", term: "in" }, section: "turn", note: "Left turn carried to the rear bulb." },
  { id: "o-turn-R", color: "Green", conf: "scheme", loadA: 3.5, from: { comp: "turn-switch", term: "R" }, to: { comp: "turn-fr", term: "in" }, section: "turn", note: "Right turn (front + rear)." },
  { id: "o-turn-R-rear", color: "Green", conf: "scheme", loadA: 1.75, from: { comp: "turn-fr", term: "in" }, to: { comp: "turn-rr", term: "in" }, section: "turn", note: "Right turn carried to the rear bulb." },
  { id: "o-turn-tell", color: "Gray", conf: "scheme", loadA: 0.1, from: { comp: "turn-switch", term: "tell" }, to: { comp: "wl-turn", term: "in" }, section: "turn", note: "Turn tell-tale." },
  { id: "o-turnfl-body", color: "Black", conf: "read", loadA: 1.75, from: { comp: "turn-fl", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: LF turn signal." },
  { id: "o-turnfr-body", color: "Black", conf: "read", loadA: 1.75, from: { comp: "turn-fr", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: RF turn signal." },
  { id: "o-turnrl-body", color: "Black", conf: "read", loadA: 1.75, from: { comp: "turn-rl", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: LR turn signal." },
  { id: "o-turnrr-body", color: "Black", conf: "read", loadA: 1.75, from: { comp: "turn-rr", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: RR turn signal." },

  // ===========================================================================
  // BRAKE LIGHTS  (fuse 2, constant side)
  // ===========================================================================
  { id: "o-f2-brake", color: "Red", conf: "scheme", loadA: 3.5, from: { comp: "fusebox", term: "f2" }, to: { comp: "brake-switch", term: "in" }, fuse: 2, section: "brake", note: "Brake switch (constant — both stops ~3.5 A)." },
  { id: "o-brake-L", color: "Red", conf: "scheme", loadA: 1.75, from: { comp: "brake-switch", term: "out" }, to: { comp: "tail-rl", term: "54" }, section: "brake", note: "Stop lamp, left (~21 W)." },
  { id: "o-brake-R", color: "Red", conf: "scheme", loadA: 1.75, from: { comp: "brake-switch", term: "out" }, to: { comp: "tail-rr", term: "54" }, section: "brake", note: "Stop lamp, right (~21 W)." },

  // ===========================================================================
  // REAR: TAIL / PLATE / REVERSE  (fuses 4 & 5) + grounds
  // ===========================================================================
  { id: "o-f4-tail-rl", color: "Black", conf: "scheme", loadA: 0.4, from: { comp: "fusebox", term: "f4" }, to: { comp: "tail-rl", term: "58" }, fuse: 4, section: "position", note: "LR tail light (~5 W)." },
  { id: "o-f5-tail-rr", color: "Black", conf: "scheme", loadA: 0.4, from: { comp: "fusebox", term: "f5" }, to: { comp: "tail-rr", term: "58" }, fuse: 5, section: "position", note: "RR tail light (~5 W)." },
  { id: "o-f4-plate-l", color: "Gray", conf: "scheme", loadA: 0.4, from: { comp: "fusebox", term: "f4" }, to: { comp: "plate-l", term: "58" }, fuse: 4, section: "position", note: "Left number-plate light." },
  { id: "o-f5-plate-r", color: "Gray", conf: "scheme", loadA: 0.4, from: { comp: "fusebox", term: "f5" }, to: { comp: "plate-r", term: "58" }, fuse: 5, section: "position", note: "Right number-plate light." },
  { id: "o-f4-rev-sw", color: "Black", conf: "scheme", loadA: 1.75, from: { comp: "fusebox", term: "f4" }, to: { comp: "reverse-switch", term: "in" }, fuse: 4, section: "reverse", note: "Reverse feed via gearbox switch (~21 W)." },
  { id: "o-rev-lamp", color: "Black", conf: "scheme", loadA: 1.75, from: { comp: "reverse-switch", term: "out" }, to: { comp: "reverse-light", term: "in" }, section: "reverse", note: "Reverse lamp." },
  { id: "o-tailrl-body", color: "Black", conf: "read", loadA: 2, from: { comp: "tail-rl", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: LR lamp (tail + brake + turn return through one earth)." },
  { id: "o-tailrr-body", color: "Black", conf: "read", loadA: 2, from: { comp: "tail-rr", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: RR lamp (tail + brake + turn return through one earth)." },
  { id: "o-platel-body", color: "Black", conf: "read", loadA: 0.4, from: { comp: "plate-l", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: left plate light." },
  { id: "o-plater-body", color: "Black", conf: "read", loadA: 0.4, from: { comp: "plate-r", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: right plate light." },
  { id: "o-rev-body", color: "Black", conf: "read", loadA: 1.75, from: { comp: "reverse-light", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: reverse lamp." },

  // ===========================================================================
  // HORNS + relay + button
  // ===========================================================================
  { id: "o-horn-relay-out", color: "Violet", conf: "read", loadA: 5, mm2: 2.5, from: { comp: "horn-relay", term: "out" }, to: { comp: "horns", term: "in" }, section: "horn", note: "Horn relay output to the horns (~5–7 A pair)." },
  { id: "o-horn-relay-feed", color: "Red", conf: "scheme", loadA: 5, from: { comp: "battery", term: "+" }, to: { comp: "horn-relay", term: "30" }, section: "horn", note: "Constant feed to the horn relay." },
  { id: "o-horn-btn", color: "Black", conf: "scheme", loadA: 0.2, from: { comp: "horn-relay", term: "coil" }, to: { comp: "horn-button", term: "in" }, section: "horn", note: "Horn button completes the relay coil to ground." },
  { id: "o-horns-body", color: "Black", conf: "read", loadA: 5, from: { comp: "horns", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: horns." },
  { id: "o-hornbtn-body", color: "Black", conf: "read", loadA: 0.2, from: { comp: "horn-button", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: horn button (through the column/body)." },

  // ===========================================================================
  // INSTRUMENTS + SENDERS  (fuse 6) + grounds
  // ===========================================================================
  { id: "o-f6-gauges", color: "Black", conf: "scheme", loadA: 0.6, from: { comp: "fusebox", term: "f6" }, to: { comp: "fuel-gauge", term: "+" }, fuse: 6, section: "instruments", note: "Fuse 6 feeds the gauges + illumination." },
  { id: "o-gauge-bus", color: "Black", conf: "scheme", loadA: 0.4, from: { comp: "fuel-gauge", term: "+" }, to: { comp: "temp-gauge", term: "+" }, section: "instruments", note: "Gauge supply daisy-chained." },
  { id: "o-fuel-sender", color: "Brown", conf: "scheme", loadA: 0.1, from: { comp: "fuel-tank-sender", term: "s" }, to: { comp: "fuel-gauge", term: "s" }, section: "instruments", note: "Tank sender signal." },
  { id: "o-temp-sender", color: "Pink", conf: "scheme", loadA: 0.1, from: { comp: "temp-sender", term: "s" }, to: { comp: "temp-gauge", term: "s" }, section: "instruments", note: "Coolant-temp sender signal." },
  { id: "o-oil-sender", color: "Violet", conf: "scheme", loadA: 0.1, from: { comp: "oil-sender", term: "s" }, to: { comp: "oil-gauge", term: "s" }, section: "instruments", note: "Oil-pressure gauge sender signal." },
  { id: "o-oil-switch-wl", color: "Brown", conf: "scheme", loadA: 0.1, from: { comp: "oil-press-switch", term: "s" }, to: { comp: "wl-oil", term: "in" }, section: "instruments", note: "Oil-pressure warning switch → lamp." },
  { id: "o-fuelgauge-body", color: "Black", conf: "read", loadA: 0.5, from: { comp: "fuel-gauge", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: instrument cluster to body (dash)." },
  { id: "o-tempsender-body", color: "Black", conf: "read", loadA: 0.1, from: { comp: "temp-sender" }, to: { comp: "engine-block" }, section: "ground", note: "GROUND: temp sender through the block (→ body)." },
  { id: "o-oilsender-body", color: "Black", conf: "read", loadA: 0.1, from: { comp: "oil-sender" }, to: { comp: "engine-block" }, section: "ground", note: "GROUND: oil sender through the block (→ body)." },

  // ===========================================================================
  // INSTRUMENT ILLUMINATION
  // ===========================================================================
  { id: "o-illsw-feed", color: "Gray", conf: "scheme", loadA: 2, from: { comp: "fusebox", term: "f6" }, to: { comp: "instr-light-switch", term: "in" }, fuse: 6, section: "instruments", note: "Panel illumination off the gauge fuse, via its switch." },
  { id: "o-ill-lamps", color: "Gray", conf: "scheme", loadA: 2, from: { comp: "instr-light-switch", term: "out" }, to: { comp: "fuel-gauge", term: "ill" }, section: "instruments", note: "Panel illumination lamps (several, daisy-chained)." },

  // ===========================================================================
  // WIPERS / WASHER  (fuse 2)
  // ===========================================================================
  { id: "o-f2-wiper-sw", color: "Blue", conf: "scheme", loadA: 4, from: { comp: "fusebox", term: "f2" }, to: { comp: "wiper-switch", term: "in" }, fuse: 2, section: "wipers", note: "Wiper switch fed from fuse 2 (carries motor current — no relay)." },
  { id: "o-wiper-53", color: "Green", conf: "read", loadA: 3, from: { comp: "wiper-switch", term: "low" }, to: { comp: "wiper-motor", term: "53" }, section: "wipers", note: "Wiper run." },
  { id: "o-wiper-53a", color: "Red", conf: "read", loadA: 1, from: { comp: "wiper-switch", term: "park" }, to: { comp: "wiper-motor", term: "53a" }, section: "wipers", note: "Self-park feed." },
  { id: "o-wiper-53e", color: "White", conf: "read", loadA: 4, from: { comp: "wiper-switch", term: "high" }, to: { comp: "wiper-motor", term: "53e" }, section: "wipers", note: "Wiper second speed / park sense." },
  // Washer = a MANUAL FOOT PUMP. It squirts the fluid mechanically (there is NO
  // electric pump motor on the diagram); its electrical contact, when pressed,
  // RUNS THE WIPERS. It shares the wiper fuse (2) and feeds the wiper run feed.
  { id: "o-washer-feed", color: "Blue/Black", conf: "scheme", loadA: 0.1, from: { comp: "fusebox", term: "f2" }, to: { comp: "washer-foot-pump", term: "in" }, fuse: 2, section: "wipers", note: "Foot-pump contact fed from fuse 2 (shared with the wipers). The pump itself is mechanical — it carries no motor current." },
  { id: "o-washer-trig-wiper", color: "White/Black", conf: "scheme", loadA: 3, from: { comp: "washer-foot-pump", term: "out" }, to: { comp: "wiper-motor", term: "53" }, section: "wipers", note: "Pressing the foot pump triggers the wipers — its contact feeds the wiper RUN terminal (53). No electric washer pump motor exists in the factory car." },
  { id: "o-wiper-body", color: "Black", conf: "read", loadA: 4, from: { comp: "wiper-motor", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: wiper motor." },

  // ===========================================================================
  // HEATER FAN  (fuse 3)
  // ===========================================================================
  { id: "o-f3-fan-sw", color: "Blue", conf: "scheme", loadA: 5, from: { comp: "fusebox", term: "f3" }, to: { comp: "fan-switch", term: "in" }, fuse: 3, section: "cooling", note: "Heater-fan switch fed from fuse 3 (carries motor current)." },
  { id: "o-fan-motor", color: "Blue", conf: "read", loadA: 5, from: { comp: "fan-switch", term: "out" }, to: { comp: "fan-motor", term: "in" }, section: "cooling", note: "Blower motor — switch carries it, no relay." },
  { id: "o-fan-body", color: "Black", conf: "read", loadA: 5, from: { comp: "fan-motor", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: blower motor." },

  // ===========================================================================
  // INTERIOR LIGHT + DOOR SWITCHES  (fuse 1, courtesy)
  // ===========================================================================
  { id: "o-f1-int", color: "Black", conf: "scheme", loadA: 0.7, from: { comp: "fusebox", term: "f1" }, to: { comp: "interior-light", term: "+" }, fuse: 1, section: "interior", note: "Courtesy light constant feed (~8 W)." },
  { id: "o-int-doorL", color: "Black", conf: "scheme", loadA: 0.7, from: { comp: "interior-light", term: "sw" }, to: { comp: "door-switch-l", term: "in" }, section: "interior", note: "Door switch grounds the lamp." },
  { id: "o-int-doorR", color: "Black", conf: "scheme", loadA: 0.7, from: { comp: "interior-light", term: "sw" }, to: { comp: "door-switch-r", term: "in" }, section: "interior", note: "Door switch grounds the lamp." },
  { id: "o-doorL-body", color: "Black", conf: "read", loadA: 0.7, from: { comp: "door-switch-l", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: left door pin-switch to body." },
  { id: "o-doorR-body", color: "Black", conf: "read", loadA: 0.7, from: { comp: "door-switch-r", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: right door pin-switch to body." },

  // ===========================================================================
  // CIGAR LIGHTER  (fuse 1)
  // ===========================================================================
  { id: "o-f1-lighter", color: "Black", conf: "scheme", loadA: 8, from: { comp: "fusebox", term: "f1" }, to: { comp: "lighter", term: "+" }, fuse: 1, section: "interior", note: "Cigar lighter constant feed (heating element ~8–10 A)." },
  { id: "o-lighter-body", color: "Black", conf: "read", loadA: 8, from: { comp: "lighter", term: "31" }, to: { comp: "body" }, section: "ground", note: "GROUND: cigar lighter." },
];

// Aggregates for display / sanity.
export const factoryGroundWires = factoryNet.filter((w) => w.section === "ground");
export const factoryNetSections = Array.from(new Set(factoryNet.map((w) => w.section)));
export const factoryNetColoursToVerify = factoryNet.filter((w) => w.conf === "scheme");
