import type { GaugeClass, LengthBand, ResolvedWire, Wire, WireTier, ZoneId } from "./types";
import { gaugeSpecs, intraZoneMm, lengthBands, zoneLinks, wireTiers, classToTier } from "./zones";

const tierById = new Map<string, WireTier>(wireTiers.map((t) => [t.id, t]));

// ---------------------------------------------------------------------------
// Gauge lookup.
// ---------------------------------------------------------------------------
const gaugeByClass = new Map<GaugeClass, (typeof gaugeSpecs)[number]>(
  gaugeSpecs.map((g) => [g.class, g]),
);

export function gaugeFor(cls: GaugeClass) {
  const g = gaugeByClass.get(cls);
  if (!g) throw new Error(`Unknown gauge class: ${cls}`);
  return g;
}

// ---------------------------------------------------------------------------
// Route distance between two adjacent zones (bidirectional lookup).
// ---------------------------------------------------------------------------
function legMm(a: ZoneId, b: ZoneId): number | null {
  if (a === b) return intraZoneMm;
  const link = zoneLinks.find(
    (l) => (l.from === a && l.to === b) || (l.from === b && l.to === a),
  );
  return link ? link.routeMm : null;
}

/** Deduced run length (mm) for a wire from its zone route, plus an end
 *  allowance and any extra slack. Returns the raw deduced length. */
export function deduceLengthMm(route: ZoneId[], slackMm = 0): number {
  if (route.length === 0) return intraZoneMm;
  if (route.length === 1) return intraZoneMm + slackMm;

  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const leg = legMm(route[i], route[i + 1]);
    // Unknown adjacency falls back to a conservative 1.2 m so a missing link
    // is visible (long) rather than silently zero.
    total += leg ?? 1200;
  }
  // End allowance: routing within the two terminal zones to reach components.
  return total + intraZoneMm + slackMm;
}

// ---------------------------------------------------------------------------
// Length band.
// ---------------------------------------------------------------------------
export function bandFor(lengthMm: number): LengthBand {
  return (
    lengthBands.find((b) => lengthMm >= b.minMm && lengthMm < b.maxMm) ??
    lengthBands[lengthBands.length - 1]
  );
}

// ---------------------------------------------------------------------------
// Resolve a wire — attach gauge + length + band.
// ---------------------------------------------------------------------------
export function resolveWire(w: Wire): ResolvedWire {
  const g = gaugeFor(w.gaugeClass);
  const tier = tierById.get(classToTier[w.gaugeClass])!;
  const lengthMm = Math.round(deduceLengthMm(w.route, w.slackMm ?? 0));
  const band = bandFor(lengthMm);
  return {
    ...w,
    mm2: g.mm2,
    awg: g.awg,
    ampacity: g.ampacity,
    tierId: tier.id,
    recMm2: tier.mm2,
    recAwg: tier.awg,
    lengthMm,
    lengthBandId: band.id,
  };
}

// ---------------------------------------------------------------------------
// Aggregations for the BOM / Lengths pages.
// ---------------------------------------------------------------------------
export interface GaugeTotal {
  mm2: number;
  awg: number;
  count: number;
  actualMm: number; // sum of deduced lengths
  cutMm: number; // sum of band cut lengths (what to actually buy)
  withWasteM: number; // cutMm + 15% waste, in metres
}

export function wireTotalsByGauge(resolved: ResolvedWire[]): GaugeTotal[] {
  const byMm = new Map<number, GaugeTotal>();
  for (const w of resolved) {
    const band = lengthBands.find((b) => b.id === w.lengthBandId)!;
    const cur =
      byMm.get(w.mm2) ??
      ({ mm2: w.mm2, awg: w.awg, count: 0, actualMm: 0, cutMm: 0, withWasteM: 0 } as GaugeTotal);
    cur.count += 1;
    cur.actualMm += w.lengthMm;
    cur.cutMm += band.cutMm;
    byMm.set(w.mm2, cur);
  }
  const out = [...byMm.values()];
  for (const t of out) t.withWasteM = Math.ceil((t.cutMm * 1.15) / 1000);
  return out.sort((a, b) => a.mm2 - b.mm2);
}

export interface TierTotal {
  tier: WireTier;
  count: number;
  cutMm: number;
  withWasteM: number;
}

/** Wire to buy per consolidated purchase tier (the practical shopping list). */
export function wireTotalsByTier(resolved: ResolvedWire[]): TierTotal[] {
  return wireTiers
    .map((tier) => {
      const ws = resolved.filter((w) => w.tierId === tier.id);
      const cutMm = ws.reduce((a, w) => {
        const band = lengthBands.find((b) => b.id === w.lengthBandId)!;
        return a + band.cutMm;
      }, 0);
      return { tier, count: ws.length, cutMm, withWasteM: Math.ceil((cutMm * 1.15) / 1000) };
    })
    .filter((t) => t.count > 0);
}

export interface BandBucket {
  band: LengthBand;
  wires: ResolvedWire[];
}

/** Wires grouped by cut-length band — "cut N wires at X m". */
export function wiresByBand(resolved: ResolvedWire[]): BandBucket[] {
  return lengthBands
    .map((band) => ({ band, wires: resolved.filter((w) => w.lengthBandId === band.id) }))
    .filter((b) => b.wires.length > 0);
}
