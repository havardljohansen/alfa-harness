import { harnessModules } from "@/data/harness/modules";

// public/ assets are served under the GH Pages base path in production.
const basePath = process.env.GH_PAGES === "true" ? "/alfa-harness" : "";

export default function ModulesPage() {
  return (
    <div className="space-y-8">
      <div className="no-print">
        <h1 className="text-xl font-bold">Detachable modules — diagram & build</h1>
        <p className="text-muted text-sm mt-0.5 max-w-3xl">
          Each module as a WireViz harness diagram (boxes = parts with their pins, lines = wires with the
          Dymo label + gauge; tinted boxes are off-module parts it plugs into) — followed by how to build it.
          Print (Cmd/Ctrl-P) to take into the garage.
        </p>
      </div>

      {harnessModules.map((m) => (
        <section key={m.id} className="rounded-lg border bg-panel break-inside-avoid">
          <div className="px-3 py-2 border-b">
            <h2 className="font-semibold">{m.name}</h2>
            <p className="text-xs text-muted mt-0.5">{m.summary}</p>
          </div>

          {/* Diagram */}
          <div className="p-3 border-b">
            <div className="text-[11px] uppercase tracking-wide text-muted mb-1.5">Wiring diagram</div>
            <div className="overflow-auto rounded bg-white p-2" style={{ maxHeight: "30rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${basePath}/diagrams/mod-${m.id}.svg`}
                alt={`${m.name} wiring diagram`}
                className="max-w-none"
              />
            </div>
          </div>

          {/* Build */}
          <div className="p-3 grid lg:grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted mb-1">Build steps</div>
              <ol className="space-y-1 text-sm list-decimal list-inside">
                {m.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted mb-1">Interfaces</div>
              <ul className="text-xs list-disc list-inside text-muted mb-2">
                {m.interfaces.map((x, i) => <li key={i}>{x}</li>)}
              </ul>
              <div className="text-xs"><span className="text-muted">Ground:</span> {m.ground}</div>
              <div className="mt-2 text-[11px] uppercase tracking-wide text-muted mb-1">Parts</div>
              <div className="flex flex-wrap gap-1">
                {m.parts.map((p, i) => (
                  <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-panel-2">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
