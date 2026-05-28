# Physical TODO — things to verify with the car / loom in hand

Items that can't be resolved in code — they need physical access to the car, the
loom, the actual switch in your hand, a multimeter, a tape measure. Each item
flags what we're assuming in the model today, so when you check, you know what
"matches" vs "needs a model update."

When you verify something, leave the result inline (date + finding) so the next
session has the trail. Don't delete items — strike them through `~~like this~~`
so the history is preserved.

---

## Verified components — online sweep 2026-05-28

Comprehensive online verification of original 105/115 component behaviour
vs our model. Deep dive with sources lives in `VERIFIED-COMPONENTS.md`;
this is the summary.

| System | Status | Notes |
|---|---|---|
| Ignition switch | ✅ match | DIN 30/15/50; terminal 16 (ballast bypass) N/A — no ballast |
| Charging system | ✅ match | B+/D+/case-gnd; w-wl-charge handles self-excitation correctly |
| Coil + ballast | ⚠ **DECISION NEEDED** | Modern coil = current model OK. Original Marelli = need to add ballast + ign-switch terminal 16 bypass |
| Starter | ✅ match | rly-starter SPDT → solenoid S; R terminal correctly omitted |
| Brake light switch | ⚠ **REAL GAP** | Factory has TWO parallel hydraulic pressure switches; we have one. Safety redundancy missing. |
| Brake-failure warning lamp | ⚠ minor gap | Separate diff-pressure warning lamp not modelled |
| Reverse light switch | ✅ match | 2-wire switched +12 V in gearbox |
| Senders (fuel/oil/temp) | ✅ topology match | Resistance curves documented for part sourcing |
| Hazard switch | ✅ functional | Period switch has internal flashing lamp; we use the green turn tell-tale instead |
| H4 bulbs both filaments | ✅ match | Confirmed normal-by-design (momentary); recommend Philips/Osram |

**Open decisions:**
1. **Coil**: stick with modern 3 Ω (current model) or restore original Marelli 1.5 Ω + ballast?
2. **Brake redundancy**: add second parallel `sw-brake-2` for FMEA-correct fault tolerance?
3. **Brake-failure warning lamp**: add `wl-brake` driven by master-cylinder diff switch?

See `VERIFIED-COMPONENTS.md` for the full rationale + source quotes + AlfaBB
thread links.

---

---

## Headlight switching — RESOLVED via AlfaBB 2026-05-28

### `[x]` Headlight switch — does LOW + HIGH simultaneous output exist?
**RESOLVED 2026-05-28 via AlfaBB forum thread** — three independent
responders converged on the same answer: on the 2-headlight Junior switch,
**LOW and HIGH are mutually exclusive at the contacts**. The 4-headlight
GTV variant has overlapping contacts (its design intent: keep outers on
when high is selected so all 4 lamps light), but that's a different switch
part. The 2-headlight Junior switch never produces both outputs hot
simultaneously from the dash. The ONLY path to both H4 filaments lighting
on this car is the column flash stalk (sw-flash) held while the dash is at
LOW — by design + matches every car with flash-to-pass.

**Action taken**: collapsed `sw-headlight` from the 6 compound positions
(interpretation 1) to 4 mutually-exclusive positions (Off / Park / Low /
High). Dropped the `low-plus-high-run` and `park-plus-high-key-off`
scenarios; added `flash-while-low` to assert the only legitimate both-on
path. Removed the "both-on wear" UX concern. No interlock relay needed.

**Sources**: AlfaBB responders BaselJ (1300 Junior 2-headlight S1),
quadrifolio (general 2- vs 4-headlight switch knowledge), Neil Martin
(Spider experience). Thread reference recorded in task #17 closure.

### `[ ]` Headlight switch — rotary + lever position count (final detail)
**Status partially resolved by the above** — forum responses are consistent
with the simpler 4-position model (Off / Park / Low / High, mutually
exclusive). Physical confirmation of exact knob/lever geometry still
useful when you're with the car but no longer blocks the design.

**How to check:** rotate the knob + flip the lever through every
combination. Probe the 4 output pins. Confirm the contact map matches
what's now in `sw-headlight.positions`.

### `[ ]` Headlight switch — does the knob have a "press in" flash function?
**Why:** the Owner's Manual mentions "press on the knob" as a separate
action. We've put flash-to-pass on the column lever (`sw-flash`) — if your
dash knob also has a press-in flash, we'd want to know (though it doesn't
fundamentally change the architecture — same end behaviour as the column
stalk).

**How to check:** with knob at OFF or PARK, try pressing the knob inward
and see if the HIGH output pin energises momentarily.

### `[ ]` Headlight switch — count actual wires + their colours
**Why:** confirms the 4-wire architecture. Cross-references which output
terminal carries which colour in the factory loom (informs the wire colour
assignments in `wires.ts`).

**How to check:** count wires at the switch connector; note each colour
and which switch terminal it leaves.

### `[x]` Column stalk push-in — flash LOW or HIGH? RESOLVED via AlfaBB 2026-05-28
**Factory finding:** on **all 105/115 cars (Giulia GT, GTV, Spider, Junior,
including the 2-headlight Step nose)**, pushing the column stalk IN flashes
**LOW beams**, not high. Confirmed by:
- '67 Step nose owner direct report (push stalk → low beams flash; with
  high beams already on, push stalk also flashes low filaments → both
  filaments lit simultaneously, dimmer due to shared bulb load)
- Multiple AlfaBB threads cross-referenced via search summary: *"On all
  105/115 cars, the flash-to-pass function is on the low-beam circuit"*

**Model state (2026-05-28):** we deliberately flash **HIGH** (deviation
from factory). Rationale — period-correct isn't a project priority, and
flash-HIGH is the technically leaner + more functional choice on our
modernized harness:
- HIGH-beam relay common is constant from PDM main → flash-to-pass works
  key-off out of the box
- LOW-beam relay is ign-gated (our asymmetric design) → flash-LOW would
  cost either key-off capability (B1) or the auto-off-key-out benefit (B2)
- HIGH is more visible as a daylight warning (kjørelys-mandate context)
- Modern driver expectation matches (every car since ~1980 flashes high)

**No further action needed.** Note left for the trail because someone
reading the AlfaBB threads later will otherwise assume our flash-HIGH is a
bug. See `components.ts` sw-flash for the in-code note.

---

## Wiper motor — choose 4-wire over 3-wire

### `[ ]` Confirm wiper motor topology before sourcing
**Why:** harness wired for the **full 4-wire Bosch DIN-72552** pinout
(53/53a/53b/31). Self-park works correctly via rly-wlow's NC contact
(87a → 53a → motor's internal park-cam contact). A 3-wire motor missing
the 53a pin will work but loses external self-park (motor stops wherever
the switch was released).

**Recommendation:** 4-wire replacement motor. The modern aftermarket
options for 105/115 cars (Classic Alfa, Alfaholics, Centerline) all expose
4 pins by default. The 3-wire variant is the period-original Bosch
0 390 326 002 (Alfa PN 105 02 65 052 04) — fine if you specifically want
period-correct, but accept the self-park downgrade with our topology.

**Compatibility table:**

| Motor topology | Plug-in fit | Self-park | Notes |
|---|---|---|---|
| 4-wire Bosch (53/53a/53b/31) | ✅ direct | ✅ full | recommended |
| 3-wire (53/53b/31, internal park) | ✅ leave 53a unconnected | ⚠ degraded — relay's NC output goes nowhere | acceptable |
| 3-wire (+/slow-ctrl/fast-ctrl) | ❌ — different topology | n/a | NOT compatible — would require rewiring rly-wlow & rly-whigh from switched-power to switched-ground |

**How to check the motor:** before connecting, peek at the motor's
nameplate / Bosch part number, or measure terminal continuity (53a should
show internal continuity to park-cam contact when at rest; in a 3-wire
motor there's simply no 53a pin to probe).

**Action when sourcing:** order a 4-wire motor unless period-correct trumps
self-park; record the part number + supplier in the BOM. The wire colours
on aftermarket motors are NOT standardised — confirm wire-to-terminal
mapping against the motor data sheet, don't rely on colour alone.

---

## Wire route lengths — measurements to refine the model

### `[ ]` Measure actual cross-zone routes
**Why:** `zones.ts` `zoneLinks` derives wire lengths from estimated route
distances. Real measurements would let us cut wires more precisely (less
waste). Currently each zone link has a `routeMm` estimate; the deduced lengths
have ±10% slop.

**How to measure:** with a tape measure or string, route a string along the
actual physical path the loom would take between each pair of zones. Record
the measurement.

**Zones to verify** (priorities — most-leveraged first):
- **`engine-front → dash` (currently 1300 mm) — HIGHEST PRIORITY.** With the
  RTMR cluster at front-left near the battery, ~10-12 wires (ign feed, hazard,
  HL switch input, flash input, gauges, accessory, turn switch, interior,
  main-relay trigger, etc.) share this route. A 100 mm error here multiplies
  into ~1.2 m of total wire under/over-spec. Measure: from the RTMR-const
  input stud location → across the inner fender / firewall edge → through
  the BH1 grommet → land at the back of the dash.
- `engine-front → engine-rear` (currently 800 mm) — front cluster to coil /
  distributor / oil + temp senders at the back of the bay. Affects the coil
  feed, tach signal, sender returns.
- `dash → rear` (currently 3000 mm) — BH3 spine to the boot. Affects fuel
  pump, fuel sender, rear tails, brake jumper, reverse.
- `cabin → rear` (1900 mm) — under floor route (less used, mostly the rear
  ground trunk).
- `battery → engine-front` (currently 900 mm) — if battery is RIGHT next to
  the RTMR/PDM cluster, this could drop to ~300-500 mm. Affects PDM main
  feed cable and battery → constant-RTMR input stud.
- `dash → cabin` (600 mm) — interior light to door switches.
- `battery → engine-rear` (currently 700 mm) — likely OBSOLETE with the
  battery-and-RTMR cluster both at the front; this link may have no wires
  actually using it. Confirm and consider removing.

### `[ ]` Confirm cross-car jumper lengths (front + rear panels)
**Why:** `wires.ts` has `slackMm: 1000` on the L→R jumpers (`w-pos-fr`,
`w-pos-rear-R`, `w-brake-R`) based on the blueprint dimensions (car width 1580,
track 1324). Measure the actual panel-traversal distance you'll route.

**How to measure:** with the front clip or rear panel in hand, route a string
from LH lamp socket to RH lamp socket along your planned wire path.

### `[ ]` Wire route from dash ground block to engine-bay hub (BH1 path)
**Why:** the dash ground trunk is heavy (6 mm²) and currently routed dash →
engine-rear. Verify the actual path (might want to go around BH1's connector
position rather than through it).

---

## Bulb / lamp sizing

**Policy:** size wires + fuses for incandescent worst-case load throughout.
LED retrofits (likely to land later on at least some lamps) then become a
transparent upgrade — they draw less through already-correctly-sized wiring,
no harness rework needed. The trade-off: nothing gets downsized for LEDs
upfront, but nothing breaks if you mix-and-match incandescent and LED, or if
you ever revert to incandescent.

### `[ ]` When LEDs land — confirm flasher unit is LED-compatible
**Why:** the turn-signal flasher rate is current-sensitive on classic
bi-metallic / thermal flashers — drop the load to LED levels and the flash
rate goes fast/erratic (the "hyperflash" problem signaling a blown bulb on
modern cars). The Tridon/electronic flasher we've specified is rated for
LED loads, but worth verifying when you actually fit the LEDs that the rate
stays compliant (~60-120 flashes/min per ECE R48).

### `[ ]` When LEDs land — confirm no flicker on parking/tail circuits
**Why:** LEDs on the ignition-on auto-running-light feed (via f-ign-10)
should be steady. Some cheaper LED bulbs flicker on slightly-rippled DC if
the alternator output isn't smooth. Easy bench-check.

### Wattages the model is sized for (incandescent worst case)
- Headlamps: H4 60 W high / 55 W low (~5 A per filament)
- Brake/stop: 21 W per side (~1.8 A each, ~3.5 A both)
- Tail/parking: 5 W per lamp
- Plate: 5 W per lamp
- Turn signals: 21 W per filament (one side flashing = ~1.8 A)
- Reverse: 21 W (~1.8 A)
- Interior: 10 W
- Horn: ~5 A each (×2 = ~10 A peak)
- Heater blower: ~15 A (highest non-headlamp load)

These are the figures fuses + wires are sized against. Anything you replace
with LED draws ~10-20% of these numbers, well within the existing margins.

---

## Switch wiring / pinout verifications

### `[ ]` Wiper motor terminal colours at 53 / 53a / 53b
**Why:** we committed to `w-wpark-out: White/Black` (53a, park) and
`w-whigh-out: Red` (53b, high) based on Bosch convention. Your motor might
differ.

**How to check:** open the wiper motor connector; note which wire colour goes
to which terminal number.

### `[ ]` Flasher unit pinout (49 / 49a / 31 / C)
**Why:** the model assumes 49=input from constant, 49a=flashed output, 31=ground,
C=tell-tale. Confirm against your physical flasher (Italian period flashers
sometimes used non-standard pin labels).

### `[ ]` Horn relay common colour (factory)
**Why:** `w-horn-30` is set to Violet to match the heavy horn wire convention,
but the factory horn-relay COMMON might be a different colour (probably Black
or Red, fed direct from the battery feed). Flagged as a best-guess.

### `[ ]` Interior light feed colour
**Why:** `w-int-feed` is set to Black based on the factory schematic showing
Black for the interior light circuit. Some `105`-series cars used Red for the
constant feed and Black only for the door-switch returns. Confirm against the
diagram or the actual loom remnant.

---

## Mounting / fit-up

### Battery location (DECIDED)
**Front of engine compartment, driver (LEFT) side, close to the radiator.**
Drives the PDM + RTMR mounting cluster decisions below.

### `[ ]` PDM physical mount point — within the front-left cluster
**Why:** PDM is ~150 × 100 × 50 mm, IP69K, 100 A. With battery front-left,
mounting the PDM in the same area keeps the heavy battery → PDM feed cable
short (low voltage drop on headlamp current) AND keeps the beam-output wires
short to the LH headlight. The RH headlight gets ~1 m cross-front run via
the radiator support (already accounted for in `w-hl-lo-R` / `w-hl-hi-R`).

**How to check:** identify a flat patch of inner-fender or front-cross-member
sheet metal close to the battery + reachable from BH4. Photograph candidates.

### `[ ]` RTMR mounting — both blocks on the left of the engine bay
**Why:** each RTMR is ~100 × 100 × 60 mm. Mounting both alongside the
battery and PDM keeps all heavy feeds short:
- `rtmr-const` input stud → battery + (~30 cm)
- `rtmr-ign` input stud → ign-main relay output → battery + via constant side
- `gnd-eng` (battery − hub) → engine-bay ground block (~30 cm)

Commit `0b884be` already recorded the LEFT side decision; this confirms the
specific area (front-left, alongside battery).

**How to check:** confirm there's room for both blocks side-by-side or
stacked, with input studs accessible for ring-terminal-on-stud connections.

### `[ ]` BH1 / BH2 / BH3 / BH4 bulkhead grommet locations
**Why:** the factory had specific firewall pass-throughs. Modern Metri-Pack /
GT 280 connectors need either re-using those or drilling new grommets.
Bulkhead positions should be reachable from the front-left RTMR cluster
without crossing over the engine.

**How to check:** locate the existing firewall holes; measure their diameter;
confirm they'll fit the chosen connectors with appropriate grommets. If
re-drilling, place near the LEFT side of the firewall for shortest dash-side
runs from the engine-bay cluster.

### `[ ]` Ground stud locations
**Why:** every detachable module's ground block needs a chassis-side stud to
land its trunk. Four spots:
- **`gnd-eng`** (engine-bay hub): front-left, near battery − (decided)
- **`gnd-front`** (front-clip block): front cross-member, near the headlights
- **`gnd-dash`** (dash block): under-dash sheet metal, central
- **`gnd-rear`** (rear panel block): inside the boot, on the rear panel

**How to check:** identify or drill mounting points for ring-terminal-grade
M6 / M8 studs at each location. Clean to bare metal where the ring lands;
seal/protect afterward.

---

## Notes for future entries

Add new items here as we discover them. Format: `[ ]` (or `[x]` if done, or
`~~strikethrough~~` if cancelled), short title, **Why** + **How**.
