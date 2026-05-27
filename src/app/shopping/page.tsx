import { tierTotals, fuseShoppingList, terminationTally, completeBom, terminalsByGaugeGender, buildWirePlan, recommendedSpares, wireGroundSplit, gt280TerminalPlan } from "@/data/harness";
import { ownedParts, bomGaps, terminalByGauge } from "@/data/harness/parts";
import { connectorBom, mouserUrl } from "@/data/harness/connectors";
import { externalSuggestions } from "@/data/harness/external-suppliers";
import { BomCsv } from "@/components/bom-csv";

const mouser = (q: string) => `https://www.mouser.com/c/?q=${encodeURIComponent(q)}`;
const coreParts = ownedParts.filter((p) => p.category === "distribution" || p.category === "relay");
const sp = (n: number) => Math.ceil(n * 1.2); // +20% spares

export default function ShoppingPage() {
  const term = terminationTally();
  const wireSplit = wireGroundSplit();
  const wsGround = wireSplit.reduce((s, r) => s + r.groundM, 0);
  const wsNon = wireSplit.reduce((s, r) => s + r.nonGroundM, 0);
  const byg = terminalsByGaugeGender();
  const need = (gauge: number, gender: "male" | "female") =>
    sp(byg.find((t) => t.mm2 === gauge && t.gender === gender)?.count ?? 0);

  // Per-gauge terminal rows (need incl. spares vs owned).
  const termRows = terminalByGauge
    .filter((s) => !s.isRing)
    .flatMap((s) => (["female", "male"] as const).map((g) => {
      const want = need(s.mm2, g);
      const have = (g === "female" ? s.ownedF : s.ownedM) ?? 0;
      return { label: `${s.awg} AWG (${s.mm2} mm²) ${g.toUpperCase()}`, pn: g === "female" ? s.femalePn : s.malePn, want, have, buy: Math.max(0, want - have) };
    }));

  const wirePlan = buildWirePlan();

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

      <section>
        <h2 className="text-lg font-semibold mb-2">Recommended spares — keep in the car</h2>
        <p className="text-xs text-muted mb-2 max-w-3xl">
          Every relay is one of two interchangeable 35&nbsp;A parts, so one of each turns ANY relay failure into a
          30-second roadside plug-swap — the ignition-main relay especially is a single point of failure for the
          whole car. Plus a couple of each fuse rating that&apos;s actually fitted.
        </p>
        <div className="overflow-auto border rounded-lg">
          <table className="wtable">
            <thead>
              <tr><th>Spare</th><th>Qty</th><th>Covers</th><th>MFG PN</th></tr>
            </thead>
            <tbody>
              {recommendedSpares().map((s, i) => (
                <tr key={i}>
                  <td className="text-xs">{s.label}</td>
                  <td className="font-mono">{s.qty}</td>
                  <td className="text-xs text-muted">{s.covers}</td>
                  <td className="text-xs">
                    {s.mfgPn ? (
                      <a href={mouser(s.mouserPn ?? s.mfgPn)} target="_blank" rel="noreferrer" className="text-accent underline font-mono">{s.mfgPn}</a>
                    ) : <span className="text-muted">—</span>}
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
          Links go to Mouser (search by Aptiv PN; Mouser PN = <span className="font-mono">829-&lt;PN&gt;</span>).
          Each pair = one male + one female housing — and they take <strong>GT 280 terminals + GT 280 seals</strong>
          (not Metri-Pack 280). Exact terminal/seal counts below.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">GT 280 plug terminals &amp; seals — exact, by gauge</h2>
        <p className="text-xs text-muted mb-2 max-w-3xl">
          The {gt280TerminalPlan().reduce((n, r) => n + r.perSide, 0)} wires crossing the GT 280 bulkheads (per side),
          by terminal size. You own the <strong>male</strong> terminals; the <strong>female</strong> terminals and
          <strong> all the seals</strong> are the audit gap. Counts include +20% crimp spares.
        </p>
        <div className="overflow-auto border rounded-lg">
          <table className="wtable">
            <thead>
              <tr><th>Size (AWG)</th><th>Wires/side</th><th>Male — own</th><th>Male — BUY</th><th>Female — BUY (PN)</th><th>Seals — BUY (PN)</th></tr>
            </thead>
            <tbody>
              {gt280TerminalPlan().map((r) => (
                <tr key={r.size}>
                  <td className="font-mono font-semibold">{r.size}</td>
                  <td className="font-mono">{r.perSide}</td>
                  <td className="font-mono">{r.maleOwned}</td>
                  <td className="font-mono font-semibold" style={{ color: r.maleBuy ? "var(--warn)" : "var(--ok)" }}>{r.maleBuy ? `+${r.maleBuy}` : "✓"}</td>
                  <td className="font-mono font-semibold" style={{ color: "var(--warn)" }}>+{r.femaleBuy} <span className="text-muted font-normal">{r.femalePn}</span></td>
                  <td className="font-mono font-semibold" style={{ color: "var(--warn)" }}>+{r.sealBuy} <span className="text-muted font-normal">{r.sealPn}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-1.5">
          Seals = one per wire per half (both sides), so ≈2× the per-side count. The male 22-20 is marginally short
          (you own 25, need 26 + spares) — top it up too. SW3 (the 3-way switch cluster) is a separate small connector,
          not GT 280.
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

      {/* Wire — this build (owned vs buy) */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Wire — this build (owned vs buy)</h2>
        <div className="overflow-auto border rounded-lg">
          <table className="wtable">
            <thead>
              <tr><th>Class</th><th>Gauge</th><th>Need (m)</th><th>Own (m)</th><th>Buy (m)</th></tr>
            </thead>
            <tbody>
              {wirePlan.map((r) => (
                <tr key={r.cls}>
                  <td>{r.cls}</td>
                  <td className="font-mono">{r.awg !== "—" ? `${r.awg} AWG` : `${r.mm2} mm²`} <span className="text-muted">({r.mm2} mm²)</span></td>
                  <td className="font-mono">{r.needM}</td>
                  <td className="font-mono">{r.ownM}</td>
                  <td className="font-mono font-semibold" style={{ color: r.buyM ? "var(--warn)" : "var(--ok)" }}>{r.buyM ? r.buyM : "✓"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-1.5">
          This build runs <strong>signal on 22 AWG</strong> (owned, all loom-wrapped); the clean-build recommendation
          stays the optimal 0.5 mm² / 20 AWG, and the signal shortfall is bought as 20 AWG (same 22-20 terminals).
          Spare 18 AWG (low) can also back up signal. Buy quantities per class are in the table above; the ground /
          non-ground split is below. Lengths include 15% waste; future/capped wires (O2, PWM low-speed) are excluded.
        </p>
      </section>

      {/* Wire — ground vs non-ground */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Wire — ground vs non-ground</h2>
        <div className="overflow-auto border rounded-lg">
          <table className="wtable">
            <thead>
              <tr><th>Class</th><th>Gauge</th><th>Ground (m)</th><th>Non-ground (m)</th><th>Total (m)</th><th>Own (m)</th><th>Buy (m)</th></tr>
            </thead>
            <tbody>
              {wireSplit.map((r) => (
                <tr key={r.gaugeClass}>
                  <td>{r.gaugeClass}</td>
                  <td className="font-mono text-xs whitespace-nowrap">{r.gauge}</td>
                  <td className="font-mono">{r.groundM}</td>
                  <td className="font-mono">{r.nonGroundM}</td>
                  <td className="font-mono">{r.totalM}</td>
                  <td className="font-mono">{r.ownedM}</td>
                  <td className="font-mono font-semibold" style={{ color: r.buyM ? "var(--warn)" : "var(--ok)" }}>{r.buyM ? r.buyM : "✓"}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td colSpan={2}>Totals</td>
                <td className="font-mono">{wsGround}</td>
                <td className="font-mono">{wsNon}</td>
                <td className="font-mono" colSpan={3}>{wsGround + wsNon} m total</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-1.5">
          Ground = any wire landing on a module ground block or the battery −. The ground side is dominated by the
          heavy feed/medium runs (the module trunks + lamp/device earths); the bulk of the harness is non-ground
          signal. Totals match the owned-vs-buy table above.
        </p>
      </section>

      {/* Terminals — per gauge */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Terminals — per gauge (owned vs buy)</h2>
        <div className="overflow-auto border rounded-lg">
          <table className="wtable">
            <thead>
              <tr><th>Terminal</th><th>PN</th><th>Need (est.)</th><th>Own</th><th>Buy</th></tr>
            </thead>
            <tbody>
              {termRows.map((r) => (
                <tr key={r.label}>
                  <td className="text-xs">{r.label}</td>
                  <td className="font-mono text-xs text-muted">{r.pn ?? "—"}</td>
                  <td className="font-mono">~{r.want}</td>
                  <td className="font-mono">{r.have}</td>
                  <td className="font-mono font-semibold" style={{ color: r.buy ? "var(--warn)" : "var(--ok)" }}>{r.buy ? `+${r.buy}` : "✓"}</td>
                </tr>
              ))}
              <tr><td className="text-xs">Single-wire seals — Metri-Pack 280 (block/device side)</td><td className="text-muted text-xs">15324982/-81/-85</td><td className="font-mono">~{sp(term.seals)}</td><td className="font-mono">250</td><td className="font-mono font-semibold" style={{ color: "var(--ok)" }}>✓</td></tr>
              <tr><td className="text-xs">Spade (faston) — device ends</td><td className="text-muted text-xs">170187-2 / 1217084-1</td><td className="font-mono">~{sp(term.spade)}</td><td className="font-mono">65</td><td className="font-mono font-semibold" style={{ color: "var(--warn)" }}>+{Math.max(0, sp(term.spade) - 65)}</td></tr>
              <tr><td className="text-xs">Ring terminals — studs (6/16/25 mm²)</td><td className="text-muted text-xs">assorted</td><td className="font-mono">~{term.ring}</td><td className="font-mono">0</td><td className="font-mono font-semibold" style={{ color: "var(--warn)" }}>+{term.ring}</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-1.5">
          ⚠ <strong>Two terminal systems</strong> (audit): the MALE terminals you own are <strong>GT 280</strong> (for the
          bulkhead-plug male halves); the FEMALE terminals + seals you own are <strong>Metri-Pack 280</strong> (for the
          RTMR/PDM rears + device ends). The GT 280 plugs additionally need <strong>GT 280 female terminals</strong>
          (15304718/19/20) <strong>+ GT 280 seals</strong> (15366065/66/67) — you own <strong>zero</strong> of those; see the
          gaps below. Need = estimate + 20% spares.
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

      {/* Not at Mouser — suggested sources */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Not at Mouser — suggested sources + specs</h2>
        <p className="text-muted text-xs mb-3">
          Finished aftermarket parts Mouser doesn&apos;t stock. External links (may drift) — find EU/Norway-local
          equivalents where it&apos;s cheaper. Match the <strong>specs</strong> so you don&apos;t get the wrong variant.
        </p>
        <div className="space-y-3">
          {externalSuggestions.map((e) => (
            <div key={e.id} className="rounded-lg border bg-panel p-3">
              <div className="font-semibold text-sm">{e.item}</div>
              <div className="text-xs text-muted italic mt-0.5">{e.why}</div>
              <div className="text-xs mt-1.5">
                <span className="uppercase tracking-wide text-[10px] text-accent-2">Specs</span>{" "}
                <span className="text-fg">{e.specs}</span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {e.options.map((o) => (
                  <a key={o.url} href={o.url} target="_blank" rel="noreferrer" className="text-xs text-accent underline">
                    {o.name}
                    {o.note && <span className="text-muted no-underline"> · {o.note}</span>}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
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
