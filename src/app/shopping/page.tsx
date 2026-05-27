import { tierTotals, fuseShoppingList, terminationTally, completeBom } from "@/data/harness";
import { ownedParts, bomGaps } from "@/data/harness/parts";
import { connectorBom, mouserUrl } from "@/data/harness/connectors";
import { BomCsv } from "@/components/bom-csv";

const owned = (pn: string) => ownedParts.find((p) => p.mfgPn === pn)?.qtyOwned ?? 0;
// Mouser keyword search — works for both Mouser PNs and MFG PNs.
const mouser = (q: string) => `https://www.mouser.com/c/?q=${encodeURIComponent(q)}`;
const coreParts = ownedParts.filter((p) => p.category === "distribution" || p.category === "relay");

export default function ShoppingPage() {
  const term = terminationTally();
  // Owned MP280 terminals split by gender (from the Mouser orders).
  const maleOwned = owned("15304724-L") + owned("15304731-L") + owned("15304730-L");
  const femaleOwned = owned("12110847-L") + owned("12110845-L") + owned("12110843-L");
  const sealsOwned = owned("15324982") + owned("15324981") + owned("15324985");
  const spadeOwned = owned("170187-2") + owned("1217084-1");

  const need = (have: number, want: number) => ({
    have,
    want,
    short: Math.max(0, want - have),
    ok: have >= want,
  });

  const counts = [
    { label: "MP280 terminals — MALE (connector male halves)", ...need(maleOwned, term.mp280Male) },
    { label: "MP280 terminals — FEMALE (other halves + block/relay rear)", ...need(femaleOwned, term.mp280Female) },
    { label: "Single-wire seals", ...need(sealsOwned, term.seals) },
    { label: "Spade (faston) terminals — device ends", ...need(spadeOwned, term.spade) },
    { label: "Ring terminals — battery/ground/B+ studs", ...need(0, term.ring) },
  ];

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-xl font-bold">Shopping list</h1>
        <p className="text-muted text-sm mt-0.5 max-w-3xl">
          A <strong>complete build-from-scratch list</strong> — every part with a Mouser link, assuming you own
          nothing. (Mouser is the single supplier that carries the whole BOM incl. the Bussmann RTMR and ships to
          Norway — see notes at the bottom.) Connectors are matched <strong>male + female</strong> pairs so the
          gender can&apos;t be ordered wrong; terminal/seal figures are estimates from the wire schedule.
        </p>
      </div>

      {/* Spreadsheet / CSV */}
      <section>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <h2 className="text-lg font-semibold">Spreadsheet — every line with quantity</h2>
          <BomCsv rows={completeBom()} />
        </div>
        <p className="text-muted text-xs mb-2">
          One flat orderable list. Discrete parts (centres, relays, connectors, fuses) are exact; terminals/seals/spades
          carry ~20% spares; wire is metres incl. waste. CSV columns: Qty, Mouser PN, MFG PN, Description, Category —
          importable to a Mouser BOM or a spreadsheet.
        </p>
        <div className="overflow-auto border rounded-lg max-h-[28rem]">
          <table className="wtable">
            <thead>
              <tr><th className="w-16">Qty</th><th>Part</th><th>Mouser PN</th><th>MFG PN</th></tr>
            </thead>
            <tbody>
              {completeBom().map((r, i) => (
                <tr key={i}>
                  <td className="font-mono font-semibold whitespace-nowrap">{r.qty}</td>
                  <td className="text-xs">{r.desc}</td>
                  <td className="text-xs">
                    {r.mouserPn ? (
                      <a href={mouser(r.mouserPn)} target="_blank" rel="noreferrer" className="text-accent underline font-mono">{r.mouserPn}</a>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="font-mono text-xs text-muted">{r.mfgPn || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Core parts */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Power centres & relays</h2>
        <div className="overflow-auto border rounded-lg">
          <table className="wtable">
            <thead>
              <tr><th>Part</th><th>Qty</th><th>MFG PN</th><th>Mouser</th></tr>
            </thead>
            <tbody>
              {coreParts.map((p) => (
                <tr key={p.mfgPn}>
                  <td className="text-xs">{p.desc.split(" / ")[0].split(" — ")[0]}</td>
                  <td className="font-mono">{p.qtyOwned}</td>
                  <td className="font-mono text-xs">{p.mfgPn}</td>
                  <td className="text-xs">
                    <a href={mouser(p.mouserPn ?? p.mfgPn)} target="_blank" rel="noreferrer" className="text-accent underline font-mono">
                      {p.mouserPn ?? p.mfgPn}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Connectors */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Connectors (GT 280) — buy as male + female pairs</h2>
        <div className="overflow-auto border rounded-lg">
          <table className="wtable">
            <thead>
              <tr>
                <th>Size</th>
                <th>Used for</th>
                <th>Need</th>
                <th>Own</th>
                <th>Buy</th>
                <th>Male PN</th>
                <th>Female PN</th>
              </tr>
            </thead>
            <tbody>
              {connectorBom.map((c) => (
                <tr key={c.ways}>
                  <td className="font-mono font-semibold whitespace-nowrap">{c.ways}-way</td>
                  <td className="text-xs text-muted">{c.use}</td>
                  <td className="font-mono">{c.pairsNeeded}</td>
                  <td className="font-mono">{c.pairsOwned}</td>
                  <td className="font-mono font-semibold" style={{ color: c.pairsToBuy ? "var(--warn)" : "var(--ok)" }}>
                    {c.pairsToBuy ? `+${c.pairsToBuy}` : "✓"}
                  </td>
                  <td className="text-xs">
                    <a href={c.male.url} target="_blank" rel="noreferrer" className="text-accent underline font-mono">
                      {c.male.mfgPn}
                    </a>
                  </td>
                  <td className="text-xs">
                    <a href={c.female.url} target="_blank" rel="noreferrer" className="text-accent underline font-mono">
                      {c.female.mfgPn}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-1.5">
          Links go to Mouser (search by Aptiv PN; Mouser PN = <span className="font-mono">829-&lt;PN&gt;</span>). The
          12-way row is covered by the three owned pairs (two left spare). Each pair = one male housing + one
          female housing; both use your owned MP280 terminals.
        </p>
      </section>

      {/* Buy now: wire + fuses */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Wire & fuses</h2>
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

      {/* Terminals: have enough? */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Terminals — owned vs needed (gendered)</h2>
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
                <td>Relays (Song Chuan ISO-280)</td>
                <td className="font-mono">11</td>
                <td className="font-mono">11</td>
                <td className="font-mono font-semibold" style={{ color: "var(--ok)" }}>✓ exact</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-1.5">
          Gender split: each bulkhead crossing needs one terminal in each housing half (1 male + 1 female).
          Block/relay/PDM rear ends are counted as <strong>female</strong> (harness-side socket) — confirm against
          the RTMR/PDM datasheets; if any are male, that many shift male. The starter and alternator B+ are
          ring terminals on studs (counted under rings), not spades.
        </p>
      </section>

      {/* Gap items */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Wire, fuses, grounds & the rest (commodity — buy by category)</h2>
        <ul className="space-y-1.5">
          {bomGaps.map((g) => (
            <li key={g.id} className="flex gap-3 text-sm">
              <span className="text-accent-2 font-mono text-xs whitespace-nowrap pt-0.5 w-28 shrink-0">{g.qty}</span>
              <span>
                <span className="font-medium">{g.item}</span>
                <span className="text-muted"> — {g.reason}</span>
                {g.suggestion && (
                  <>
                    {" "}
                    <a href={mouser(g.suggestion.split(/[;(]/)[0])} target="_blank" rel="noreferrer" className="text-accent underline">
                      search Mouser
                    </a>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Supplier note */}
      <section className="rounded-lg border bg-panel p-3 text-sm">
        <h2 className="font-semibold mb-1">Where to buy</h2>
        <p className="text-muted">
          <strong className="text-fg">Mouser</strong> is the single supplier that covers the whole BOM and ships to
          Norway (<span className="font-mono">no.mouser.com</span>) — and it&apos;s the only major electronics
          distributor that stocks the <strong className="text-fg">Bussmann/Eaton RTMR</strong> (the constraint part).
          DigiKey still doesn&apos;t carry the RTMR; RS-Europe and Farnell don&apos;t list the RTMR/PDM line either.
          Norway&apos;s 25 % import VAT applies whatever the origin (no EU advantage), so consolidating into one
          Mouser order keeps customs handling to a single event. Optional split: source <strong className="text-fg">bulk
          TXL/GXL wire + loom</strong> locally (heavy, cheap, avoids transatlantic freight + VAT on copper) — that&apos;s
          the one category a specialist (e.g. Waytek) or a Norwegian auto-electrical supplier does better.
        </p>
      </section>
    </div>
  );
}
