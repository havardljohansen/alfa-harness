import { describe, it, expect } from "vitest";
import { simulate } from "./engine";
import { scenarios } from "./scenarios";
import { validateModel, resolvedWires, allNodes } from "./index";
import { relays } from "./relays";
import { ownedParts } from "./parts";
import { harnessModules, moduleOf } from "./modules";

// ---------------------------------------------------------------------------
// Model integrity — the harness data must be internally consistent.
// ---------------------------------------------------------------------------
describe("model integrity", () => {
  const issues = validateModel();
  const errors = issues.filter((i) => i.severity === "error");

  it("has no structural errors (every wire endpoint resolves)", () => {
    expect(errors, errors.map((e) => `${e.where}: ${e.message}`).join("\n")).toEqual([]);
  });

  it("uses no more relays than owned (6 SPST + 5 SPDT)", () => {
    const spdt = relays.filter((r) => r.type === "SPDT").length;
    const spst = relays.filter((r) => r.type === "SPST").length;
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
