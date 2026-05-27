/**
 * Generates a WireViz YAML for ONE detachable module from the harness model.
 *
 *   npx tsx scripts/gen-wireviz-module.ts front-clip
 *   .venv/bin/wireviz harness/mod-front-clip.yml -f s   # -> SVG
 *
 * Each component in the module is a connector (pins = the terminals it uses in
 * this module); each wire is a one-conductor cable; components OUTSIDE the
 * module that a wire reaches are drawn too, tagged with where they live, so you
 * can see what the module plugs into. Single wire colour — identity is the
 * Dymo label printed on each wire.
 */
import { writeFileSync } from "node:fs";
import { wires } from "../src/data/harness/wires";
import { resolvedWires, allNodes } from "../src/data/harness/index";
import { harnessModules, moduleOf } from "../src/data/harness/modules";

const moduleId = process.argv[2] ?? "front-clip";
const mod = harnessModules.find((m) => m.id === moduleId);
if (!mod) throw new Error(`unknown module '${moduleId}'`);
const inModule = new Set(mod.componentIds);

const nodeName = new Map(allNodes.map((n) => [n.id, n.name]));
const recById = new Map(resolvedWires.map((w) => [w.id, w]));
const modName = new Map(harnessModules.flatMap((m) => m.componentIds.map((c) => [c, m.name])));

// Wires that touch the module.
const mWires = wires.filter((w) => inModule.has(w.from.component) || inModule.has(w.to.component));

// Components + the terminals each uses (module + referenced external).
const compPins = new Map<string, string[]>();
const touch = (comp: string, term: string) => {
  const arr = compPins.get(comp) ?? [];
  if (!arr.includes(term)) arr.push(term);
  compPins.set(comp, arr);
};
for (const w of mWires) {
  touch(w.from.component, w.from.terminal);
  touch(w.to.component, w.to.terminal);
}
const pinIndex = (comp: string, term: string) => compPins.get(comp)!.indexOf(term) + 1;

const yaml: string[] = [];
yaml.push(`# Auto-generated — ${mod.name}. Do not edit by hand.`);
yaml.push(`# One wire colour (silicone, tinned) — identity is the Dymo label per wire.`);
yaml.push("");
yaml.push("connectors:");
for (const [comp, terms] of compPins) {
  const external = !inModule.has(comp);
  const where = external ? `  ↗ ${modName.get(comp) ?? "external"}` : "";
  yaml.push(`  ${comp}:`);
  yaml.push(`    type: "${(nodeName.get(comp) ?? comp).replace(/"/g, "'")}${where}"`);
  yaml.push(`    pinlabels: [${terms.map((t) => `"${t}"`).join(", ")}]`);
  if (external) yaml.push(`    bgcolor: "#2a2118"`); // tint external (off-module) boxes
}

yaml.push("");
yaml.push("cables:");
for (const w of mWires) {
  const rec = recById.get(w.id);
  yaml.push(`  ${w.id}:`);
  yaml.push(`    wirecount: 1`);
  yaml.push(`    colors: [BK]`);
  yaml.push(`    wirelabels: ["${w.label}"]`);
  if (rec) yaml.push(`    gauge: ${rec.recMm2} mm2`);
}

yaml.push("");
yaml.push("connections:");
for (const w of mWires) {
  yaml.push("  -");
  yaml.push(`    - ${w.from.component}: [${pinIndex(w.from.component, w.from.terminal)}]`);
  yaml.push(`    - ${w.id}: [1]`);
  yaml.push(`    - ${w.to.component}: [${pinIndex(w.to.component, w.to.terminal)}]`);
}
yaml.push("");

const path = new URL(`../harness/mod-${moduleId}.yml`, import.meta.url);
writeFileSync(path, yaml.join("\n"));
console.log(`Wrote harness/mod-${moduleId}.yml — ${compPins.size} boxes, ${mWires.length} wires`);
