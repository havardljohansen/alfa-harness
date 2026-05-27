import {
  factoryMeta,
  factoryIgnition,
  factoryCharging,
  factoryFuses,
  factoryComponents,
  factoryArchitectureNotes,
  type ModernStatus,
} from "@/data/original/factory";
import {
  factoryNet,
  factoryNetSections,
  factoryGroundWires,
} from "@/data/original/factory-netlist";

// Map a factory colour name to a CSS swatch (two-tone for "X/Black" tracers).
const COLOR_HEX: Record<string, string> = {
  Black: "#222", Gray: "#9aa0a6", White: "#f5f5f5", Red: "#d83b3b",
  Green: "#3aa655", Blue: "#3b6fd8", Yellow: "#e7c43b", Brown: "#7b5230",
  Violet: "#8a5cd8", Pink: "#e0709a",
};
function swatch(color: string) {
  const [base, tracer] = color.split("/");
  const b = COLOR_HEX[base] ?? "#666";
  const t = tracer ? COLOR_HEX[tracer] ?? "#222" : null;
  return t
    ? `linear-gradient(135deg, ${b} 0 60%, ${t} 60% 100%)`
    : b;
}

const statusStyle: Record<ModernStatus, string> = {
  preserved: "bg-emerald-900/40 text-emerald-300",
  modernized: "bg-sky-900/40 text-sky-300",
  removed: "bg-rose-900/40 text-rose-300",
  added: "bg-amber-900/40 text-amber-300",
};

const sectionTitle: Record<string, string> = {
  power: "Battery & power", charging: "Charging", starting: "Starting",
  ignition: "Ignition", lighting: "Headlights", position: "Position / tail / plate",
  turn: "Turn signals", brake: "Brake", reverse: "Reverse", horn: "Horns",
  instruments: "Instruments & senders", wipers: "Wipers / washer", cooling: "Heater fan",
  interior: "Interior / lighter", ground: "GROUNDS (body-return)",
};

export default function OriginalPage() {
  const ordered = [
    "power", "charging", "starting", "ignition", "lighting", "position",
    "turn", "brake", "reverse", "horn", "instruments", "wipers", "cooling",
    "interior", "ground",
  ].filter((s) => factoryNetSections.includes(s));

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-xl font-bold">Original factory wiring</h1>
        <p className="text-muted text-sm mt-0.5 max-w-3xl">
          {factoryMeta.make} {factoryMeta.model} ({factoryMeta.modelCode}) — captured from {factoryMeta.source}.
          This is the <em>architecture reference</em> so there&apos;s no confusion when building the modern harness,
          plus a wire-by-wire netlist with expected loads. The original wire <strong>colours are archival</strong>{" "}
          (the modern harness is one colour + Dymo labels); the <strong>grounds</strong> are the verified part —
          the factory returns everything through the body.
        </p>
      </div>

      {/* Architecture summary */}
      <section className="grid md:grid-cols-2 gap-3">
        <div className="rounded-lg border bg-panel p-3">
          <div className="font-semibold mb-1">Ignition switch · {factoryIgnition.positions}-position</div>
          <ul className="text-sm text-muted space-y-0.5">
            {factoryIgnition.detents.map((d) => (
              <li key={d.name}><span className="font-mono text-fg">{d.name}</span> — {d.feeds}</li>
            ))}
          </ul>
          <div className="text-xs text-muted mt-1 italic">{factoryIgnition.note}</div>
        </div>
        <div className="rounded-lg border bg-panel p-3">
          <div className="font-semibold mb-1">Charging</div>
          <div className="text-sm text-muted">{factoryCharging.type}</div>
          <div className="text-xs text-muted mt-1 italic">{factoryCharging.note}</div>
          <ul className="text-sm mt-2 space-y-0.5 list-disc list-inside">
            {factoryArchitectureNotes.map((n, i) => (
              <li key={i} className="text-muted">{n}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Fuse legend */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Fuse legend (10 × 8 A)</h2>
        <table className="wtable">
          <thead>
            <tr><th className="w-10">#</th><th className="w-16">Rating</th><th>Factory loads</th><th>Where it lives now</th></tr>
          </thead>
          <tbody>
            {factoryFuses.map((f) => (
              <tr key={f.n}>
                <td className="font-mono">{f.n}</td>
                <td className="font-mono">{f.ratingA} A</td>
                <td>{f.loads}</td>
                <td className="text-muted text-xs">{f.modern}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Netlist */}
      <section>
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
          <h2 className="text-lg font-semibold">Wire-by-wire netlist</h2>
          <div className="text-xs text-muted">
            {factoryNet.length} wires · {factoryGroundWires.length} grounds ·
            colour swatch two-tone = tracer · <span className="text-amber-300">amber dot</span> = colour from
            standard scheme (verify), else read off the diagram
          </div>
        </div>
        <div className="space-y-5">
          {ordered.map((sec) => {
            const ws = factoryNet.filter((w) => w.section === sec);
            const isGnd = sec === "ground";
            return (
              <div key={sec} className={`rounded-lg border ${isGnd ? "border-amber-700/50" : ""} bg-panel`}>
                <div className="px-3 py-1.5 border-b font-semibold text-sm">
                  {sectionTitle[sec] ?? sec} <span className="text-muted font-normal">· {ws.length}</span>
                </div>
                <table className="wtable">
                  <thead>
                    <tr>
                      <th className="w-28">Colour</th>
                      <th>From → To</th>
                      <th className="w-14">Fuse</th>
                      <th className="w-16">Load</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ws.map((w) => (
                      <tr key={w.id}>
                        <td>
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="inline-block w-4 h-3 rounded-sm border border-black/40 shrink-0"
                              style={{ background: swatch(w.color) }}
                            />
                            <span className="text-xs">{w.color}</span>
                            {w.conf === "scheme" && <span className="text-amber-400" title="colour from standard scheme — verify">●</span>}
                          </span>
                        </td>
                        <td className="text-xs">
                          <span className="font-mono">{w.from.comp}</span>
                          {w.from.term && <span className="text-muted">.{w.from.term}</span>}
                          {" → "}
                          <span className="font-mono">{w.to.comp}</span>
                          {w.to.term && <span className="text-muted">.{w.to.term}</span>}
                        </td>
                        <td className="font-mono text-xs">{w.fuse ? `F${w.fuse}` : "—"}</td>
                        <td className="font-mono text-xs">{w.loadA} A{w.mm2 ? ` · ${w.mm2}㎟` : ""}</td>
                        <td className="text-muted text-xs">{w.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </section>

      {/* Component fate */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Component inventory — fate in the modern harness</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {factoryComponents.map((c) => (
            <div key={c.name} className="rounded border bg-panel p-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{c.name}</span>
                <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded shrink-0 ${statusStyle[c.status]}`}>
                  {c.status}
                </span>
              </div>
              <div className="text-xs text-muted mt-0.5">{c.modern}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
