"use client";

import { useState } from "react";
import type { BomLine } from "@/data/harness";

const cell = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

export function BomCsv({ rows }: { rows: BomLine[] }) {
  const [copied, setCopied] = useState(false);
  const csv = [
    "Qty,Mouser PN,MFG PN,Description,Category",
    ...rows.map((r) => [r.qty, r.mouserPn, r.mfgPn, r.desc, r.category].map(cell).join(",")),
  ].join("\n");

  const download = () => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alfa-gt-harness-bom.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  return (
    <div className="flex gap-2">
      <button onClick={download} className="text-xs px-2.5 py-1 rounded bg-accent text-white font-medium hover:opacity-90">
        Download CSV
      </button>
      <button onClick={copy} className="text-xs px-2.5 py-1 rounded border hover:bg-panel-2">
        {copied ? "Copied ✓" : "Copy CSV"}
      </button>
    </div>
  );
}
