import { bandBuckets, tierTotals, gaugeTotals, resolvedWires } from "@/data/harness";
import { wireTiers, zoneLinks, heavyRunsToMeasure } from "@/data/harness/zones";

export default function LengthsPage() {
  const total = resolvedWires.reduce((a, w) => a + w.lengthMm, 0);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-xl font-bold">Wire lengths</h1>
        <p className="text-muted text-sm mt-0.5">
          Lengths are deduced from each wire&apos;s zone route. Cut in batches by band, and buy by
          consolidated gauge tier. Edit the zone distances in <code>zones.ts</code> after measuring
          the car to make these exact. Total deduced wire: <strong>{(total / 1000).toFixed(1)} m</strong>.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-2">Buy by gauge (consolidated tiers)</h2>
        <div className="overflow-auto border rounded-lg">
          <table className="wtable">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Gauge</th>
                <th>Use</th>
                <th>Wires</th>
                <th>Cut total</th>
                <th>Order (+15%)</th>
              </tr>
            </thead>
            <tbody>
              {tierTotals.map((t) => (
                <tr key={t.tier.id}>
                  <td className="font-mono font-semibold">{t.tier.id}</td>
                  <td className="font-mono whitespace-nowrap">
                    {t.tier.mm2} mm² <span className="text-muted">/ {t.tier.awg} AWG</span>
                  </td>
                  <td className="text-muted text-xs">{t.tier.note}</td>
                  <td className="font-mono">{t.count}</td>
                  <td className="font-mono">{(t.cutMm / 1000).toFixed(1)} m</td>
                  <td className="font-mono font-semibold">{t.withWasteM} m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-1.5">
          {wireTiers.length} sizes cover the whole car — signals share one small size, most power one
          medium, headlights one large, plus feed and battery/starter.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Cut-length bands</h2>
        <p className="text-muted text-sm mb-2">Cut everything in a band to the same length.</p>
        <div className="grid md:grid-cols-2 gap-3">
          {bandBuckets.map((b) => (
            <div key={b.band.id} className="rounded-lg border bg-panel p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{b.band.label}</div>
                <div className="font-mono text-sm">
                  cut @ <span className="text-accent-2">{(b.band.cutMm / 1000).toFixed(1)} m</span> ·{" "}
                  {b.wires.length}×
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {b.wires.map((w) => (
                  <span key={w.id} className="label-chip" title={`${w.name} (${(w.lengthMm / 1000).toFixed(2)} m)`}>
                    {w.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Ideal-gauge breakdown</h2>
        <p className="text-muted text-sm mb-2">
          For reference — the ideal per-wire gauge before consolidation.
        </p>
        <div className="overflow-auto border rounded-lg">
          <table className="wtable">
            <thead>
              <tr>
                <th>Gauge</th>
                <th>Wires</th>
                <th>Actual total</th>
                <th>Cut total</th>
              </tr>
            </thead>
            <tbody>
              {gaugeTotals.map((g) => (
                <tr key={g.mm2}>
                  <td className="font-mono">
                    {g.mm2} mm² <span className="text-muted">/ {g.awg} AWG</span>
                  </td>
                  <td className="font-mono">{g.count}</td>
                  <td className="font-mono">{(g.actualMm / 1000).toFixed(1)} m</td>
                  <td className="font-mono">{(g.cutMm / 1000).toFixed(1)} m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-1">Measure these in the car</h2>
        <p className="text-xs text-muted mb-2 max-w-3xl">
          Every wire length above is built from these inter-zone route segments. Tape-measure each one
          <strong> along the intended loom path</strong> (not straight-line) and update <code>routeMm</code> in
          <code> zones.ts</code> — the gauge totals then become exact. Estimates shown are for a ~4.08 m Giulia GT.
        </p>
        <div className="overflow-auto border rounded-lg">
          <table className="wtable">
            <thead>
              <tr><th>Segment</th><th>What to measure</th><th>Estimate</th></tr>
            </thead>
            <tbody>
              {zoneLinks.map((l, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs whitespace-nowrap">{l.from} → {l.to}</td>
                  <td className="text-xs text-muted">{l.measure}</td>
                  <td className="font-mono whitespace-nowrap">{(l.routeMm / 1000).toFixed(1)} m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-semibold mt-3 mb-1">Heavy single cables — measure each directly</h3>
        <p className="text-xs text-muted mb-2 max-w-3xl">
          These thick runs dominate the heavy-gauge total and each is its own cable (not a loom bundle), so
          measure them point-to-point.
        </p>
        <ul className="text-xs space-y-0.5">
          {heavyRunsToMeasure.map((h, i) => (
            <li key={i}>
              <span className="font-mono">{h.label}</span> <span className="text-muted">— {h.note}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
