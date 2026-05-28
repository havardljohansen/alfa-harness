import { describe, it, expect } from "vitest";
import { simulate } from "./engine";
import { scenarios } from "./scenarios";
import { validateModel, resolvedWires, allNodes } from "./index";
import { relays, fuseBlocks } from "./relays";
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
      // Flasher ground (DIN 31) — standard period flashers ground through
      // their metal case via the dash-mount bracket; no separate ground wire.
      "flasher.31",
      // Future O2 sensor wideband heater pins — capped at the sensor connector
      // until the O2 sensor is fitted (deferred — see w-o2-* wires marked future).
      "o2-sensor.htr+", "o2-sensor.htr-",
      // Future AFR gauge — illumination + ground will be wired when the gauge
      // is physically fitted (w-o2-feed is the only AFR wire so far, marked future).
      "g-afr.ill", "g-afr.g",
      // Spare fuse positions — documented as future / reserved in fuses.ts.
      "pdm.f-pdm-5",        // Spare / future front fog
      "rtmr-const.f-con-7", // Spare (was cigar lighter, removed)
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
    });
  }
});
