/**
 * Generates a WireViz YAML for the three dashboard-disconnect bulkhead plugs
 * (GT 280 12-way) from the harness model, then you render it with WireViz:
 *
 *   npx tsx scripts/gen-wireviz.ts
 *   .venv/bin/wireviz harness/bulkheads.yml
 *
 * Output: a connector-breakout drawing + auto BOM for the plugs you build to
 * make the dash removable. Single wire colour (as planned) — identity is the
 * Dymo label on each pin.
 */
import { writeFileSync } from "node:fs";
import { connectors } from "../src/data/harness/connectors";
import { resolvedWires } from "../src/data/harness/index";
import { zoneLinks } from "../src/data/harness/zones";

const wireById = new Map(resolvedWires.map((w) => [w.label, w]));

function legMm(a: string, b: string): number {
  const l = zoneLinks.find((z) => (z.from === a && z.to === b) || (z.from === b && z.to === a));
  return l ? l.routeMm : 800;
}

const lines: string[] = [];
lines.push("# Auto-generated from the harness model — do not edit by hand.");
lines.push("# Dashboard-disconnect bulkhead plugs (Aptiv/Delphi GT 280, 12-way).");
lines.push("");
lines.push("connectors:");

for (const c of connectors) {
  const labels = Array.from({ length: c.ways }, (_, i) => {
    const pin = c.pins.find((p) => p.pin === i + 1);
    return pin ? pin.wireLabel : "";
  });
  for (const side of ["A_dash", "B_engine"]) {
    lines.push(`  ${c.id}_${side}:`);
    lines.push(`    type: GT 280 12-way (${side.startsWith("A") ? "female / dash" : "male / engine"})`);
    lines.push(`    pincount: ${c.ways}`);
    lines.push(`    pinlabels: [${labels.map((l) => (l ? `"${l}"` : '""')).join(", ")}]`);
  }
}

lines.push("");
lines.push("cables:");
for (const c of connectors) {
  const used = c.pins;
  lines.push(`  ${c.id}_cable:`);
  lines.push(`    wirecount: ${used.length}`);
  lines.push(`    colors: [${used.map(() => "BK").join(", ")}]   # single colour — see Dymo labels`);
  lines.push(`    length: ${(legMm(c.zoneA, c.zoneB) / 1000).toFixed(2)} # m`);
  lines.push(`    wirelabels: [${used.map((p) => `"${p.wireLabel}"`).join(", ")}]`);
  const gauges = used
    .map((p) => wireById.get(p.wireLabel)?.recMm2)
    .filter(Boolean);
  const note = `${c.purpose}`;
  lines.push(`    notes: "${note.replace(/"/g, "'")} | gauges (mm2): ${[...new Set(gauges)].join("/")}"`);
}

lines.push("");
lines.push("connections:");
for (const c of connectors) {
  const pins = c.pins.map((p) => p.pin);
  lines.push("  -");
  lines.push(`    - ${c.id}_A_dash: [${pins.join(",")}]`);
  lines.push(`    - ${c.id}_cable: [${c.pins.map((_, i) => i + 1).join(",")}]`);
  lines.push(`    - ${c.id}_B_engine: [${pins.join(",")}]`);
}
lines.push("");

const out = lines.join("\n");
writeFileSync(new URL("../harness/bulkheads.yml", import.meta.url), out);
console.log("Wrote harness/bulkheads.yml");
console.log(`  ${connectors.length} connectors, ${connectors.reduce((a, c) => a + c.pins.length, 0)} wires`);
