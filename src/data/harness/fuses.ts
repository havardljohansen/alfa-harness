import type { Fuse } from "./types";

// ===========================================================================
// Fuse schedule. MINI (ATM) blade fuses throughout.
// Ratings sized above the load's steady draw but below the wire ampacity.
// Original factory layout was 10× 8 A fuses (much coarser); this splits loads
// sensibly and fuses everything (the factory left some feeds unfused).
// ===========================================================================
export const fuses: Fuse[] = [
  // --- PDM: headlights ------------------------------------------------------
  // HWB18 = 18 cavities (6×3) = 9 fuse-equivalents; each relay eats 2 positions
  // (2×relays + fuses ≤ 9, max 3 relays). We run 2 beam relays → 5 fuse slots:
  // 4 beam outputs (used) + 1 spare. Relay COMMONS feed from the PDM main input
  // (the relay cavity), NOT a fuse — so there is no "common-feed" fuse position.
  { id: "f-pdm-1", block: "pdm", position: 1, ratingA: 10, name: "Low beam LEFT", circuit: "c-headlights", source: "relay-out", feeds: "H4 low filament, left" },
  { id: "f-pdm-2", block: "pdm", position: 2, ratingA: 10, name: "Low beam RIGHT", circuit: "c-headlights", source: "relay-out", feeds: "H4 low filament, right" },
  { id: "f-pdm-3", block: "pdm", position: 3, ratingA: 10, name: "High beam LEFT", circuit: "c-headlights", source: "relay-out", feeds: "H4 high filament, left + tell-tale" },
  { id: "f-pdm-4", block: "pdm", position: 4, ratingA: 10, name: "High beam RIGHT", circuit: "c-headlights", source: "relay-out", feeds: "H4 high filament, right" },
  { id: "f-pdm-5", block: "pdm", position: 5, ratingA: 0, name: "Spare / front fog (future)", circuit: "c-future-spare", source: "relay-out", feeds: "Reserved — the one free slot at the 2-relay / 5-fuse config", future: true },

  // --- Ignition bus (RTMR, bussed; fed by ignition main relay) --------------
  { id: "f-ign-1", block: "rtmr-ign", position: 1, ratingA: 10, name: "Ignition coil", circuit: "c-ignition", source: "bus", feeds: "Coil + / distributor" },
  { id: "f-ign-2", block: "rtmr-ign", position: 2, ratingA: 7.5, name: "Instruments (gauges + warning lamps)", circuit: "c-instruments", source: "bus", feeds: "Fuel, temp, oil, tach feeds + oil/charge tell-tales (warning lamps jumper off the gauges feed at the dash — both tiny)" },
  { id: "f-ign-3", block: "rtmr-ign", position: 3, ratingA: 10, name: "Stereo / USB accessory", circuit: "c-accessory", source: "bus", feeds: "Ignition-switched dash accessory: USB-C fast-charge port + Bluetooth-amp stereo (freed by folding the warning lamps into the gauges fuse)" },
  { id: "f-ign-4", block: "rtmr-ign", position: 4, ratingA: 5, name: "Turn-signal coil select", circuit: "c-turn", source: "bus", feeds: "Ignition feed to turn switch (coil select, key-on only)" },
  { id: "f-ign-5", block: "rtmr-ign", position: 5, ratingA: 10, name: "Wipers + washer", circuit: "c-wipers", source: "bus", feeds: "Wiper relays (low/high/park); washer button trigger + washer relay common (→ deferred electric pump)" },
  { id: "f-ign-6", block: "rtmr-ign", position: 6, ratingA: 20, name: "Low-beam relay common (ign-gate)", circuit: "c-headlights", source: "bus", feeds: "Feeds the low-beam relay common (rly-low.30) from the ignition bus — this is what makes low beams die with the key while leaving HIGH (which has constant common) key-independent. ~10 A peak (both filaments)." },
  { id: "f-ign-7", block: "rtmr-ign", position: 7, ratingA: 7.5, name: "Reverse light", circuit: "c-reverse", source: "bus", feeds: "Reverse lamp via gearbox switch" },
  { id: "f-ign-8", block: "rtmr-ign", position: 8, ratingA: 10, name: "Fuel pump", circuit: "c-fuel", source: "bus", feeds: "Electric fuel pump via relay" },
  { id: "f-ign-9", block: "rtmr-ign", position: 9, ratingA: 7.5, name: "3-way switch cluster + panel dimmer", circuit: "c-instruments", source: "bus", feeds: "Single low-current supply piggybacked across all three 3-way switches; also powers the panel dimmer via the instrument-light switch" },
  { id: "f-ign-10", block: "rtmr-ign", position: 10, ratingA: 7.5, name: "Position/tail running lights", circuit: "c-position", source: "bus", feeds: "Front park + rear tail + plate lamps — on with the key (running lights, no switch). Was reserved for a future O2/AFR; reassigned (O2 on this carb is speculative — reallocate a slot if ever fitted)." },

  // --- Constant bus (RTMR, bussed; battery direct) --------------------------
  { id: "f-con-1", block: "rtmr-const", position: 1, ratingA: 5, name: "Hazard flashers", circuit: "c-hazard", source: "bus", feeds: "Hazard switch → both turn relay coils (coil current only)" },
  { id: "f-con-2", block: "rtmr-const", position: 2, ratingA: 15, name: "Horns", circuit: "c-horn", source: "bus", feeds: "Horn relay common" },
  { id: "f-con-3", block: "rtmr-const", position: 3, ratingA: 10, name: "Brake lights", circuit: "c-brake", source: "bus", feeds: "Brake switch → stop lamps" },
  { id: "f-con-4", block: "rtmr-const", position: 4, ratingA: 20, name: "Heater blower", circuit: "c-cooling", source: "bus", feeds: "Fan relay common (full-speed blower) + the future PWM low-speed feed — on the CONSTANT bus, switched on by the ignition-gated fan relay coil" },
  { id: "f-con-5", block: "rtmr-const", position: 5, ratingA: 5, name: "Headlight switch + column flash (constant feed)", circuit: "c-headlights", source: "bus", feeds: "Constant battery into sw-headlight.30 (so the dash switch is alive key-off — high beams + park override work without the key) AND into sw-flash.in (column flash-to-pass works key-off). Peak draw ~2.5 A (PARK lamp current via switch override + coil triggers); steady < 0.3 A." },
  { id: "f-con-6", block: "rtmr-const", position: 6, ratingA: 5, name: "Interior light", circuit: "c-interior", source: "bus", feeds: "Courtesy light + door switches" },
  { id: "f-con-7", block: "rtmr-const", position: 7, ratingA: 0, name: "Spare (was cigar lighter)", circuit: "c-future-spare", source: "bus", feeds: "Reserved — lighter removed, hazard switch took its place", future: true },
  { id: "f-con-8", block: "rtmr-const", position: 8, ratingA: 0, name: "Spare (was flasher feed)", circuit: "c-future-spare", source: "bus", feeds: "Freed when the flasher moved into rtmr-const cavity 5 (gets bus power directly via the bussed cavity input). Tradeoff accepted: turn-signal lamps now protected only by the main 60–80 A MIDI/MEGA at the battery — LED indicator draw is tiny so short-current is small, and the flasher's own internal fault would self-disconnect.", future: true },
];
