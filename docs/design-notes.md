# Design notes — modern harness for the Giulia GT 1300 Junior (10530)

Engineering decisions behind the model. Everything here is reflected in
[`src/data/harness/`](../src/data/harness/) and verified by `npm test`.

## Goals

- **Reliability refresh**, not a rewire-to-EFI. Keep the car's character; fix the weak points.
- **Relay-heavy** — the old switches and connectors are tired, so they switch only relay
  coils (≈0.15 A); relays carry the loads.
- **One wire colour + Dymo heat-shrink labels.** The label is the identity. DIN 72552
  terminal numbers throughout (15/30/31/50/53/54/56/58/61/85/86/87…).
- **Build around the parts already bought** (the two Mouser orders).

## Power architecture (all in the engine bay)

| Unit | Owned | Role |
|---|---|---|
| Littelfuse HWB18 **PDM** (9-ckt, 100 A, IP69K) | 1 | Headlight power centre — holds the low/high beam relays + beam fuses |
| Bussmann RTMR **15306-2-2-4** (bussed) | 2 | One **ignition** bus (fed by the ignition main relay), one **constant** battery bus |

The non-bussed Bussmann RTMR (**15305-4-0-4**) is owned but **not used** in this harness — kept on the shelf as a spare / for a future independent-feed circuit.

Everything — PDM, RTMRs, inter-harness plugs — uses **Aptiv/Delphi Metri-Pack 280**
terminals, so one crimp system covers the whole car.

## Bulkhead connectors — sizes & the 12-way rule

The owned bulkhead plugs are **GT 280 12-way** (Aptiv/Delphi `15326915` male / `15326910` female), part of the **Metri-Pack 280** sealed family.

**GT 280 sealed cavity counts:** **2, 3, 6, 8, 10, 12, 14, 16** ways. Useful part numbers — 8-way `15326655` (M), **10-way `15326661` (M) / `15326660` (F)**, owned 12-way `15326915` (M) / `15326910` (F). (The wider Metri-Pack 280 family adds 1/4/5/7-way and a 30-way "480" junction block.)

**Rule: 12 cavities max per connector — a deliberate ergonomics cap, NOT a product limit** (GT 280 goes to 16). Past ~12 the housing gets hard to seat/unplug by hand and stresses the latch, defeating a quick dash-disconnect. So a bulkhead needing >12 wires is **split into two 12-ways**, never grown into one giant connector. (BH1 at 17 pins = two 12-ways; everything else is one plug ≤12.) The model auto-splits at 12.

**Connector choice per bulkhead:**

| Bulkhead | Pins | Connector |
|---|---|---|
| BH1 dash power | 17 | **two 10-way** (10 + 7) — `15326661`/`15326660` |
| BH2 dash lighting | 12 | one 12-way (owned `15326915`/`15326910`) |
| BH3 rear | 7 | 8-way |
| BH4 front | 7 | 8-way |
| SW3 switch cluster | 7 | 8-way |

BH1 uses **two 10-ways** rather than two 12-ways — right-sized (a little spare each) and avoids the awkward >12 housing. A 10-way is also the fallback for any future bulkhead that grows past 8.

**Gap sizes — there is NO GT 280 5, 7, 9 or 11-way.** The ladder is 2/3/6/8/10/12/14/16. So a 9-pin need → 10-way; a 5-pin need → 6-way with a cavity blanked, or a Metri-Pack 280 5-way (same terminals, different housing).

**Device-side: the two main gauges.** The speedometer and tachometer carry vintage **5-pin** connectors; replacing them keeps the car on one terminal system. Use a **GT 280 6-way (1 cavity blanked)** — male `15326640` + matching female — to stay in-family, or a Metri-Pack 280 5-way for an exact fit. Either reuses the owned MP280 terminals/seals.

**Wire-gauge fit:** Metri-Pack 280 terminals take ~**22–10 AWG (≈0.35–6 mm²)** and are rated ~25–30 A — comfortably covering every wire that goes *through* a connector here (signal/low/medium, 0.75–2.5 mm²). The heavy runs (6 mm² feeds, 16–25 mm² battery/starter/ground) **never go through a connector** — they're ring terminals on studs — so the 280's gauge ceiling is never the limit.

**Should we switch connector type?** Investigated **Deutsch DT** (the usual DIY alternative): easier hand-assembly (cheap open-barrel crimper, forgiving solid pins, wedge lock) but a *narrower* gauge range (~12–20 AWG), lower current (~13 A), and it also tops out around 12-way. **Verdict: stay on GT 280 / Metri-Pack 280.** The connectors, terminals, seals and crimp tool are already owned, the gauge range fits everything crossing a plug with margin, it's sealed (IP-rated), and keeping one terminal system across the whole car is itself the biggest ease-of-install win. Deutsch DT would only make sense if starting tooling from scratch. The low-current **SW3 switch cluster** (8-way) could use a smaller/cheaper sealed connector, but an 8-way Metri-Pack keeps the single-crimp-system advantage.

## Relays (6 SPST + 5 SPDT = exactly the 11 owned)

- **SPST:** low beam, high beam, horn, heater fan, fuel pump, **ignition main** (offloads
  the worn ignition switch — it triggers the relay, which feeds the whole ignition bus).
- **SPDT:** turn-L, turn-R, wiper-LOW (+self-park via NC), wiper-HIGH, + 1 spare.
- The dedicated **headlight-enable relay was dropped** — instead the beam-relay *coils* are
  gated by ignition position I through the headlight switch, which freed the two SPDTs the
  wipers needed. Net result: still exactly 11 relays.

## Key behaviours (each is a spec in `scenarios.ts`)

- **Headlights need the key.** Beam relays only fire at ignition position I+. **Position
  lamps and hazards stay on the constant bus** so marker lights and 4-ways work key-off.
- **Turn signals are relayed.** The weak column switch selects a coil (ignition-fed);
  an electronic flasher feeds the relay *commons* (so it flashes); constant-fed so hazards
  flash key-off.
- **Wipers** — 2-speed Bosch self-parking motor (53/53b/53a/31). LOW & HIGH relays carry
  the motor; the vintage switch carries only coil current; self-park via the LOW relay's NC
  contact.
- **Heater fan** — relay for full speed; LOW position drives a PWM/resistor module's
  low-current *enable*. The switch never carries motor current.
- **Fuel pump** — relay, ignition-fed, **through an inertia/oil-pressure cut-off** so it
  can't run with the engine stopped (fire safety).

## Diodes (kept on signal wires only)

- `d-haz-L/R` — isolate the hazard feed into each turn-relay coil from the column switch.
- `d-tell-L/R` — OR the single green tell-tale from both turn outputs without joining sides.
- `d-coil-fuel`, `d-coil-ignmain` — relay-coil flyback suppression (parallel, not in-series).

All ≤0.2 A — small signal diodes, never in a load path.

## Wire gauge — ideal vs consolidated

Each wire has an *ideal* gauge, but to avoid buying a dozen sizes they map to **five
purchase tiers**: `S` 0.75 (signals & light loads) · `M` 1.5 (general power) · `L` 2.5
(headlights/heavy) · `F` 6 (bus & charge feeds) · `B` 25 (battery & starter). See the
Lengths page for totals.

## Lengths

Deduced from each wire's zone route (battery → engine → dash → cabin → rear) using the
distances in [`zones.ts`](../src/data/harness/zones.ts) — **edit those with a tape measure
on the car** to make them exact. Wires are grouped into cut-length bands so you can cut in
batches.

## Open items / findings

- **Connectors: 5 pairs needed, 3 owned.** The dash/bulkhead crossings split into five
  12-way GT 280 plugs (BH1 ×2, BH2 ×2, BH3 ×1). Buy 2 more pairs, or step up to a larger
  bulkhead connector for the dash. Surfaced on the BOM page and in `validateModel()`.
- **Spare SPDT** is unassigned — suggested for a starter interlock.
- **O2 / AFR gauge** is provisioned (ignition-fed, fused, capped pigtail) but not connected.
- **Heater-fan low speed** (PWM/resistor) is optional and marked future.

## Still to build (see the task list)

- Interactive **power-state simulator** in the Explorer (reuses `engine.ts`).
- **Playwright** UI E2E once the simulator exists.
- **Editable measured lengths** — enter one length per cut-band/route group and have the
  per-gauge totals recompute.

## Compliance

A 1969 car (>50 yrs) is exempt from periodic EU-kontroll as a *bevaringsverdig veteranbil*,
but must stay roadworthy and keep the lighting/signalling required at first registration.
See the Compliance page — advisory only; verify with Statens vegvesen.
