"use client";
/**
 * Build-step checklist with persistent state. Bench builds often span
 * multiple sessions — "where did I leave off?" is the question this
 * answers. Each step gets a checkbox; ticking it persists to
 * localStorage keyed by (moduleId, stepIdx). A counter at the top shows
 * progress at a glance, and a reset button clears the module's progress
 * when you start over.
 *
 * Pure-client component (localStorage). Falls back gracefully to plain
 * unchecked boxes if storage isn't available (e.g. private browsing,
 * SSR first paint).
 */
import { useEffect, useState } from "react";

const STORAGE_PREFIX = "alfa-harness.build-step";
const keyOf = (moduleId: string, idx: number) => `${STORAGE_PREFIX}.${moduleId}.${idx}`;

export function ModuleBuildSteps({ moduleId, steps }: { moduleId: string; steps: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(() => steps.map(() => false));
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage AFTER first paint to avoid a server/client
  // markup mismatch during SSR (storage isn't available on the server).
  useEffect(() => {
    try {
      const next = steps.map((_, i) => localStorage.getItem(keyOf(moduleId, i)) === "1");
      setChecked(next);
    } catch {}
    setHydrated(true);
  }, [moduleId, steps]);

  const toggle = (i: number) => {
    setChecked((c) => {
      const next = c.slice();
      next[i] = !next[i];
      try {
        localStorage.setItem(keyOf(moduleId, i), next[i] ? "1" : "0");
      } catch {}
      return next;
    });
  };

  const reset = () => {
    try {
      for (let i = 0; i < steps.length; i++) localStorage.removeItem(keyOf(moduleId, i));
    } catch {}
    setChecked(steps.map(() => false));
  };

  const done = checked.filter(Boolean).length;
  const total = steps.length;

  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted mb-1 flex items-baseline justify-between gap-2">
        <span>Build steps</span>
        <span className="normal-case">
          <span className={done === total ? "text-green-300" : "text-muted"}>{done}/{total} done</span>
          {hydrated && done > 0 && (
            <button onClick={reset} className="ml-2 text-accent underline no-print">reset</button>
          )}
        </span>
      </div>
      <ol className="space-y-1.5 text-sm">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2 items-start">
            <input
              type="checkbox"
              checked={checked[i] ?? false}
              onChange={() => toggle(i)}
              className="mt-1 shrink-0 cursor-pointer"
              aria-label={`Step ${i + 1}`}
            />
            <span className={checked[i] ? "text-muted line-through" : ""}>
              <span className="text-muted mr-1.5">{i + 1}.</span>
              {s}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
