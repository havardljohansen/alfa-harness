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
    topic: "Headlights gated by ignition",
    text: "You want main/dip beams to need key-position I. That's allowed and is a sensible anti-flat-battery measure, BUT keep PARKING/POSITION lamps and HAZARDS on constant battery so marker lights and 4-ways still work with the engine off (and so you're never legally without position lights when parked). The design does exactly this — don't move position lamps onto the ignition feed.",
    ref: "General roadworthiness — position lamps operable when parked",
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
    severity: "caution",
    topic: "Electric fuel pump safety cut-off",
    text: "An electric pump should stop when the engine stops and in a crash. Run the pump relay coil through ignition AND add an inertia switch or oil-pressure safety so the pump can't keep running/spraying fuel with the engine off. This is a fire-safety/roadworthiness point, not just good practice. The design provisions the cut-off wire.",
    ref: "Fire safety / roadworthiness (added electric pump)",
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
