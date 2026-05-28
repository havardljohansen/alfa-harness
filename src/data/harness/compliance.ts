import type { ComplianceNote } from "./types";

// ---------------------------------------------------------------------------
// EU / Norway veteran-vehicle compliance notes.
//
// ADVISORY ONLY — not legal advice. The authority is Statens vegvesen and the
// kjøretøyforskrift; verify anything load-bearing with them or a godkjent
// verksted before a kontroll. Sources consulted (May 2026):
//   * Statens vegvesen — "Bevaringsverdig kjøretøy" (kjøretøyforskriften §1-9)
//   * Statens vegvesen — EU-kontroll exemption for vehicles > 50 years
//
// Bottom line for THIS car (1969, now 57 yrs): as a bevaringsverdig
// veteranbil > 50 years it is EXEMPT from periodic EU-kontroll, but it must
// still be roadworthy and keep the lighting/signalling that was required when
// first registered (1969). Modernising the wiring is fine as long as those
// required functions remain and work.
// ---------------------------------------------------------------------------
export const complianceNotes: ComplianceNote[] = [
  {
    id: "eu-kontroll-exempt",
    severity: "info",
    topic: "Periodic inspection",
    text: "A 1969 car (>50 yrs) classified bevaringsverdig is exempt from periodic EU-kontroll. It must still be roadworthy whenever used on public roads. (Cars 35–50 yrs: every 5 years.)",
    ref: "Statens vegvesen — bevaringsverdig kjøretøy / EU-kontroll",
  },
  {
    id: "required-lighting",
    severity: "check",
    topic: "Mandatory lighting must be retained",
    text: "The rebuild must keep all lighting/signalling required in 1969 and keep it working: two headlamps (main+dip), front position lamps, rear position/tail, stop lamps, direction indicators (front+rear) with a tell-tale, number-plate light, main-beam blue tell-tale, and rear reflectors. The factory car has all of these — don't drop any when modernising.",
    ref: "kjøretøyforskriften §1-9 (requirements at first registration)",
  },
  {
    id: "headlights-ign-gated",
    severity: "caution",
    topic: "Headlights gated by ignition (asymmetric)",
    text: "Asymmetric ignition gating by design: LOW beams need key-position I (anti-flat-battery — the daily-driving position can be left set and the lights die with the key). HIGH beams work key-off (emergency lighting + a deliberate 'you forgot' indicator since high beams aren't subtle). PARKING lights have two paths: auto-on with ignition (so they're never absent while driving), AND the dash switch's PARK detent forces them on key-off for roadside parking. HAZARDS stay on the constant bus so the 4-ways work engine-off.",
    ref: "Design choice — see truth table in c-headlights notes",
  },
  {
    id: "daylight-lights-mandate",
    severity: "check",
    topic: "Driving-lights mandate (kjørelys hele døgnet)",
    text: "Norway has required lights-on at all times while driving since 1988 (Forskrift om kjøring med motorvogn / trafikkreglene). Required source = nærlys (low beam) eller kjørelys (DRL). Parking/position lamps alone do NOT satisfy the rule. Practical implication for this build: the daily driving position of the dash rotary is LOW — leave it there, low beams come on with the key, mandate met automatically. The dash switch's OFF position (parking lights only via the auto-ign feed) is for key-on-stationary use only; driving in that position is non-compliant.",
    ref: "Trafikkreglene — kjøring med lys hele døgnet (1988-)",
  },
  {
    id: "roadside-parking-lamps",
    severity: "check",
    topic: "Roadside parking after dark",
    text: "When parked roadside in unlit conditions where the car isn't visible from 50 m, front + rear position lamps must be lit (trafikkreglene § 17). The dash switch's PARK detent provides this: click into PARK before removing the key → parking lamps stay on via the constant bus override. Remember to click out of PARK if you want zero drain. (Hazards are an alternative for emergency stops but draw more current and signal a different intent.)",
    ref: "Trafikkreglene § 17 — parkering",
  },
  {
    id: "hazard-add",
    severity: "info",
    topic: "Hazard flashers (added)",
    text: "Hazard 4-ways were not standard on the 1969 car. Adding them is a permitted improvement and does not affect veteran status. They must flash all four indicators simultaneously and use an amber tell-tale.",
    ref: "Permitted safety improvement",
  },
  {
    id: "indicator-colour",
    severity: "check",
    topic: "Indicator & lamp colours",
    text: "Direction indicators must be amber (front may be white-amber on very early cars, but amber is safe), stop/tail red, reverse white, plate light white. If you change any lenses/bulbs while in there, keep colours legal.",
    ref: "kjøretøyforskriften — lamp colours",
  },
  {
    id: "fuel-pump-cutoff",
    severity: "info",
    topic: "Electric fuel pump (low-pressure carb)",
    text: "The pump is plain ignition-switched — it runs key-on and stops key-off, which is the common, simple setup for a low-pressure (~2–4 psi) carburettor pump. An inertia/crash cut-off is optional here (the low pressure means a stalled-but-running pump dribbles rather than sprays). If you ever fit a high-pressure EFI pump, add an inertia switch in the relay-coil wire — then it becomes a real fire-safety item.",
    ref: "Good practice (low- vs high-pressure pump)",
  },
  {
    id: "o2-future",
    severity: "info",
    topic: "O2 / AFR gauge (future)",
    text: "A wideband O2 sensor + AFR gauge is monitoring-only and does not affect compliance. Provisioned as ignition-switched, fused and fully isolated until fitted.",
    ref: "No regulatory impact",
  },
  {
    id: "wire-colour",
    severity: "info",
    topic: "Single wire colour",
    text: "There is no roadworthiness rule on wire colour. Using one colour + printed labels is fine; just keep the labelling legible for future inspection/repair.",
    ref: "No regulatory impact",
  },
  {
    id: "alternator-swap",
    severity: "info",
    topic: "Alternator conversion",
    text: "Swapping the dynamo + external regulator for an internally-regulated alternator is a common, accepted upgrade and does not affect veteran status, provided the charge warning lamp still functions.",
    ref: "Accepted modernisation",
  },
];
