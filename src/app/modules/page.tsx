import { harnessModules } from "@/data/harness/modules";
import { CircleModuleDiagram } from "@/components/circle-module-diagram";
import { ModuleWireSchedule } from "@/components/module-wire-schedule";
import { ModuleBuildSteps } from "@/components/module-build-steps";
import { resolvedWires, allNodes } from "@/data/harness";
import { modulesForWire } from "@/data/harness/modules";
import { bomGaps } from "@/data/harness/parts";

const futureNode = new Set(allNodes.filter((n) => n.future).map((n) => n.id));

// "Future" wires + components in a module = work parked for later. A module
// with zero future is ready to bench-build today; with some, it's mostly
// ready with provisional items; all-future is a documentation-only module.
function moduleReadiness(moduleId: string) {
  const mod = harnessModules.find((m) => m.id === moduleId)!;
  const futureComponents = mod.componentIds.filter((id) => futureNode.has(id));
  const wires = resolvedWires.filter((w) => modulesForWire(w).includes(moduleId));
  const futureWires = wires.filter((w) => w.future);
  const total = mod.componentIds.length + wires.length;
  const futureCount = futureComponents.length + futureWires.length;
  if (futureCount === 0) return { label: "Ready to build", tone: "ready" as const, futureCount, total };
  if (futureCount === total) return { label: "Future — documentation only", tone: "future" as const, futureCount, total };
  return { label: `Partial — ${futureCount} future provisions`, tone: "partial" as const, futureCount, total };
}

const tones = {
  ready: "bg-green-500/15 text-green-300 border-green-500/30",
  partial: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  future: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
};

const tools = bomGaps.filter((g) => g.category === "tool");

export default function ModulesPage() {
  return (
    <div className="space-y-8">
      <div className="no-print">
        <h1 className="text-xl font-bold">Detachable modules — diagram & build</h1>
        <p className="text-muted text-sm mt-0.5 max-w-3xl">
          Each module as a circular routing diagram: every box is a part, placed around the ring in the order that
          minimises total connection length (so neighbours on the ring are closely wired). Toggle a connection above
          the diagram, or click a box to isolate one component — its pin/relay layout (tinted with its wire colours)
          drops in right below. The wire schedule under each diagram is what you take to the bench. Print
          (Cmd/Ctrl-P) for the garage.
        </p>
      </div>

      {/* Bench setup — what you need at the workbench BEFORE picking up the first wire.
          Same set for every module (the harness uses one terminal family throughout). */}
      <section className="rounded-lg border bg-panel break-inside-avoid">
        <div className="px-3 py-2 border-b">
          <h2 className="font-semibold">Before you start — tools at the bench</h2>
          <p className="text-xs text-muted mt-0.5">These cover every module (one terminal family throughout). Skip the lug crimper if you're not on the heavy battery / starter cables today.</p>
        </div>
        <ul className="p-3 text-sm space-y-1.5">
          {tools.map((t) => (
            <li key={t.id} className="flex gap-2">
              <span className="text-muted shrink-0">▢</span>
              <div>
                <div className="font-medium">{t.item}</div>
                {t.suggestion && <div className="text-xs text-muted">{t.suggestion}</div>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {harnessModules.map((m) => (
        <section key={m.id} className="rounded-lg border bg-panel break-inside-avoid">
          <div className="px-3 py-2 border-b flex items-baseline justify-between gap-2 flex-wrap">
            <div>
              <h2 className="font-semibold">{m.name}</h2>
              <p className="text-xs text-muted mt-0.5">{m.summary}</p>
            </div>
            {(() => {
              const r = moduleReadiness(m.id);
              return <span className={`text-[11px] px-2 py-0.5 rounded border whitespace-nowrap shrink-0 ${tones[r.tone]}`}>{r.label}</span>;
            })()}
          </div>

          {/* Circular routing diagram + toggles + per-component detail */}
          <div className="p-3 border-b">
            <CircleModuleDiagram moduleId={m.id} />
            <ModuleWireSchedule moduleId={m.id} />
          </div>

          {/* Build */}
          <div className="p-3 grid lg:grid-cols-2 gap-3">
            <ModuleBuildSteps moduleId={m.id} steps={m.steps} />
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
