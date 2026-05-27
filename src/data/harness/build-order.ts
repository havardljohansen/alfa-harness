// =============================================================================
// Recommended build order — the sequence to actually assemble this harness.
// Grounds and protection first, then power, then sub-looms by zone, then
// circuit-by-circuit with a test after each. Each phase lists the parts you
// need for it and points at the page with the detail.
// =============================================================================

export interface BuildStep {
  text: string;
  ref?: string; // app route with the detail
}

export interface BuildPhase {
  id: string;
  title: string;
  why: string;
  parts: string[]; // what to have on the bench for this phase
  steps: BuildStep[];
}

export const buildOrder: BuildPhase[] = [
  {
    id: "prep",
    title: "1 · Prepare & label",
    why: "Everything is one wire colour — the labels are the identity, so get them sorted before you cut anything.",
    parts: ["Dymo Rhino heat-shrink label cartridges", "Printed wire schedule + build sheets"],
    steps: [
      { text: "Print the wire schedule and the per-circuit build sheets to work from.", ref: "/wires" },
      { text: "Load the Dymo heat-shrink cartridge; print each wire's label and slide it on before crimping the second end.", ref: "/build" },
      { text: "Confirm wire to buy by gauge tier and order anything you're short of.", ref: "/shopping" },
      { text: "Measure the real zone distances on the car and update them so cut lengths are exact.", ref: "/lengths" },
    ],
  },
  {
    id: "mount",
    title: "2 · Mount the hardware",
    why: "Fix the fixed points first so you can measure looms to them.",
    parts: [
      "Littelfuse PDM ×1",
      "Bussmann RTMR ×2 (both bussed — constant + ignition bus)",
      "GT 280 12-way connector pairs ×5",
      "Mounting brackets / fasteners",
      "Battery; master cut-off switch (optional)",
    ],
    steps: [
      { text: "Mount the PDM and the two RTMRs in the engine bay.", ref: "/fuses" },
      { text: "Mount the bulkhead connector halves (the dash-disconnect plugs).", ref: "/fuses" },
      { text: "Fit the battery, and the master cut-off if using one." },
    ],
  },
  {
    id: "grounds",
    title: "3 · Grounds first",
    why: "The ground network is the thing most often skimped — do it before any load wiring so every device has a clean return.",
    parts: ["Ground blocks/busbars ×4 (hub + front + dash + rear)", "Earth braid strap (engine ↔ body)", "16 mm² hub cable + 6 mm² module trunks", "Ring terminals"],
    steps: [
      { text: "Set the engine-bay HUB block. Bond battery − and the engine block to it (16 mm²)." },
      { text: "Install each module's ground block: front clip, dash, rear/boot." },
      { text: "Run ONE thick (6 mm²) trunk from each module block back to the hub — front, dash (through BH1), rear (direct, not via the dash)." },
      { text: "Land every device ground in a section on that section's block — no device grounds straight to the body." },
    ],
  },
  {
    id: "power",
    title: "4 · Main power & protection",
    why: "Get the feeds in and FUSED before anything can be energised.",
    parts: [
      "MIDI/MEGA fuse holders + fuses (≈60–80 A constant feed, ≈40 A PDM, ≈60–80 A alt B+)",
      "16–25 mm² cable",
      "Heavy starter cable",
      "Ring terminals",
    ],
    steps: [
      { text: "Battery + → MIDI/MEGA fuse → constant-bus stud; a second MIDI fuse → PDM input.", ref: "/bom" },
      { text: "Alternator B+ → battery via its mega-fuse; D+ to the charge warning lamp." },
      { text: "Battery + → starter (heavy cable) and → starter-relay common." },
    ],
  },
  {
    id: "subloom",
    title: "5 · Build the sub-looms by zone",
    why: "Build each zone's bundle on the bench, terminate into the bulkhead plugs, then drop them in.",
    parts: [
      "GXL/TXL wire: 0.75 / 1.5 / 2.5 mm²",
      "Metri-Pack 280 terminals (male + female)",
      "Single-wire seals + GT 280 TPA locks",
      "Metri-Pack 280 crimp tool",
      "Signal diodes (e.g. 1N4007) ×4",
    ],
    steps: [
      { text: "Cut wires in batches by length band; print + fit the label on each.", ref: "/lengths" },
      { text: "Crimp the terminal, fit a seal, insert into the connector and lock the TPA.", ref: "/fuses" },
      { text: "Build engine-front, dash and rear looms; mate them through the bulkhead plugs." },
    ],
  },
  {
    id: "populate",
    title: "6 · Fit relays & fuses",
    why: "Populate the centres once the wiring behind them is in.",
    parts: [
      "Song Chuan ISO-280 relays ×11 (6 SPST + 5 SPDT)",
      "MINI / ATM blade fuses — assorted ratings + spares",
    ],
    steps: [
      { text: "Plug the 11 relays into their positions (2 in the PDM, 5 + 4 in the RTMRs).", ref: "/fuses" },
      { text: "Fit the MINI blade fuses to the ratings on the Fuses page; keep spares in the kit.", ref: "/fuses" },
    ],
  },
  {
    id: "circuits",
    title: "7 · Wire & test circuit by circuit",
    why: "Bring it up one circuit at a time and verify each against its user-story before moving on.",
    parts: [
      "AMP 250 (6.3 mm) + 187 (4.8 mm) spade terminals",
      "Electronic (load-independent) flasher",
      "H4 headlight bulbs (if upgrading)",
      "Heater-fan dropping resistor (optional, for low speed)",
    ],
    steps: [
      { text: "Order: charging → ignition (+ main relay) → starting (+ starter relay) → headlights → position/tail → turn/hazard → brake/reverse → instruments → wipers → fan → fuel pump → horn → interior.", ref: "/build" },
      { text: "After each circuit, set the key + switches and confirm the right things light.", ref: "/explorer" },
    ],
  },
  {
    id: "finish",
    title: "8 · Loom, secure & road-test",
    why: "Only wrap once it all works — convoluted tubing makes changes painful.",
    parts: ["Convoluted tubing / sleeving", "Adhesive-lined heat-shrink", "Bulkhead grommets", "Cable ties / cloth loom tape"],
    steps: [
      { text: "Convolute/sleeve the looms, secure clear of heat and moving parts, grommet every panel pass-through." },
      { text: "Full function check cold, then a road test (charging voltage, all lights, wipers, fan, horn)." },
    ],
  },
];
