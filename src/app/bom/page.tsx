import { Fragment } from "react";
import { ownedParts, bomGaps } from "@/data/harness/parts";
import { fuseShoppingList, tierTotals } from "@/data/harness";
import { connectorPairsNeeded, connectorPairsOwned } from "@/data/harness/connectors";

const catLabel: Record<string, string> = {
  distribution: "Power distribution",
  relay: "Relays",
  "connector-housing": "Connector housings",
  terminal: "Terminals",
  seal: "Seals",
  lock: "Locks / TPA",
  spade: "Spade terminals",
  wire: "Wire",
  fuse: "Fuses",
  charging: "Charging",
  consumable: "Consumables",
  component: "Components",
};

export default function BomPage() {
  const cats = [...new Set(ownedParts.map((p) => p.category))];

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-xl font-bold">Bill of materials</h1>
        <p className="text-muted text-sm mt-0.5">
          What you already own (from the two Mouser orders in <code>/reference</code>) and what the
          build still needs. Everything unifies on the Aptiv/Delphi Metri-Pack 280 terminal system.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-2">Owned</h2>
        <div className="overflow-auto border rounded-lg">
          <table className="wtable">
            <thead>
              <tr>
                <th>Qty</th>
                <th>Part</th>
                <th>Description</th>
                <th>Role in this harness</th>
              </tr>
            </thead>
            <tbody>
              {cats.map((cat) => (
                <Fragment key={cat}>
                  <tr>
                    <td colSpan={4} className="bg-panel-2 font-semibold uppercase text-xs tracking-wide">
                      {catLabel[cat] ?? cat}
                    </td>
                  </tr>
                  {ownedParts
                    .filter((p) => p.category === cat)
                    .map((p) => (
                      <tr key={p.mfgPn}>
                        <td className="font-mono font-semibold">{p.qtyOwned}</td>
                        <td className="font-mono text-xs whitespace-nowrap">{p.mfgPn}</td>
                        <td className="text-xs">{p.desc}</td>
                        <td className="text-xs text-muted">{p.role}</td>
                      </tr>
                    ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div>
          <h2 className="text-lg font-semibold mb-2">Wire to buy</h2>
          <div className="overflow-auto border rounded-lg">
            <table className="wtable">
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Gauge</th>
                  <th>Order</th>
                </tr>
              </thead>
              <tbody>
                {tierTotals.map((t) => (
                  <tr key={t.tier.id}>
                    <td className="font-mono">{t.tier.id}</td>
                    <td className="font-mono whitespace-nowrap">
                      {t.tier.mm2} mm² / {t.tier.awg} AWG
                    </td>
                    <td className="font-mono font-semibold">{t.withWasteM} m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Fuses to buy (MINI / ATM)</h2>
          <div className="overflow-auto border rounded-lg">
            <table className="wtable">
              <thead>
                <tr>
                  <th>Rating</th>
                  <th>Fitted</th>
                  <th>Buy (incl. spares)</th>
                </tr>
              </thead>
              <tbody>
                {fuseShoppingList().map((f) => (
                  <tr key={f.ratingA}>
                    <td className="font-mono font-semibold">{f.ratingA} A</td>
                    <td className="font-mono">{f.fitted}</td>
                    <td className="font-mono">{f.buy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Still needed (gaps)</h2>
        <div className="space-y-2">
          {connectorPairsNeeded > connectorPairsOwned && (
            <div className="rounded-lg border p-3" style={{ background: "#241c10", borderColor: "var(--warn)" }}>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-semibold">More 12-way GT 280 bulkhead pairs</span>
                <span className="text-xs font-mono text-warn">
                  buy {connectorPairsNeeded - connectorPairsOwned} more
                </span>
              </div>
              <div className="text-sm text-muted mt-0.5">
                The dash/bulkhead crossings split into <strong>{connectorPairsNeeded}</strong> twelve-way
                plugs, but you own <strong>{connectorPairsOwned}</strong> pairs. Either add{" "}
                {connectorPairsNeeded - connectorPairsOwned} more GT 280 pairs (15326915 / 15326910) or
                step up to a single larger bulkhead connector for the dash.
              </div>
            </div>
          )}
          {bomGaps.map((g) => (
            <div key={g.id} className="rounded-lg border bg-panel p-3">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-semibold">{g.item}</span>
                <span className="text-xs font-mono text-accent-2">{g.qty}</span>
              </div>
              <div className="text-sm text-muted mt-0.5">{g.reason}</div>
              {g.suggestion && (
                <div className="text-xs text-muted mt-1">
                  <span className="text-fg">Suggestion:</span> {g.suggestion}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
