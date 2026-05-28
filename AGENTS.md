<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Harness build sheets must track the model

The harness is a single TypeScript model in `src/data/harness/` (wires, components, relays, fuses, connectors, grounds). It is split into **detachable modules** in `src/data/harness/modules.ts`, each with its own build sheet (parts + steps), and every model node belongs to **exactly one** module.

**Rule: whenever you change the harness model, revise the build sheet of the AFFECTED module(s) in the same change — not the whole set.**

- **Pinpoint the affected module(s)** from what you touched, don't revise everything:
  - changed/added a **component** → `moduleOf(id)` gives its module.
  - changed/added a **wire** → `modulesForWire(wire)`; a wire that crosses a bulkhead (`via`) touches **two** modules' sheets (e.g. a BH4 wire = `main-loom` + `front-clip`).
- **Adding a new component is gated:** the `detachable-module coverage` test in `harness.test.ts` fails until the new node is assigned to a module in `modules.ts`. That failure is the reminder to write/revise that module's sheet.
- Keep the rest consistent in the same pass: the per-circuit sheets, `factory.ts` (architecture reference — keep it truthful so there's no confusion when building), and any module `interfaces`/`ground` notes the change affects.
- Always run QA before pushing: `npx tsc --noEmit && npm test && npm run build`. The build sheets are only useful if they match the wiring — a stale sheet is a defect, not a cosmetic lag.

# Physical TODO — track verifications that need the car in hand

Anything that can't be settled from code or factory diagrams goes in `PHYSICAL-TODO.md` at the project root. Items there are written so a future session knows what the model currently ASSUMES and how to confirm it (switch contact tests with a multimeter, wire-route tape measurements, bulb/connector identification, mounting fit-up). When something flagged there gets verified, record the date + finding inline rather than deleting — preserve the history. Add new items as you discover open questions during model work; don't bury them in scattered code comments.

# Future engine swap — architecture in ARCHITECTURE.md

The plug-in design for a future Alfa 155 Twin Spark engine swap (with the Alfaholics 3D Mapped Ignition Kit / Emerald K6+) is documented in `ARCHITECTURE.md`. Conceptual + physical/electrical only; implementation deferred. Read it before making engine-bay model changes so they stay forward-compatible with the EM1 connector boundary design.
