import { describe, it, expect } from "vitest";
import { simulate } from "./engine";
import { scenarios } from "./scenarios";
import { validateModel, resolvedWires } from "./index";
import { relays } from "./relays";
import { ownedParts } from "./parts";

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
