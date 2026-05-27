import { harnessModules } from "@/data/harness/modules";
import { ElkModuleDiagram } from "@/components/elk-module-diagram";

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

      {/* Pictorial-style sample (schemdraw) for comparison */}
      <section className="rounded-lg border border-amber-700/50 bg-panel">
        <div className="px-3 py-2 border-b">
          <h2 className="font-semibold">Pictorial style — sample (front headlights)</h2>
          <p className="text-xs text-muted mt-0.5">
            A <strong>schemdraw</strong> sample in the factory-PDF style — real component symbols (relays, lamps,
            grounds) + labelled wires — for comparison with the interactive node diagrams below. Trade-off: looks
            like the PDF, but each circuit is hand-laid-out (more work, doesn&apos;t auto-sync from the model as
            cleanly) and it&apos;s a static image.
          </p>
        </div>
        <div className="p-3">
          <div className="rounded bg-white p-3 inline-block max-w-full overflow-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${basePath}/diagrams/sample-front-headlight.svg`} alt="Front headlight pictorial schematic sample" className="max-w-full" />
          </div>
        </div>
      </section>

      {harnessModules.map((m) => (
        <section key={m.id} className="rounded-lg border bg-panel break-inside-avoid">
          <div className="px-3 py-2 border-b">
            <h2 className="font-semibold">{m.name}</h2>
            <p className="text-xs text-muted mt-0.5">{m.summary}</p>
          </div>

          {/* Diagram — interactive, fits the container (pan/zoom) */}
          <div className="p-3 border-b">
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="text-[11px] uppercase tracking-wide text-muted">Wiring diagram <span className="normal-case">— drag/scroll to pan, scroll to zoom</span></div>
              <a href={`${basePath}/diagrams/mod-${m.id}.svg`} target="_blank" rel="noreferrer" className="text-[11px] text-accent underline no-print">
                detailed WireViz drawing ↗
              </a>
            </div>
            <ElkModuleDiagram moduleId={m.id} />
            <p className="text-[10px] text-muted mt-1">
              ELK auto-layout. Boxes are numbered + named; the key below shows each part&apos;s symbol + terminals.
              Solid = this module; dashed/dimmed = off-module parts it plugs into. Wires coloured by circuit.
            </p>
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
