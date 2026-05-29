"use client";

import { useMemo, useState } from "react";
import { resolvedWires, allNodes } from "@/data/harness";
import { circuits } from "@/data/harness/circuits";
import { harnessModules, moduleConnectors } from "@/data/harness/modules";
import { relays, fuseBlocks } from "@/data/harness/relays";
import { fuses } from "@/data/harness/fuses";
import { connectors, logicalBulkheads } from "@/data/harness/connectors";
import { gaugeSpecs, lengthBands } from "@/data/harness/zones";
import { BlockGrid, ConnectorGrid } from "@/components/layout-grids";
import type { CircuitGroup, GaugeClass } from "@/data/harness/types";
import { solveCircle, optimalOrder, type REdge } from "@/lib/circle-route";
import { parseWireColor, swatchBackground, FALLBACK as COLOR_FALLBACK } from "@/data/harness/wire-colors";
import { Plug, Cpu, Lightbulb, Volume2, Battery, BatteryCharging, ToggleRight, Gauge, Fan, Rainbow, Zap, SoapDispenserDroplet } from "lucide-react";

const gauge = new Map(gaugeSpecs.map((g) => [g.class, g] as const));
const cutByBand = new Map(lengthBands.map((b) => [b.id, b.cutMm] as const));

const circuitGroup = new Map(circuits.map((c) => [c.id, c.group]));
const node = new Map(allNodes.map((n) => [n.id, n]));
const moduleName = new Map(harnessModules.flatMap((m) => m.componentIds.map((c) => [c, m.name] as const)));
const relayBlock = new Map(relays.map((r) => [r.id, r.mountedIn]));
const displayId = (comp: string) => relayBlock.get(comp) ?? comp;
const connName = new Map(logicalBulkheads.map((c) => [c.id, c.name]));
const physForLogical = (id: string) => connectors.filter((c) => c.id === id || c.id.startsWith(id + "-"));
const isConnector = (id: string) => connName.has(id);
const isBlock = (id: string) => { const k = node.get(id)?.kind; return k === "fuse-block" || k === "distribution"; };
const isGround = (id: string) => node.get(id)?.kind === "ground";

// Categorical fallback for connections whose first wire has no `color` set
// (currently only the 3 modernised HL switching wires that need a colour
// decision). Used when `parseWireColor(w.color)` returns null.
const GROUP_COLOR: Record<CircuitGroup, string> = {
  power: "#9aa7b8", charging: "#e8b04b", starting: "#c98a4b", ignition: "#e2554a",
  headlights: "#f5c451", "exterior-lights": "#8bd17c", signals: "#56b4e9",
  instruments: "#b07cd1", wipers: "#4bc0c0", cooling: "#7cd1c4", fuel: "#e87c7c",
  comfort: "#9a9a9a", future: "#566",
};
const shortName = (name: string) => name.replace(/\s*\(.*?\)\s*/g, " ").replace(/ — .*/, "").replace(/ relay.*/i, " relay").trim();
const code = (id: string) => (id.length > 9 ? id.slice(0, 8) + "…" : id); // shrink-tube short code (the node id)
const TWO_PI = Math.PI * 2;

type Box = { id: string; name: string; role: "connector" | "block" | "device"; external: boolean; kind: string };

// Lucide icons for the box types most useful to spot at a glance. Mapped by
// component kind (or id for the few cases where a kind covers multiple kinds
// of part — e.g. motor vs heater-fan). Anything not in this list just gets
// text-only — keep the icons sparing so they signal type, not noise.
function BoxIcon({ box, bw }: { box: Box; bw: number }) {
  const k = box.kind;
  const size = bw * 0.6;
  const xOffset = (bw - size) / 2;
  const yOffset = bw * 0.08;
  // Greek capital omega for resistors — Lucide doesn't have an omega icon, so
  // we render the unicode character directly.
  if (k === "resistor") {
    return (
      <g opacity="0.55" color="#7dd3fc">
        <text x={bw / 2} y={yOffset + size / 2}
          textAnchor="middle" dominantBaseline="central"
          fontSize={size * 0.85} fontWeight={500} fill="currentColor">Ω</text>
      </g>
    );
  }
  let Icon: typeof Plug | null = null;
  if (box.role === "connector") Icon = Plug;
  else if (k === "fuse-block" || k === "distribution") Icon = Cpu;
  else if (k === "lamp" || k === "warning-light") Icon = Lightbulb;
  else if (k === "horn") Icon = Volume2;
  else if (k === "battery") Icon = Battery;
  else if (k === "alternator") Icon = BatteryCharging;
  else if (k === "coil") Icon = Zap;
  else if (k === "pump") Icon = SoapDispenserDroplet;
  else if (box.id === "heater-fan") Icon = Fan;
  else if (box.id === "wiper") Icon = Rainbow;
  else if (k === "switch" || k === "ignition-switch") Icon = ToggleRight;
  else if (k === "gauge") Icon = Gauge;
  if (!Icon) return null;
  return (
    <g opacity="0.55" color="#7dd3fc">
      <Icon x={xOffset} y={yOffset} width={size} height={size} strokeWidth={1.5} />
    </g>
  );
}
type WireInfo = { id: string; label: string; cls: GaugeClass; mm2: number; awg: number; cutMm: number; color?: string; colorBg: string };
type Conn = { idx: number; a: number; b: number; color: string; stripe?: string; colorBg: string; label: string; wires: WireInfo[] };

// hover tooltip text for a connection — each underlying wire's full heat-shrink
// code, label, gauge (AWG / mm²), cut length, and insulation colour.
function connTitle(boxes: Box[], c: Conn) {
  const head = `${boxes[c.a].name} ↔ ${boxes[c.b].name}`;
  const lines = c.wires.map((w) => {
    const colour = w.color ? `  ·  ${w.color}` : "";
    return `${w.id}  (${w.label})  ·  ${w.awg} AWG / ${w.mm2} mm²  ·  ${(w.cutMm / 1000).toFixed(1)} m${colour}`;
  });
  return [head, ...lines].join("\n");
}

export function CircleModuleDiagram({ moduleId }: { moduleId: string }) {
  // ---- derive boxes + connections for this module ----
  const base = useMemo(() => {
    const mod = harnessModules.find((m) => m.id === moduleId);
    if (!mod) return { boxes: [] as Box[], conns: [] as Conn[], grounds: [] as string[] };
    const inModule = new Set(mod.componentIds);
    const ownedConn = new Set(moduleConnectors[moduleId] ?? []);
    // Resolve a wire endpoint to either: (a) the component itself if it's in
    // this module, (b) a `via:` connector boundary if the wire is annotated
    // with one this module owns, (c) the OTHER endpoint if it's a module-owned
    // connector (covers em1 after the refactor — wires terminate AT em1 rather
    // than passing through it, so the routing isn't a `via`), or (d) the raw
    // external component as a last resort.
    const resolve = (comp: string, w: { from: { component: string }; to: { component: string }; via?: string[] }) => {
      if (inModule.has(comp)) return displayId(comp);
      const fromVia = (w.via ?? []).find((v) => ownedConn.has(v));
      if (fromVia) return fromVia;
      const other = w.from.component === comp ? w.to.component : w.from.component;
      if (ownedConn.has(other)) return other; // wire ends at one of our connectors → collapse external to that connector
      return comp;
    };
    const idIndex = new Map<string, number>();
    const boxes: Box[] = [];
    const addBox = (id: string) => {
      if (!idIndex.has(id)) {
        idIndex.set(id, boxes.length);
        boxes.push({
          id,
          name: isConnector(id) ? (connName.get(id) ?? id) : shortName(node.get(id)?.name ?? id),
          role: isConnector(id) ? "connector" : isBlock(id) ? "block" : "device",
          external: !isConnector(id) && !inModule.has(id),
          kind: node.get(id)?.kind ?? "",
        });
      }
      return idIndex.get(id)!;
    };
    const pairs = new Map<string, Conn>();
    const grounds = new Set<string>();
    for (const w of resolvedWires) {
      if (!(inModule.has(w.from.component) || inModule.has(w.to.component))) continue;
      const s = resolve(w.from.component, w), t = resolve(w.to.component, w);
      if (s === t) continue;
      if (isGround(s)) { grounds.add(s); continue; }
      if (isGround(t)) { grounds.add(t); continue; }
      const ai = addBox(s), bi = addBox(t);
      const a = Math.min(ai, bi), b = Math.max(ai, bi);
      const key = `${a}|${b}`;
      if (!pairs.has(key)) {
        const stroke = parseWireColor(w.color);
        const base = stroke?.base ?? GROUP_COLOR[circuitGroup.get(w.circuit)!] ?? COLOR_FALLBACK;
        const bg = stroke ? swatchBackground(w.color) : base;
        pairs.set(key, { idx: pairs.size, a, b, color: base, stripe: stroke?.stripe, colorBg: bg, label: w.label, wires: [] });
      }
      const g = gauge.get(w.gaugeClass);
      pairs.get(key)!.wires.push({ id: w.id, label: w.label, cls: w.gaugeClass, mm2: g?.mm2 ?? 0, awg: g?.awg ?? 0, cutMm: cutByBand.get(w.lengthBandId) ?? w.lengthMm, color: w.color, colorBg: swatchBackground(w.color) });
    }
    return { boxes, conns: [...pairs.values()], grounds: [...grounds] };
  }, [moduleId]);

  const { boxes, conns, grounds } = base;
  const n = boxes.length;

  // Additive selection: empty set = everything active. Toggling a chip starts a
  // selection (first one, then the next, …) — nothing pre-selected.
  const [wsel, setWsel] = useState<Set<number>>(new Set()); // selected connections (empty = all)
  const [sel, setSel] = useState<Set<number>>(new Set()); // selected components (empty = all)
  const [focus, setFocus] = useState<number | null>(null); // a single box whose detail is shown below
  const [info, setInfo] = useState(false); // code → name legend (mobile, no hover)
  const toggleBox = (i: number) => { setFocus(null); setSel((s) => { const next = new Set(s); if (next.has(i)) next.delete(i); else next.add(i); return next; }); };
  const toggleWire = (idx: number) => setWsel((s) => { const next = new Set(s); if (next.has(idx)) next.delete(idx); else next.add(idx); return next; });
  const wireActive = (idx: number) => wsel.size === 0 || wsel.has(idx);
  const isolating = sel.size > 0;

  // ---- lay out only the SHOWN boxes (all, or the isolated selection) ----
  const L = useMemo(() => {
    const shown = isolating ? [...sel] : boxes.map((_, i) => i);
    const shownSet = new Set(shown);
    const sub = new Map(shown.map((orig, i) => [orig, i] as const));
    const internal = conns.filter((c) => shownSet.has(c.a) && shownSet.has(c.b));
    const boundary = conns.filter((c) => shownSet.has(c.a) !== shownSet.has(c.b));
    const m = shown.length;
    const subEdges: REdge[] = internal.map((c) => ({ a: sub.get(c.a)!, b: sub.get(c.b)! }));
    const boxAtSlot = optimalOrder(m, subEdges);
    const slotOfSub = new Array(m).fill(0);
    boxAtSlot.forEach((subIdx, slot) => (slotOfSub[subIdx] = slot));
    const slotEdges: REdge[] = subEdges.map((e) => ({ a: slotOfSub[e.a], b: slotOfSub[e.b] }));
    const size = Math.max(440, Math.min(720, 380 + m * 13));
    const routed = solveCircle(m, slotEdges, internal.map((_, i) => i), size);
    return { shown, shownSet, sub, internal, boundary, m, boxAtSlot, slotOfSub, routed };
  }, [boxes, conns, sel, isolating]);

  const { shown, shownSet, sub, internal, boundary, m, boxAtSlot, slotOfSub, routed } = L;

  // Stubs: short radial dashes at a box's inner edge, indicating a connection
  // that exists but isn't currently routed as a full path. Two cases:
  //   (a) BOUNDARY — wire goes to a component that isn't shown (isolation
  //       mode). Stub at the shown end only.
  //   (b) FILTERED — wire is between two shown boxes but the user toggled it
  //       off via the chip selector. Stub at BOTH ends so you can see the
  //       connection exists without rendering the full path.
  const stubs = useMemo(() => {
    const center = routed.size / 2;
    const rInner = routed.boxR - routed.box / 2;
    const STUB = Math.min(20, rInner * 0.12);
    const halfW = ((routed.box / 2) / rInner) * 0.8;
    const perBox: Record<number, Conn[]> = {};
    // (a) Boundary stubs — only ones for ACTIVE boundary wires
    for (const c of boundary) {
      if (!wireActive(c.idx)) continue;
      const orig = shownSet.has(c.a) ? c.a : c.b;
      (perBox[orig] ??= []).push(c);
    }
    // (b) Filtered-off internal stubs — both ends of any internal wire that's
    //     been toggled off via the chip selector. So toggling a connection
    //     off doesn't make it disappear — it just shrinks to two stubs.
    for (const c of internal) {
      if (wireActive(c.idx)) continue;
      (perBox[c.a] ??= []).push(c);
      (perBox[c.b] ??= []).push(c);
    }
    const out: { idx: number; d: string; color: string; stripe?: string }[] = [];
    for (const origStr in perBox) {
      const orig = +origStr, list = perBox[orig];
      const slot = slotOfSub[sub.get(orig)!];
      const baseAng = (slot / m) * TWO_PI - Math.PI / 2;
      list.forEach((c, j) => {
        const off = (list.length === 1 ? 0 : j / (list.length - 1) - 0.5) * 2 * halfW;
        const a = baseAng + off;
        const x1 = center + rInner * Math.cos(a), y1 = center + rInner * Math.sin(a);
        const x2 = center + (rInner - STUB) * Math.cos(a), y2 = center + (rInner - STUB) * Math.sin(a);
        out.push({ idx: c.idx, d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`, color: c.color, stripe: c.stripe });
      });
    }
    return out;
  }, [boundary, wsel, shownSet, sub, slotOfSub, m, routed]);

  if (n === 0) return <div className="text-sm text-muted p-3">No routed connections in this module.</div>;

  // detail list below: a clicked box shows only its own section; otherwise the
  // whole shown set (all, or the isolated selection).
  const detailBoxes = focus !== null ? [focus] : shown;

  const Figure = ({ bi }: { bi: number }) => {
    const box = boxes[bi];
    const incident = conns.filter((c) => c.a === bi || c.b === bi);
    const swatches = (
      <span className="inline-flex gap-1 ml-1 align-middle">
        {incident.map((c) => <span key={c.idx} className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: c.colorBg }} title={c.label} />)}
      </span>
    );
    if (box.role === "connector") {
      // Dots removed — pin cells themselves now carry the wire colours as
      // border accents (see layout-grids.tsx ConnectorGrid). For non-connector
      // figures the dots stay since their layouts don't render per-terminal colour.
      return (
        <div className="border rounded p-2 bg-panel">
          <div className="text-xs font-semibold"><span className="font-mono">{box.id}</span> · {box.name}<span className="text-muted font-normal"> — connector pin layout</span></div>
          {physForLogical(box.id).map((c) => (
            <div key={c.id} className="mt-1.5">
              <div className="text-[10px] text-muted">{c.name} · {c.pins.length}/{c.ways} pins</div>
              <ConnectorGrid connector={c} />
            </div>
          ))}
        </div>
      );
    }
    if (box.role === "block") {
      const blk = fuseBlocks.find((b) => b.id === box.id);
      if (!blk) return null;
      const bf = fuses.filter((f) => f.block === box.id);
      const br = relays.filter((r) => r.mountedIn === box.id);
      return (
        <div className="border rounded p-2 bg-panel">
          <div className="text-xs font-semibold"><span className="font-mono">{box.id}</span> · {blk.name}{box.external && <span className="text-muted"> · ↗ {moduleName.get(box.id)}</span>}<span className="text-muted font-normal"> — relay/fuse layout</span> {swatches}</div>
          <div className="mt-1.5"><BlockGrid block={blk} blockFuses={bf} blockRelays={br} /></div>
        </div>
      );
    }
    const nd = node.get(box.id);
    return (
      <div className="border rounded p-2 bg-panel">
        <div className="text-xs font-semibold"><span className="font-mono">{box.id}</span> · {nd?.name ?? box.id}{box.external && <span className="text-muted"> · ↗ {moduleName.get(box.id)}</span>} {swatches}</div>
        <div className="text-[10px] text-muted mt-1">{nd?.terminals.map((t) => t.id).join(" · ")}</div>
      </div>
    );
  };

  // When isolating components, show only chips for wires that run BETWEEN the
  // selected components (both endpoints in the isolation set). Becomes a
  // wiring-checklist for the section you're about to build — anything else is
  // noise. Stubs for wires that leave the selection (boundary) are still
  // shown on the diagram itself, just not as chips here.
  const visibleConns = isolating ? internal : conns;

  return (
    <div>
      {/* wire toggle list */}
      <div className="text-[11px] uppercase tracking-wide text-muted mb-1">
        Connections — click to hide/show
        {isolating && <span className="normal-case text-muted/70 ml-2">(only wires between selected components — boundary stubs visible on the diagram)</span>}
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {visibleConns.map((c) => {
          const on = wsel.has(c.idx);
          return (
            <button key={c.idx} onClick={() => toggleWire(c.idx)} title={connTitle(boxes, c)}
              className={`text-[11px] px-1.5 py-0.5 rounded border flex items-center gap-1 font-mono ${on ? "bg-white/10 border-white/30" : wsel.size ? "opacity-45 border-white/15 hover:opacity-100" : "bg-white/5 border-white/15 hover:bg-white/10"}`}>
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: c.colorBg }} />
              {code(boxes[c.a].id)} ↔ {code(boxes[c.b].id)}
            </button>
          );
        })}
      </div>

      {/* component isolate list */}
      <div className="text-[11px] uppercase tracking-wide text-muted mb-1">
        Components — click to isolate part of the loom
        {isolating && <button onClick={() => { setSel(new Set()); setFocus(null); }} className="ml-2 text-accent underline normal-case">show all</button>}
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {boxes.map((b, i) => {
          const on = sel.has(i);
          return (
            <button key={b.id} onClick={() => toggleBox(i)} title={b.name}
              className={`text-[11px] px-1.5 py-0.5 rounded border font-mono ${on ? "bg-sky-400/20 border-sky-400/60 text-sky-200" : "bg-white/5 border-white/15 hover:bg-white/10"}`}>
              {code(b.id)}
            </button>
          );
        })}
      </div>

      {/* circular visualization — fills the viewport, square, with a min size */}
      <div className="rounded-lg border bg-panel relative">
        {/* interaction hints — both affordances are quietly muted but on-screen
            so a new viewer knows what's clickable / hoverable */}
        <div className="px-3 py-1.5 text-[11px] text-muted border-b flex items-center justify-between gap-3 flex-wrap">
          <span>Hover a wire → tooltip with label, gauge, length, colour</span>
          <span>Click a box → focus only its pin/relay layout below</span>
          <span className="text-[10px] opacity-70">{focus !== null ? `Focused: ${code(boxes[focus].id)} — click again to clear` : ""}</span>
        </div>
        {/* info icon — tap reveals the code → title legend (no hover on mobile) */}
        <button onClick={() => setInfo((v) => !v)} aria-label="Show component codes"
          className="absolute top-9 right-2 z-10 w-6 h-6 rounded-full border border-white/30 bg-panel/80 text-xs leading-none hover:bg-white/10">ⓘ</button>
        {info && (
          <div className="absolute top-16 right-2 z-10 max-h-[60%] w-56 overflow-auto rounded border bg-panel/95 backdrop-blur p-2 text-[11px] shadow-lg">
            <div className="uppercase tracking-wide text-muted mb-1">Codes</div>
            {shown.map((bi) => (
              <div key={boxes[bi].id} className="flex gap-2">
                <span className="font-mono shrink-0 w-16 truncate">{boxes[bi].id}</span>
                <span className="text-muted truncate">{boxes[bi].name}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mx-auto" style={{ width: "min(92vw, 84vh)", minWidth: 360 }}>
          <svg viewBox={`0 0 ${routed.size} ${routed.size}`} className="block w-full h-auto">
            {routed.rings.map((r, k) => <circle key={k} cx={routed.size / 2} cy={routed.size / 2} r={r} fill="none" stroke="rgba(125,211,252,0.12)" strokeWidth={1} />)}
            {internal.map((c, i) => wireActive(c.idx) ? (
              <g key={c.idx} style={{ cursor: "help" }}>
                <path d={routed.paths[i]} fill="none" stroke={c.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                {c.stripe && (
                  <path d={routed.paths[i]} fill="none" stroke={c.stripe} strokeWidth={2} strokeLinejoin="round" strokeLinecap="butt" strokeDasharray="10 12" />
                )}
                {/* invisible wide hover target so the tooltip is easy to grab */}
                <path d={routed.paths[i]} fill="none" stroke="transparent" strokeWidth={10}>
                  <title>{connTitle(boxes, c)}</title>
                </path>
              </g>
            ) : null)}
            {stubs.map((s) => (
              <g key={`stub-${s.idx}`} style={{ cursor: "help" }}>
                <path d={s.d} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="1 3" />
                {s.stripe && (
                  <path d={s.d} fill="none" stroke={s.stripe} strokeWidth={2.5} strokeLinecap="butt" strokeDasharray="3 7" />
                )}
                <path d={s.d} fill="none" stroke="transparent" strokeWidth={12}>
                  <title>{connTitle(boxes, conns[s.idx])}</title>
                </path>
              </g>
            ))}
            {boxAtSlot.map((subIdx, slot) => {
              const orig = shown[subIdx];
              const p = routed.positions[slot];
              const box = boxes[orig];
              const foc = focus === orig;
              const bw = routed.box;
              return (
                <g key={orig} transform={`translate(${p.x},${p.y})`} onClick={() => setFocus(foc ? null : orig)} style={{ cursor: "pointer" }}>
                  <title>{box.id} · {box.name}{box.external ? ` · ↗ ${moduleName.get(box.id)}` : ""}</title>
                  <g transform={`rotate(${p.rot} ${bw / 2} ${bw / 2})`}>
                    <rect width={bw} height={bw} rx={6}
                      fill={foc ? "#243042" : box.role === "connector" ? "#1c2530" : box.external ? "#10141b" : "#161d28"}
                      stroke={foc ? "#7dd3fc" : box.role === "connector" ? "#5a6678" : box.external ? "#3a4250" : "#2a323f"}
                      strokeWidth={foc ? 2.5 : box.role === "connector" ? 1.6 : 1}
                      strokeDasharray={box.external ? "3 2" : undefined} />
                    <g transform={`rotate(${p.labelRot} ${bw / 2} ${bw / 2})`}>
                      <BoxIcon box={box} bw={bw} />
                      <text x={bw / 2} y={bw - 3}
                        textAnchor="middle" dominantBaseline="text-after-edge" fontSize={Math.max(7, Math.min(10, bw / 4))} fill="#e7ecf3">
                        {code(box.id)}
                      </text>
                    </g>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="px-3 py-1.5 text-[11px] text-muted border-t flex items-center justify-between">
          <span>{routed.crossings} crossings · {routed.circles} circles · boxes ordered by shortest total connection length</span>
          {isolating && <span>{sel.size} component{sel.size > 1 ? "s" : ""} · {boundary.length} wire{boundary.length === 1 ? "" : "s"} leave the selection (stubs)</span>}
        </div>
      </div>

      {/* clicked-box detail (or the full figure list) — right below the viz */}
      {focus !== null && (
        <div className="mt-2 text-[11px] text-muted">Showing <span className="font-mono">{boxes[focus].id}</span> · click the box again to show all</div>
      )}
      <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {detailBoxes.map((bi) => <Figure key={boxes[bi].id} bi={bi} />)}
      </div>

      {/* ground rail */}
      {grounds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] border rounded px-2 py-1 bg-panel">
          <span className="uppercase tracking-wide text-muted">Ground rail</span>
          <span aria-hidden className="text-base leading-none">⏚</span>
          {grounds.map((g) => <span key={g} className="label-chip">{node.get(g)?.name ?? g}</span>)}
          <span className="text-muted">— every load in this module lands here; one thick trunk to the hub.</span>
        </div>
      )}
    </div>
  );
}
