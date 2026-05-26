import type { Fuse } from "./types";

// ===========================================================================
// Fuse schedule. MINI (ATM) blade fuses throughout.
// Ratings sized above the load's steady draw but below the wire ampacity.
// Original factory layout was 10× 8 A fuses (much coarser); this splits loads
// sensibly and fuses everything (the factory left some feeds unfused).
// ===========================================================================
export const fuses: Fuse[] = [
  // --- PDM: headlights ------------------------------------------------------
  { id: "f-pdm-1", block: "pdm", position: 1, ratingA: 10, name: "Low beam LEFT", circuit: "c-headlights", source: "relay-out", feeds: "H4 low filament, left" },
  { id: "f-pdm-2", block: "pdm", position: 2, ratingA: 10, name: "Low beam RIGHT", circuit: "c-headlights", source: "relay-out", feeds: "H4 low filament, right" },
  { id: "f-pdm-3", block: "pdm", position: 3, ratingA: 10, name: "High beam LEFT", circuit: "c-headlights", source: "relay-out", feeds: "H4 high filament, left + tell-tale" },
  { id: "f-pdm-4", block: "pdm", position: 4, ratingA: 10, name: "High beam RIGHT", circuit: "c-headlights", source: "relay-out", feeds: "H4 high filament, right" },
  { id: "f-pdm-5", block: "pdm", position: 5, ratingA: 30, name: "Beam relay common feed", circuit: "c-headlights", source: "battery", feeds: "Battery → low/high beam relay commons (PDM internal main)" },
  { id: "f-pdm-6", block: "pdm", position: 6, ratingA: 0, name: "Spare / front fog (future)", circuit: "c-future-spare", source: "relay-out", feeds: "Reserved", future: true },

  // --- Ignition bus (RTMR, bussed; fed by ignition main relay) --------------
  { id: "f-ign-1", block: "rtmr-ign", position: 1, ratingA: 10, name: "Ignition coil", circuit: "c-ignition", source: "bus", feeds: "Coil + / distributor" },
  { id: "f-ign-2", block: "rtmr-ign", position: 2, ratingA: 5, name: "Gauges + tach", circuit: "c-instruments", source: "bus", feeds: "Fuel, temp, oil, tach feeds" },
  { id: "f-ign-3", block: "rtmr-ign", position: 3, ratingA: 5, name: "Warning lamps", circuit: "c-instruments", source: "bus", feeds: "Oil, charge tell-tales" },
  { id: "f-ign-4", block: "rtmr-ign", position: 4, ratingA: 5, name: "Turn-signal coil select", circuit: "c-turn", source: "bus", feeds: "Ignition feed to turn switch (coil select, key-on only)" },
  { id: "f-ign-5", block: "rtmr-ign", position: 5, ratingA: 10, name: "Wipers + washer", circuit: "c-wipers", source: "bus", feeds: "Wiper relays (low/high/park) + washer pump" },
  { id: "f-ign-6", block: "rtmr-ign", position: 6, ratingA: 20, name: "Heater blower", circuit: "c-cooling", source: "bus", feeds: "Fan relay output" },
  { id: "f-ign-7", block: "rtmr-ign", position: 7, ratingA: 7.5, name: "Reverse light", circuit: "c-reverse", source: "bus", feeds: "Reverse lamp via gearbox switch" },
  { id: "f-ign-8", block: "rtmr-ign", position: 8, ratingA: 10, name: "Fuel pump", circuit: "c-fuel", source: "bus", feeds: "Electric fuel pump via relay" },
  { id: "f-ign-9", block: "rtmr-ign", position: 9, ratingA: 7.5, name: "Instrument lights", circuit: "c-instruments", source: "bus", feeds: "Panel illumination (pos-I)" },
  { id: "f-ign-10", block: "rtmr-ign", position: 10, ratingA: 5, name: "O2 / AFR (future)", circuit: "c-future-o2", source: "bus", feeds: "Wideband controller + AFR gauge", future: true },

  // --- Constant bus (RTMR, bussed; battery direct) --------------------------
  { id: "f-con-1", block: "rtmr-const", position: 1, ratingA: 5, name: "Hazard flashers", circuit: "c-hazard", source: "bus", feeds: "Hazard switch → both turn relay coils (coil current only)" },
  { id: "f-con-2", block: "rtmr-const", position: 2, ratingA: 15, name: "Horns", circuit: "c-horn", source: "bus", feeds: "Horn relay common" },
  { id: "f-con-3", block: "rtmr-const", position: 3, ratingA: 10, name: "Brake lights", circuit: "c-brake", source: "bus", feeds: "Brake switch → stop lamps" },
  { id: "f-con-4", block: "rtmr-const", position: 4, ratingA: 7.5, name: "Tail/position LEFT", circuit: "c-position", source: "bus", feeds: "LH front position + LH tail + plate" },
  { id: "f-con-5", block: "rtmr-const", position: 5, ratingA: 7.5, name: "Tail/position RIGHT", circuit: "c-position", source: "bus", feeds: "RH front position + RH tail" },
  { id: "f-con-6", block: "rtmr-const", position: 6, ratingA: 5, name: "Interior light", circuit: "c-interior", source: "bus", feeds: "Courtesy light + door switches" },
  { id: "f-con-7", block: "rtmr-const", position: 7, ratingA: 0, name: "Spare (was cigar lighter)", circuit: "c-future-spare", source: "bus", feeds: "Reserved — lighter removed, hazard switch took its place", future: true },
  { id: "f-con-8", block: "rtmr-const", position: 8, ratingA: 10, name: "Flasher constant feed", circuit: "c-turn", source: "bus", feeds: "Constant feed to flasher → turn relay commons (lets hazards flash key-off)" },

  // --- Non-bussed (rear / independent) — mostly reserved --------------------
  { id: "f-rear-1", block: "rtmr-rear", position: 1, ratingA: 0, name: "Spare", circuit: "c-future-spare", source: "battery", feeds: "Reserved", future: true },
  { id: "f-rear-2", block: "rtmr-rear", position: 2, ratingA: 0, name: "Spare", circuit: "c-future-spare", source: "battery", feeds: "Reserved", future: true },
];
