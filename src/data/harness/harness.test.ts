import { describe, it, expect } from "vitest";
import { simulate } from "./engine";
import { scenarios } from "./scenarios";
import { validateModel, resolvedWires, allNodes } from "./index";
import { relays, fuseBlocks } from "./relays";
import { fuses } from "./fuses";
import { ownedParts } from "./parts";
import { harnessModules, moduleOf } from "./modules";
import { switchComponents } from "./components";
import { logicalBulkheads } from "./connectors";
import { wires } from "./wires";

// ---------------------------------------------------------------------------
// Model integrity — the harness data must be internally consistent.
// ---------------------------------------------------------------------------
describe("model integrity", () => {
  const issues = validateModel();
  const errors = issues.filter((i) => i.severity === "error");

  it("has no structural errors (every wire endpoint resolves)", () => {
    expect(errors, errors.map((e) => `${e.where}: ${e.message}`).join("\n")).toEqual([]);
  });

  it("uses no more relays than owned (6 SPST + 5 SPDT) — provisioned/future relays excluded", () => {
    // future relays (e.g. the deferred washer pump's) take a slot but aren't bought yet.
    const spdt = relays.filter((r) => r.type === "SPDT" && !r.future).length;
    const spst = relays.filter((r) => r.type === "SPST" && !r.future).length;
    expect(spdt).toBeLessThanOrEqual(ownedParts.find((p) => p.mfgPn === "301-1C-S-R1-12VDC")!.qtyOwned);
    expect(spst).toBeLessThanOrEqual(ownedParts.find((p) => p.mfgPn === "301-1A-C-R1-U03-12VDC")!.qtyOwned);
  });

  it("never specifies a fuse larger than its wire's ampacity", () => {
    // covered by validateModel warnings — assert there are no such warnings
    const ampWarns = validateModel().filter((i) => i.message.includes("exceed wire ampacity"));
    expect(ampWarns, ampWarns.map((w) => `${w.where}: ${w.message}`).join("\n")).toEqual([]);
  });

  it("deduces a positive length for every wire", () => {
    for (const w of resolvedWires) expect(w.lengthMm, w.id).toBeGreaterThan(0);
  });

  // Catches the kind of bug we found with wl-charge.+: a component declared a
  // terminal in components.ts, but no wire actually connected to it. The
  // component would visibly exist in the schedule but be electrically dead.
  // Exceptions: switch internal terminals (handled by switch contacts, not
  // wires), relay coil terminal 85 (engine wires this implicitly to ground or
  // constant), relay output 87a (only used when SPDT and only by some loads),
  // fuse-block 'BUS' input (engine wires implicitly), and pure-output ground
  // terminals (the ground node itself doesn't need an "incoming" wire).
  it("every declared component terminal is reached by a wire (or a documented internal connection)", () => {
    const SWITCH_IDS = new Set(switchComponents.map((s) => s.id));
    const RELAY_IDS = new Set(relays.map((r) => r.id));
    const FUSE_BLOCK_IDS = new Set(fuseBlocks.map((b) => b.id));
    // Known-OK orphans: future/capped components AND case-grounded terminals.
    // Adding to this list requires explaining WHY in the comment — that's the
    // discipline. The point is: NEW orphans (the wl-charge.+ kind of bug) fail
    // this test; documented exceptions don't.
    const ALLOWED_ORPHANS = new Set([
      // Future O2 sensor wideband heater pins — capped at the sensor connector
      // until fitted. The O2 sensor is a CHASSIS component (lives in the
      // exhaust, which stays with the car through engine swaps), not part of
      // any engine module — single sensor regardless of which engine is in.
      "o2-sensor.htr+", "o2-sensor.htr-",
      // Future AFR gauge — illumination + ground will be wired when the gauge
      // is physically fitted (w-o2-feed is the only AFR wire so far, marked future).
      "g-afr.ill", "g-afr.g",
      // Flasher feed (DIN 49) — fed from the rtmr-const bus stud through the
      // ISO-280 cavity (no chassis wire). Handled by an engine.ts static edge
      // (flasher.49 ↔ rtmr-const.BUS). See the flasher-cavity describe block.
      "flasher.49",
      // Spare fuse positions — documented as future / reserved in fuses.ts.
      "pdm.f-pdm-5",        // Spare / future front fog
      "rtmr-const.f-con-7", // Spare (was cigar lighter, removed)
      "rtmr-const.f-con-8", // Spare (was flasher feed, freed when flasher moved into cavity 5)
      // EM1 spare pins (no engine uses them; reserved for future expansion)
      "em1.pin-3",          // Was tach signal; both engines drive tach mechanically (cable). Pin reserved spare in case of future electric-tach upgrade.
      "em1.pin-12",         // Sealed spare on both engine modules (O2 is chassis-side, doesn't need an EM1 pin).
      // K6+ coil-pack HT outputs — go to spark plugs via HT leads (not modeled as harness wires).
      "k6plus-coil-1.HT-1", "k6plus-coil-1.HT-4",
      "k6plus-coil-2.HT-2", "k6plus-coil-2.HT-3",
      // K6+ ECU tach-out — exists on the ECU but unwired since both engines drive tach mechanically.
      "k6plus-ecu.tach-out",
      // 155 senders/switches — case-grounded via block thread (same pattern as Nord snd-oil.g / sw-oillight)
      "snd-oil-155.g", "sw-oillight-155.g",
      // 155 alternator/starter — wires now present (w-alt-155-b, w-alt-155-gnd, w-starter-155-30)
      // so these need no orphan exceptions; they appear in the orphan list ONLY until those wires are added (now done above).
      // Lamp ground terminals — case-grounded via the lamp socket / housing
      // bonded to chassis sheet metal. The factory did this; we follow suit.
      // (Each lamp HOUSING gets a single ground bond at its mount; the
      // individual lamp grounds inside the housing share it.)
      "park-fl.g", "park-fr.g",       // Front parking lamps — grounded via housing (shared with side repeater housing)
      "turn-fl.g", "turn-fr.g",       // Front turn lamps — grounded via housing (shared with park-f housing)
      "turn-rl.g", "turn-rr.g",       // Rear turn lamps — grounded via housing (shared with tail-r housing, already wired via w-tail-L-gnd / w-tail-R-gnd)
      "reverse.g",                    // Reverse lamp — grounded via its mount in the rear panel (close to gnd-rear stud)
      "horn-lo.g",                    // Low-tone horn — grounded via its mounting bracket to chassis (twin horn typically shares bracket with hi-tone)
      "wl-main.g",                    // Main-beam tell-tale — grounded via its dash bezel mount (gnd-dash chassis)
      // Sender grounds — sender grounds via its threaded fitting into the
      // engine block / tank. No wire needed.
      "snd-oil.g",                    // Oil pressure sender — grounded via thread into block
      "snd-fuel.g",                   // Fuel sender — grounded via tank flange to chassis
      // Gauge cluster internal daisy-chain — g-fuel has the feed (w-g-fuel-i),
      // illumination (w-ill-out), and ground (w-g-gnd) wires; the other gauges
      // share these via short jumpers INSIDE the gauge cluster (which is one
      // assembly bolted into the dash). The factory did this and so do we.
      // If we ever swap a single gauge in isolation, those internal jumpers
      // become explicit — for now they're inside the cluster.
      "g-temp.+", "g-temp.ill", "g-temp.g",
      "g-oil.+", "g-oil.ill", "g-oil.g",
      "g-speedo.ill", "g-speedo.g",   // (speedo has no +/sender — mechanical cable)
      "g-tach.+", "g-tach.ill", "g-tach.g",
    ]);
    const isReservedTerminal = (componentId: string, terminalId: string) => {
      // Switch internals are wired by closing contacts, not by external wires.
      if (SWITCH_IDS.has(componentId)) return true;
      // Relay coil terminals (85/86) and outputs (87/87a) handled by the engine.
      if (RELAY_IDS.has(componentId)) return ["85", "86", "87", "87a", "30"].includes(terminalId);
      // Fuse-block BUS stud is the input — engine wires it to its feed source.
      if (FUSE_BLOCK_IDS.has(componentId) && terminalId === "BUS") return true;
      return false;
    };
    const touchedTerminals = new Set<string>();
    for (const w of resolvedWires) {
      touchedTerminals.add(`${w.from.component}.${w.from.terminal}`);
      touchedTerminals.add(`${w.to.component}.${w.to.terminal}`);
    }
    const orphans: string[] = [];
    for (const n of allNodes) {
      for (const t of n.terminals ?? []) {
        const key = `${n.id}.${t.id}`;
        if (touchedTerminals.has(key)) continue;
        if (isReservedTerminal(n.id, t.id)) continue;
        if (ALLOWED_ORPHANS.has(key)) continue;
        orphans.push(key);
      }
    }
    expect(orphans, `terminals declared but not wired (and not internally handled): ${orphans.join(", ")}`).toEqual([]);
  });

  // Catches the kind of bug we found during the headlight architecture refactor:
  // new wires got `via: ["bh4"]` without anyone checking BH4 had spare pin
  // capacity. The auto-chunker in connectors.ts silently created a second plug,
  // which defeated the "one plug frees the front clip" design intent. This test
  // asserts every logical bulkhead fits in ONE physical plug. If a refactor
  // adds a wire that overflows a bulkhead, this fails and forces a design
  // decision (bump connector size, or remove a wire, or split into 2 plugs
  // deliberately by raising the budget here).
  it("every logical bulkhead's wire count fits within its declared plug budget", () => {
    const violations: string[] = [];
    for (const lb of logicalBulkheads) {
      const ways = lb.ways ?? 12;
      const budget = lb.expectedPlugs ?? 1;
      const count = wires.filter((w) => w.via?.includes(lb.id)).length;
      const actualPlugs = Math.ceil(count / ways);
      if (actualPlugs > budget) {
        violations.push(`${lb.id}: ${count} wires in a ${ways}-way → ${actualPlugs} plugs, budget was ${budget}. Bump ways, raise expectedPlugs, or remove a wire.`);
      }
    }
    expect(violations, `bulkhead plug-budget overflow:\n  ${violations.join("\n  ")}`).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Module coverage — every component belongs to exactly one detachable module.
// This is the forcing function behind the build-sheet revision rule: add a new
// component without assigning it to a module and this fails, reminding you to
// write/revise that module's build sheet (see modules.ts).
// ---------------------------------------------------------------------------
describe("detachable-module coverage", () => {
  it("assigns every model node to exactly one module", () => {
    const unassigned = allNodes.filter((n) => !moduleOf(n.id)).map((n) => n.id);
    expect(unassigned, `unassigned to any module: ${unassigned.join(", ")}`).toEqual([]);

    // No node assigned to two modules.
    const seen = new Map<string, string[]>();
    for (const m of harnessModules) for (const id of m.componentIds) {
      seen.set(id, [...(seen.get(id) ?? []), m.id]);
    }
    const dupes = [...seen.entries()].filter(([, mods]) => mods.length > 1);
    expect(dupes, `assigned to multiple modules: ${dupes.map(([id, mods]) => `${id}→${mods.join("+")}`).join(", ")}`).toEqual([]);
  });

  it("lists only real component ids in each module", () => {
    const real = new Set(allNodes.map((n) => n.id));
    const bogus = harnessModules.flatMap((m) => m.componentIds.filter((id) => !real.has(id)).map((id) => `${m.id}:${id}`));
    expect(bogus, `module references unknown component: ${bogus.join(", ")}`).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Flasher-in-cavity refinement (2026-05-28) — structural tests beyond what
// the scenario expectations can express. These catch regressions that wouldn't
// show up in the live/dead boolean simulation (e.g. the wrong fuse being
// load-bearing, the ground wire being dropped, the cavity count getting out
// of sync). Each test names the failure mode it protects against.
// ---------------------------------------------------------------------------
describe("flasher cavity refinement (rtmr-const cavity 5, Bussmann NO-762-LED)", () => {
  it("w-flasher-in is GONE (replaced by engine static edge to rtmr-const.BUS)", () => {
    // Failure mode: someone restores the old external wire alongside the new
    // cavity arrangement, double-feeding the flasher.
    expect(wires.find((w) => w.id === "w-flasher-in")).toBeUndefined();
  });

  it("w-flasher-gnd is present (cavity 85 → gnd-eng)", () => {
    // Failure mode: the case-ground assumption silently persists after the
    // move into the cavity, leaving the flasher with no ground.
    const gnd = wires.find((w) => w.id === "w-flasher-gnd");
    expect(gnd, "w-flasher-gnd missing — the cavity has no chassis bond, the flasher needs an explicit ground wire").toBeDefined();
    expect(gnd!.from.component).toBe("flasher");
    expect(gnd!.from.terminal).toBe("31");
    expect(gnd!.to.component).toBe("gnd-eng");
  });

  it("flasher.31 reaches ground in the simulator", () => {
    // Behavioural confirmation that the new ground wire actually closes the
    // circuit. If w-flasher-gnd were misrouted (wrong endpoint), the
    // structural test above would still pass but the simulator's ground set
    // would not include flasher.31.
    const r = simulate({ ignition: "off", switches: {} });
    expect(r.ground.has("flasher.31"), "flasher.31 must be in the ground set — confirms w-flasher-gnd routes to a real ground node").toBe(true);
  });

  it("f-con-8 is freed (ratingA 0 and marked future) — no longer on the c-turn power path", () => {
    // Failure mode: someone reads f-con-8 as 'Flasher constant feed', sees
    // its rating non-zero, and starts wiring something through it again
    // thinking it's load-bearing for turn signals.
    const f = fuses.find((x) => x.id === "f-con-8");
    expect(f).toBeDefined();
    expect(f!.ratingA, "f-con-8 should be 0 (freed when flasher moved into cavity 5)").toBe(0);
    expect(f!.future, "f-con-8 should be marked future/spare").toBe(true);
    expect(f!.circuit, "f-con-8 should no longer claim c-turn").not.toBe("c-turn");
  });

  it("rtmr-const has exactly 4 in-cavity NON-future relays + the flasher = 5 cavities filled", () => {
    // Failure mode: the washer-future relay creeps back in to rtmr-const,
    // overflowing the 5-cavity block (now that the flasher takes one).
    const constMounted = relays.filter((r) => r.mountedIn === "rtmr-const");
    expect(constMounted.length, `rtmr-const should have exactly 4 relay assignments (+ 1 flasher cavity), got ${constMounted.length}: ${constMounted.map((r) => r.id).join(", ")}`).toBe(4);
    const ways = fuseBlocks.find((b) => b.id === "rtmr-const")!.relayWays;
    expect(ways).toBe(5); // 4 relays + 1 flasher cavity
    // washer-future MUST be evicted to external mount.
    const washer = relays.find((r) => r.id === "rly-washer")!;
    expect(washer.mountedIn, "rly-washer must be external (flasher took its cavity)").not.toBe("rtmr-const");
  });

  it("turn-relay 30 (common) reaches BUS ONLY via the flasher pass-through", () => {
    // Failure mode: somewhere in the model a sneak path lets the turn-relay
    // commons get constant +12 V without going through the flasher (e.g.
    // someone wires f-con-8 to turn-relay 30 directly). That would make the
    // indicators light SOLID instead of flashing — a real-world bug we'd
    // miss in the boolean simulator without this assertion.
    //
    // We test this by reading the wires file: the ONLY wire ending at
    // rly-turnL.30 (other than the BUS path through flasher) should be from
    // flasher.49a; and rly-turnR.30 should come from rly-turnL.30 only.
    const incomingL = wires.filter((w) => w.to.component === "rly-turnL" && w.to.terminal === "30").concat(wires.filter((w) => w.from.component === "rly-turnL" && w.from.terminal === "30"));
    const sourcesL = incomingL.map((w) => `${w.from.component}.${w.from.terminal}→${w.to.component}.${w.to.terminal}`);
    // The only source touching rly-turnL.30 should be flasher.49a (incoming)
    // and rly-turnR.30 (jumper outgoing).
    const expectedTouches = new Set(["flasher.49a→rly-turnL.30", "rly-turnL.30→rly-turnR.30"]);
    for (const t of sourcesL) {
      expect(expectedTouches.has(t), `Unexpected wire touching rly-turnL.30: ${t} — the only legitimate connections are flasher.49a (incoming) and the rly-turnR.30 jumper (outgoing).`).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// User stories — intended electrical behaviour.
// ---------------------------------------------------------------------------
describe("user stories (power propagation)", () => {
  for (const s of scenarios) {
    it(`${s.id} — ${s.story}`, () => {
      const r = simulate(s.state);

      for (const [c, t] of s.expect.live ?? []) {
        expect(r.live.has(`${c}.${t}`), `expected LIVE: ${c}.${t}`).toBe(true);
      }
      for (const [c, t] of s.expect.dead ?? []) {
        expect(r.live.has(`${c}.${t}`), `expected DEAD: ${c}.${t}`).toBe(false);
      }
      for (const id of s.expect.relaysOn ?? []) {
        expect(r.energizedRelays.has(id), `expected relay ON: ${id}`).toBe(true);
      }
      for (const id of s.expect.relaysOff ?? []) {
        expect(r.energizedRelays.has(id), `expected relay OFF: ${id}`).toBe(false);
      }
      for (const [c, t] of s.expect.grounded ?? []) {
        expect(r.ground.has(`${c}.${t}`), `expected GROUNDED: ${c}.${t}`).toBe(true);
      }
      for (const [c, t] of s.expect.floating ?? []) {
        expect(r.ground.has(`${c}.${t}`), `expected FLOATING: ${c}.${t}`).toBe(false);
      }
    });
  }
});
