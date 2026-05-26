# Alfa Romeo Giulia GT 1300 Junior — modern wiring harness

A reliability-refresh wiring harness for the Series 2 (model **10530**), based on the
factory diagram in owners manual #1490 (11/69) — and an interactive reference site to
build it from.

The whole thing is generated from **one verified data model** in
[`src/data/harness/`](src/data/harness/). Change the model and the web app, the WireViz
diagram, the BOM and the build sheets all follow.

## What this is

- **Modernised, relay-heavy harness** — every meaningful load is relay-driven so the tired
  vintage switches carry only coil current. Alternator charging (the dynamo + external
  regulator are gone). Modern blade-fuse / relay centres in the engine bay.
- **One wire colour + Dymo heat-shrink labels** — every wire has a short coded label
  (`HORN.TRG`, `HL.LO.OUT.L`, `TEMP.SIG`…) printed at both ends. DIN 72552 terminal
  designations throughout (period-correct — the factory diagram already uses them).
- **Built around the parts already bought** — the Littelfuse PDM + three Bussmann RTMR
  fuse/relay centres, 11 Song Chuan relays, and the Aptiv/Delphi Metri-Pack 280 connector
  ecosystem (see the two Mouser orders in [`reference/`](reference/)).

## The site

```bash
npm install
npm run dev        # http://localhost:3000
```

Pages: **Overview**, **Explorer** (interactive graph, show/hide sections), **Wire schedule**,
**Fuses & relays**, **Lengths** (cut-bands + consolidated gauge totals), **BOM** (owned vs
to-buy), **Compliance** (EU/Norway veteran-vehicle notes), **Build sheets** (printable).

## Verify the design

The intended electrical behaviour is encoded as **user-story specs** and checked against a
pure propagation engine:

```bash
npm test
```

23 behaviour specs — key-gated headlights, key-off position lamps & hazards, relay-driven
turns with diode isolation, wiper speeds + self-park, fuel-pump safety cut-off, and
fuse-vs-wire ampacity. See [`src/data/harness/scenarios.ts`](src/data/harness/scenarios.ts).

## Harness diagram + BOM (WireViz)

```bash
npm run wireviz    # writes harness/bulkheads.{svg,png,html,bom.tsv}
```

Connector-breakout sheets for the dashboard-disconnect plugs. Requires Graphviz +
WireViz (`brew install graphviz`; `pip install wireviz` in `.venv`).

## Layout

```
src/data/harness/   the model (types, components, relays, fuses, wires, diodes, …)
                    + engine.ts (propagation) + scenarios.ts (specs)
src/app/            the Next.js reference site
scripts/            WireViz generator
harness/            generated WireViz output
reference/          factory diagram + Mouser orders (source material)
docs/               design notes
```

See [`docs/design-notes.md`](docs/design-notes.md) for the engineering decisions and the
open items.
