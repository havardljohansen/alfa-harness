import { fuseBlocks, relays } from "@/data/harness/relays";
import { fuses } from "@/data/harness/fuses";
import { connectors } from "@/data/harness/connectors";

export default function FusesPage() {
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-xl font-bold">Fuses & relays</h1>
        <p className="text-muted text-sm mt-0.5">
          Four engine-bay power centres. MINI (ATM) blade fuses; ISO-280 relays. Each block lists
          its fitted positions and the relays plugged into it.
        </p>
      </div>

      {fuseBlocks.map((b) => {
        const blockFuses = fuses.filter((f) => f.block === b.id);
        const blockRelays = relays.filter((r) => r.mountedIn === b.id);
        return (
          <section key={b.id} className="rounded-lg border bg-panel">
            <div className="px-3 py-2 border-b flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">{b.name}</h2>
              <span className="text-xs font-mono text-muted">{b.model}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-panel-2 text-muted">
                {b.bussed ? "bussed" : "non-bussed"}
              </span>
              <span className="ml-auto text-xs text-muted">
                {blockFuses.filter((f) => f.ratingA > 0).length}/{b.fuseWays} fuses ·{" "}
                {blockRelays.length} relays
              </span>
            </div>
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="p-3 lg:border-r">
                <div className="text-xs uppercase tracking-wide text-muted mb-1.5">Fuses</div>
                <table className="wtable">
                  <thead>
                    <tr>
                      <th className="w-10">#</th>
                      <th className="w-16">Rating</th>
                      <th>Circuit</th>
                      <th>Feeds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockFuses.map((f) => (
                      <tr key={f.id} style={f.ratingA === 0 ? { opacity: 0.5 } : undefined}>
                        <td className="font-mono">{f.position}</td>
                        <td className="font-mono font-semibold">
                          {f.ratingA ? `${f.ratingA} A` : "—"}
                        </td>
                        <td>{f.name}</td>
                        <td className="text-muted text-xs">{f.feeds}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3">
                <div className="text-xs uppercase tracking-wide text-muted mb-1.5">Relays</div>
                {blockRelays.length === 0 ? (
                  <div className="text-sm text-muted">None.</div>
                ) : (
                  <div className="space-y-2">
                    {blockRelays.map((r) => (
                      <div key={r.id} className="border rounded p-2 bg-panel-2/40">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{r.name}</span>
                          <span className="text-[10px] font-mono px-1 rounded bg-panel-2">{r.type}</span>
                        </div>
                        <div className="text-xs text-muted mt-0.5">{r.fn}</div>
                        <div className="text-[11px] font-mono text-muted mt-1">
                          coil← {r.coilTriggerLabel} · 30← {r.commonFrom} · 87→ {r.out87}
                          {r.out87a ? ` · 87a→ ${r.out87a}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}

      <section>
        <h2 className="text-lg font-semibold mb-2">Bulkhead connectors</h2>
        <p className="text-muted text-sm mb-2">
          The dashboard pulls out behind these {connectors.length} plugs (12-way GT 280). Pin maps
          are generated from the wire schedule.
        </p>
        <div className="grid lg:grid-cols-3 gap-3">
          {connectors.map((c) => (
            <div key={c.id} className="rounded-lg border bg-panel p-3">
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs text-muted mt-0.5">{c.purpose}</div>
              <div className="text-xs text-muted mt-1">
                {c.pins.length}/{c.ways} pins used
              </div>
              <ol className="mt-2 space-y-0.5 text-xs">
                {c.pins.map((p) => (
                  <li key={p.pin} className="flex gap-2" style={p.reserved ? { opacity: 0.5 } : undefined}>
                    <span className="font-mono text-muted w-5">{p.pin}</span>
                    <span className="label-chip">{p.wireLabel}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
