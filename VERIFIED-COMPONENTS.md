# Verified components — sweep 2026-05-28

Result of the online verification pass requested in task #25. For each
system we list: what the **factory** behaviour actually is (from forum +
manufacturer sources), what **our model** assumes, and the **status**
(match / minor gap / real gap).

The deep dive lives here; PHYSICAL-TODO.md carries a short summary table
and links back. When something needs a model change, the action lives at
the end of that section.

---

## Findings summary

| System | Match | Notes |
|---|---|---|
| Ignition switch | ✅ match | DIN 30/15/50; terminal 16 (ballast bypass) N/A since we have no ballast |
| Charging (alternator + warning lamp) | ✅ match | B+/D+/case-gnd modelled; w-wl-charge jumper present for self-excitation |
| Coil + ballast resistor | ⚠ **GAP — conditional** | No ballast in model. OK for modern coil; problem if original Marelli coil kept with Nord engine. Decision needed: see action items. |
| Starter (Bosch solenoid) | ✅ match | rly-starter SPDT → solenoid S terminal; R terminal correctly omitted (not used on Alfa) |
| Brake light switch | ⚠ **GAP — safety redundancy** | Factory has TWO hydraulic pressure switches in parallel on master cylinder (safety: one circuit fails, other still triggers brakes). Our model has one sw-brake. |
| Brake-failure warning lamp | ⚠ minor gap | Period car has a separate brake-failure warning lamp from the pressure differential switch on the master cylinder. We don't model it. |
| Reverse light switch | ✅ match | 2-wire switched +12V in gearbox bellhousing |
| Senders (fuel / oil / temp) | ✅ match | Topology correct (resistive single-wire to gauges). Resistance curves are post-build calibration, not modelled in boolean propagation. |
| Hazard switch | ✅ functional, minor cosmetic gap | Routes constant +12V to both turn relay coils with hazard-iso diodes. Period switch has built-in flashing warning lamp in the button; we rely on the green turn tell-tale (wl-turn) for visual feedback instead. Functionally equivalent. |
| H4 bulb both-filaments | ✅ match | Forum confirms it's NORMAL for H4 bulbs to flash high while low is lit by design. Our `flash-while-low` scenario is correct. |

**Action items:**
1. **Decide on ballast resistor** — modern 3 Ω coil (no ballast, drop terminal 16) vs original 1.5 Ω + ballast (need terminal 16 wire from ignition START to coil + side, bypassing the ballast during cranking). See *Coil + ballast* section below.
2. **Add brake-switch redundancy** — model the second pressure switch (parallel to existing sw-brake) so the FMEA-style fault matrix catches single-switch failures correctly. Real-world safety item, period-correct, and small model addition.
3. **Optionally add brake-failure warning lamp** — small, period-correct addition; uses the existing wl- pattern.

---

## 1. Ignition switch — ✅ match

### Factory configuration

DIN 72552 terminals on the 105-series ignition switch (from AlfaBB consensus
across multiple threads):

| Terminal | Function |
|---|---|
| 30 | Constant +12 V input from battery |
| 15 (sometimes labelled 15/54) | Switched output — feeds fusebox, ignition coil, etc. (the "RUN" output) |
| 50 | Start output — feeds the starter solenoid S terminal (energised only during cranking) |
| 16 | Ballast resistor bypass — provides full battery voltage to coil + during START position, bypassing the ballast (so the coil doesn't get a depressed voltage during cranking when battery is sagging) |
| INT | Seat-belt interlock terminals (always-hot, bridged to 30 internally). Used on US-market cars with seat-belt interlock systems. |

> *"For 1969 and later 105 series models, the pin outs are: 30 - unswitched
> hot input, 50 - to starter, 15/54 - switched output (to fusebox, ignition
> coil, etc.)"*
> *— AlfaBB ignition switch wiring threads*

> *"Terminal #16 and the green wire is the ballast resistor bypass circuit,
> which provides for battery voltage to the ignition coil positive during
> starting."*

### Our model

`ign-switch` has terminals 30 / 15 / 50; positions Off / Run / Start.
Terminal 16 is **not** present.

### Status

✅ Match given our setup. Terminal 16 is unnecessary because:
- For the current Nord engine, we model a modern coil (no ballast resistor)
- If we keep the original Marelli coil with ballast, we'd need to add terminal 16 — see Coil section

### Sources
- [AlfaBB — Ignition Switch Wiring](https://www.alfabb.com/threads/ignition-switch-wiring.207918/)
- [AlfaBB — Which wires go to this ignition switch terminals](https://www.alfabb.com/threads/which-wires-go-to-this-ignition-switch-terminals-pic.157748/)
- [AlfaBB — Ignition switch pin out for GTV](https://www.alfabb.com/threads/ignition-switch-pin-out-for-gtv.31143/)

---

## 2. Charging system — ✅ match

### Factory configuration

Original 105 had a dynamo + external regulator; almost all surviving cars
have been converted to a Bosch alternator (internal or external regulator).
Standard terminals:

| Terminal | Function |
|---|---|
| B+ | Battery charge output (heavy cable) |
| D+ | Charge warning lamp AND field excitation feedback |
| DF | Field excitation (regulator → alternator field) — on external-regulator setups only; absent on internally-regulated alternators |
| 31 / case | Ground via alternator case to engine block |

**Warning-lamp self-excitation pattern** (critical for alternator startup):

> *"The light gets +12V from the Ignition switch live. The light also gets
> +12V from the alternator on D+! When the alternator is not producing 12V
> on D+ (not spinning), +12V from Ignition flows thru the lamp and lights
> it. When the alternator begins to produce 12V, the lamp has +12V on both
> sides. The net voltage is zero and the light goes out."*
>
> *"Normally, the alternator won't produce any output unless it gets a
> small current from the dash light."* — AlfaBB charging threads

This is the well-known "must have charge lamp wired for alternator to
self-excite" gotcha. Our model already handles it via `w-wl-charge`.

### Our model

`alternator` has terminals B+ / D+ / case-ground. Internally regulated
(matches modern replacement). `w-alt-d` routes D+ through EM1 + BH1 to
`wl-charge.d`. `w-wl-charge` is the jumper from `wl-oil.+` to `wl-charge.+`
so the charge lamp has a +12 V feed (without this, the alternator can't
self-excite).

### Status

✅ Match. The asymmetric "lamp feed from one side, alternator from the
other" pattern is correctly modelled.

### Sources
- [AlfaBB — Duetto Bosch Generator to Alternator conversion](https://www.alfabb.com/threads/duetto-bosch-generator-to-alternator-conversion-wiring-question.736785/)
- [AlfaBB — Alternator D+, B+, + Only](https://www.alfabb.com/threads/alternator-d-b-only.17678/)
- [AlfaBB — Bosch Voltage Regulator and Wiring](https://www.alfabb.com/threads/bosch-voltage-regulator-and-wiring.726371/)

---

## 3. Coil + ballast resistor — ⚠ **CONDITIONAL GAP**

### Factory configuration

Original Marelli coil on the Nord engine has a **1.5 Ω primary winding**,
designed to run on ~6 V via a **1.5 Ω external ballast resistor** wired in
series. The ignition switch terminal 16 (ballast bypass) feeds full 12 V
during START, compensating for the cranking-voltage sag.

> *"The ballast resistor extends the life of mechanical points; it's wired
> so the coil gets full 12V from the ignition switch in START position,
> then the 12V is reduced by the ballast resistor to give the coil about
> 6V in RUN to reduce the current being switched by the distributor
> points."*
>
> *"The standard Marelli coil is about 1.5 ohms with a 1.5 ohm ballast."*
> — AlfaBB ballast-resistor threads

**Tach feed**: white wire(s) on coil negative terminal (DIN 1) carry the
ignition pulse signal to the tachometer.

### Our model

Single `coil` component with terminals 15 (+ feed) and 1 (− to distributor
/ tach). Fed by `f-ign-1` via `w-coil-15` (medium gauge, sized for K6+
future). **No ballast resistor modelled. No terminal-16 bypass wire from
ignition START.**

### Status

⚠ This is a conditional gap that depends on the coil choice:

| Coil choice | Ballast needed? | Model change required? |
|---|---|---|
| Original Marelli 1.5 Ω + ballast | YES — both ballast in series AND terminal-16 bypass | YES — add ballast component + bypass wire |
| Modern 3 Ω+ coil (no ballast) | NO | NO — current model is correct |
| Alfaholics K6+ ECU (future swap) | NO — kit handles coil drive internally | NO — already designed-in |

The current model implicitly assumes a modern coil. If you keep the
original Marelli for period-correctness, you need the ballast + bypass.

### Action items

1. **Decide on coil**: modern 3 Ω (clean / no ballast) vs original Marelli
   (period-correct + ballast). Recommend modern unless period-correct
   trumps simplicity.
2. **If keeping original Marelli**: add `ballast-resistor` component
   (1.5 Ω, in series between f-ign-1 and coil.15), add `w-coil-bypass-50`
   wire from ign-switch.16 (new terminal) → coil.15 (Schottky-isolated to
   prevent back-feed of ballast leg during RUN).
3. **Tach feed**: confirm we have the tach signal wire from coil.1 to
   tachometer. (Already in model — checked in tach circuit.)

### Sources
- [AlfaBB — Removing ignition coil ballast resistor](https://www.alfabb.com/threads/removing-ignition-coil-ballast-resistor-wiring-question.469513/)
- [AlfaBB — External Ballast Resistor on Coil](https://www.alfabb.com/threads/external-ballast-resistor-on-coil.181139/)
- [AlfaBB — Ignition bypass of ballast](https://www.alfabb.com/threads/ignition-bypass-of-ballast.201646/)

---

## 4. Starter (Bosch solenoid) — ✅ match

### Factory configuration

Bosch 2-wire solenoid:

| Terminal | Function |
|---|---|
| 30 (big stud) | Direct battery feed (heavy cable) |
| S (or 50) (small spade) | Trigger input — energises solenoid coil; from ignition switch via starter relay |
| R | Ballast-resistor bypass output — energised during cranking; **NOT USED on Alfa Romeo** |
| Mounting case | Ground via bell-housing bolts |

> *"The S terminal is the input and energizes the solenoid - this is the
> terminal where the wire from the ignition switch goes to. The R terminal
> is an output that's energized only when the starter is engaged, part of
> the ballast resistor bypass circuit that is not used on Alfa vehicles."*
> — AlfaBB starter threads

### Our model

`rly-starter` (SPDT, mounted in rtmr-const, coil triggered by ign-start
position) closes battery → starter solenoid S terminal (`w-starter-out`
via EM1 boundary connector). Starter big terminal 30 is fed direct from
battery via heavy chassis cable (we model the trigger leg only; the
battery → starter +30 cable is outside our harness scope by convention,
since it's a single heavy cable on its own).

### Status

✅ Match. R terminal correctly omitted (not used on Alfa).

### Sources
- [AlfaBB — Starter Solenoid Wiring Question](https://www.alfabb.com/threads/starter-solenoid-wiring-question.206933/)
- [AlfaBB — Adding a starter relay](https://www.alfabb.com/threads/adding-a-starter-relay.36264/)

---

## 5. Brake light switch — ⚠ **REAL GAP**

### Factory configuration

The 105 has **TWO hydraulic pressure switches wired in parallel** on the
master cylinder (one per brake circuit — front + rear, after the split-
circuit master cylinder became mandatory). Plus a separate brake-failure
warning switch (the pressure differential switch).

> *"There is a pressure switch/junction cluster that connects to the
> hydraulic lines on the firewall on the driver side, with one sender on
> top being the brake warning light (black & green wire) and the other two
> senders mounted on the sides for the rear brake lights (white or blue
> wires)."*
>
> *"The reason there are two switches (wired in parallel) is that in the
> event of a hydraulic failure in either of the two brake circuits, the
> brake lights will be activated by the good hydraulic circuit."*
> — AlfaBB brake-light-switch threads

So the architecture is:

```
constant feed (f-con-3) → ┬── pressure switch FRONT-circuit ──┬── brake lamps
                          │                                    │
                          └── pressure switch REAR-circuit ────┘ (parallel)
```

Either switch closing lights both brake lamps. Redundancy: if one circuit
fails hydraulically, the other still triggers the lights.

### Our model

Single `sw-brake` on constant feed (`w-brake-in` from f-con-3) →
`w-brake-L` to brake lamps. No redundancy.

### Status

⚠ Real gap. The single-switch simplification is electrically correct in
the normal case (both switches in parallel act as one) but loses the
safety-critical redundancy: in our model, if `sw-brake` fails open, brake
lights die. In reality, the second switch would still trigger them.

### Action items

1. **Add `sw-brake-2`** as a second switch in parallel with `sw-brake` —
   same input (f-con-3) and same output (lamp feed)
2. **Update wiring**: `w-brake-in` already lands at f-con-3; jumper from
   sw-brake input to sw-brake-2 input (short shared feed); jumper from
   sw-brake output to sw-brake-2 output
3. **Add scenarios**:
   - one switch failed → brakes still work (redundancy validated)
   - both switches failed → brakes dark (failure mode bounded)
4. **Add brake-failure warning lamp** (optional, separate gap below)

### Sources
- [AlfaBB — Brake pressure switch location](https://www.alfabb.com/threads/brake-pressure-switch-location.700516/)
- [AlfaBB — Brake Light switch change](https://www.alfabb.com/threads/brake-light-switch-change.712694/)
- [AlfaBB — Brake Pressure warning light](https://www.alfabb.com/threads/brake-pressure-warning-light.732845/)

---

## 6. Brake-failure warning lamp — ⚠ minor gap

### Factory configuration

Separate warning lamp triggered by the **pressure differential switch**
on the master cylinder. When the two brake circuits have unequal
pressure (one has failed), the differential piston moves and closes the
switch, lighting the brake-failure warning lamp on the dash.

Wired with a black/green wire per the search results above.

### Our model

Not modelled. We have warning lamps (`wl-oil`, `wl-charge`, `wl-turn`,
`wl-main` for high beam) but no `wl-brake`.

### Status

⚠ Minor gap. Period-correct + safety-relevant feature missing. Cheap to
add (one switch + one lamp + a feed wire).

### Action items

1. Add `wl-brake` component (dash, red lens, switched by differential
   pressure switch grounding the lamp)
2. Add `sw-brake-diff` component (differential pressure switch on master
   cylinder)
3. Add feed (from gauges fuse f-ign-2, like the other warning lamps) and
   ground-trigger wire from the diff switch

---

## 7. Reverse light switch — ✅ match

### Factory configuration

2-wire mechanical switch in the gearbox bellhousing (or pre-1974, on the
shifter shaft sticking out). Switched +12 V — one wire from ignition
fuse, one wire to reverse lamp.

> *"Two wires come from the bellhousing, going through a clamp on the
> gearbox, with two spade connectors. … One wire typically carries power
> from the ignition (the yellow/black wire), while the other wire (white)
> serves as the ground/return path to complete the circuit through the
> reverse lights."*
> — AlfaBB reverse-switch threads

### Our model

`sw-reverse` with `in` (from f-ign-7) and `out` (to reverse lamp). Matches.

### Status

✅ Match.

### Sources
- [AlfaBB — 105 transmission reverse switch fit](https://www.alfabb.com/threads/105-transmission-reverse-switch-fit.740432/)

---

## 8. Senders (fuel / oil / temp) — ✅ topology match

### Factory configuration

Single-wire resistive senders, gauge provides reference voltage and reads
the resistance back. Approximate curves:

| Sender | Curve |
|---|---|
| Fuel | 0 Ω empty → 90 Ω full |
| Oil pressure (gauge) | 10 Ω (0 psi) → 90 Ω (110 psi) |
| Water temperature | 820 Ω @ 100°F → 220 Ω @ 170°F → 80 Ω @ 250°F (NTC) |
| Oil temperature | 300 Ω @ 90°F → 100 Ω @ 190°F → 30 Ω @ 260°F (NTC) |

> *"The fuel gauge works on 0 ohms empty and 90 ohms full."*
> *"The oil pressure gauge goes from 0-110psi and requires 10-90 ohms."*
> *"The water temp gauge readings are 100°F at 820 ohms, 170°F at 220
> ohms, and 250°F at 80 ohms."*
> — AlfaBB sender threads

### Our model

`snd-fuel`, `snd-oil`, `snd-temp` components with resistive single-wire
behaviour. Boolean propagation only cares that the sender is reachable
from +12 V (via the gauge) and from ground (via case-grounding into the
block / tank flange). Values aren't modelled — that's calibration, not
architecture.

### Status

✅ Topology match. Replacement-sender ohm ranges are useful when ordering
parts (avoid wide-curve aftermarket senders meant for other cars).

### Sources
- [AlfaBB — Oil pressure sender for early Veglia GT](https://www.alfabb.com/threads/oil-pressure-sender-for-early-veglia-gt.146001/)
- [AlfaBB — Resistance range for fuel level sender](https://www.alfabb.com/threads/resistance-range-for-fuel-level-sender.197644/)
- [AlfaBB — Oil and water temperature gauges](https://www.alfabb.com/threads/oil-and-water-temperature-gauges.135539/)

---

## 9. Hazard switch — ✅ functional match, minor cosmetic gap

### Factory configuration

Round push-button switch with an internal warning lamp that flashes when
hazards are active (visual feedback that the button is engaged).

> *"The hazard switch connects the flasher to both the left side AND the
> right side turn signal lights at the same time."*
>
> *"The ground wire on terminal #31 is so the light in the switch will
> flash when triggered, and this wire has nothing to do with whether or
> not the hazards will flash."*
> — AlfaBB hazard-switch threads

So the period button has 3 functional connections plus an internal lamp
(+12 in, both turn outputs, ground for the internal lamp).

### Our model

`sw-hazard` routes constant +12 V (from `f-con-1`) to both turn relay
coils when "On". Diodes `d-haz-L` / `d-haz-R` prevent back-feed to the
turn switch. We rely on the existing `wl-turn` (green tell-tale) for
visual feedback — which flashes when hazards are on because both turn
relays energise.

### Status

✅ Functionally equivalent. The period button's internal lamp is
duplicated by our dash tell-tale. If we wanted a separate dedicated
hazard tell-tale (red triangle, modern convention), we could add one,
but it's not a functional need.

### Sources
- [AlfaBB — Hazard switch wiring](https://www.alfabb.com/threads/hazard-switch-wiring.178048/)
- [AlfaBB — Turn signal hazard light switch conundrum](https://www.alfabb.com/threads/turn-signal-hazard-light-switch-conundrum.650690/)

---

## 10. H4 bulb behaviour — ✅ informational

### Factory / industry standard (from AlfaBB H4 thread, 2026-05-28)

> *"It's normal for an H4 bulb to flash the main beam while the low beam
> is lit, they are designed to do this. They aren't designed for running
> both filaments continuously."*

Three documented failure modes:
1. **Envelope failure** — halogen escapes, bulb fogs (rare, usually
   physical/thermal damage)
2. **Filament failure** — single filament burns out, the other usually
   keeps working
3. **(cheap bulbs only)** earth-connection failure during install — both
   filaments + envelope intact, bulb dead anyway

Quality recommendation: **Philips or Osram** — consistent beam pattern,
higher output for same wattage, longer life than budget bulbs.

### Our model

Our `flash-while-low` scenario asserts both filaments lit simultaneously
when the column flash stalk is held with the dash switch at LOW. This is
the only "both-on" path in our model and matches the documented H4
design behaviour (momentary use OK; continuous use degrades the bulb).

### Status

✅ Match. No model change. Adding a note to the bulb selection guidance
(somewhere — parts.ts comment or compliance.ts).

### Sources
- AlfaBB thread responding to flash-LOW vs flash-HIGH question — same
  thread that surfaced the period-correct flash-LOW finding (see
  PHYSICAL-TODO.md "Column stalk push-in" entry)

---

## How to use this document

When making model changes, update both this file (add a new status entry
at the bottom of the relevant section with date + change) and the
summary table at the top. Don't delete prior content — strike it
through `~~like this~~` so the verification trail is preserved.

When sourcing a part, check the relevant section here for the part-spec
expectations (resistance curves, terminal pinout, original part numbers)
before ordering.
