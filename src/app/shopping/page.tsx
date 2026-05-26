import {
  tierTotals,
  fuseShoppingList,
  terminationTally,
} from "@/data/harness";
import { ownedParts, bomGaps } from "@/data/harness/parts";
import { connectorPairsNeeded, connectorPairsOwned } from "@/data/harness/connectors";

const owned = (pn: string) => ownedParts.find((p) => p.mfgPn === pn)?.qtyOwned ?? 0;

export default function ShoppingPage() {
  const term = terminationTally();
  const mp280Owned = owned("12110847-L") + owned("12110845-L") + owned("12110843-L") + owned("15304724-L") + owned("15304731-L") + owned("15304730-L");
  const sealsOwned = owned("15324982") + owned("15324981") + owned("15324985");
  const spadeOwned = owned("170187-2") + owned("1217084-1");
  const connShort = Math.max(0, connectorPairsNeeded - connectorPairsOwned);

  const need = (have: number, want: number) => ({
    have,
    want,
    short: Math.max(0, want - have),
    ok: have >= want,
  });

  const counts = [
    { label: "Metri-Pack 280 terminals", ...need(mp280Owned, term.mp280) },
    { label: "Single-wire seals", ...need(sealsOwned, term.seals) },
    { label: "Spade (faston) terminals", ...need(spadeOwned, term.spade) },
  ];

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-xl font-bold">Shopping list</h1>
        <p className="text-muted text-sm mt-0.5">
          Everything to finish the build, in one place. Terminal/seal figures are estimates from
          the wire schedule (each connector crossing ≈ 2 terminals + 2 seals).
        </p>
      </div>

      {/* Buy now */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Order</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted mb-1.5">Wire (by gauge tier)</div>
            <table className="wtable">
              <thead>
                <tr>
                  <th>Gauge</th>
                  <th>Use</th>
                  <th>Order</th>
                </tr>
              </thead>
              <tbody>
                {tierTotals.map((t) => (
                  <tr key={t.tier.id}>
                    <td className="font-mono whitespace-nowrap">
                      {t.tier.mm2} mm²<span className="text-muted"> / {t.tier.awg}</span>
                    </td>
                    <td className="text-xs text-muted">{t.tier.label.split("—")[1]}</td>
                    <td className="font-mono font-semibold whitespace-nowrap">{t.withWasteM} m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-muted mb-1.5">MINI / ATM fuses</div>
            <table className="wtable">
              <thead>
                <tr>
                  <th>Rating</th>
                  <th>Buy (incl. spares)</th>
                </tr>
              </thead>
              <tbody>
                {fuseShoppingList().map((f) => (
                  <tr key={f.ratingA}>
                    <td className="font-mono font-semibold">{f.ratingA} A</td>
                    <td className="font-mono">{f.buy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Have enough? */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Do you have enough? (owned vs needed)</h2>
        <div className="overflow-auto border rounded-lg">
          <table className="wtable">
            <thead>
              <tr>
                <th>Item</th>
                <th>Owned</th>
                <th>Needed (est.)</th>
                <th>Buy more</th>
              </tr>
            </thead>
            <tbody>
              {counts.map((c) => (
                <tr key={c.label}>
                  <td>{c.label}</td>
                  <td className="font-mono">{c.have}</td>
                  <td className="font-mono">~{c.want}</td>
                  <td className="font-mono font-semibold" style={{ color: c.ok ? "var(--ok)" : "var(--warn)" }}>
                    {c.ok ? "✓ enough" : `+${c.short}`}
                  </td>
                </tr>
              ))}
              <tr>
                <td>12-way GT 280 connector pairs</td>
                <td className="font-mono">{connectorPairsOwned}</td>
                <td className="font-mono">{connectorPairsNeeded}</td>
                <td className="font-mono font-semibold" style={{ color: connShort ? "var(--warn)" : "var(--ok)" }}>
                  {connShort ? `+${connShort} pairs` : "✓ enough"}
                </td>
              </tr>
              <tr>
                <td>Relays (Song Chuan ISO-280)</td>
                <td className="font-mono">11</td>
                <td className="font-mono">11</td>
                <td className="font-mono font-semibold" style={{ color: "var(--ok)" }}>✓ exact</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Gap items */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Also needed (not in the orders)</h2>
        <ul className="space-y-1.5">
          {bomGaps.map((g) => (
            <li key={g.id} className="flex gap-3 text-sm">
              <span className="text-accent-2 font-mono text-xs whitespace-nowrap pt-0.5 w-28 shrink-0">{g.qty}</span>
              <span>
                <span className="font-medium">{g.item}</span>
                <span className="text-muted"> — {g.reason}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
