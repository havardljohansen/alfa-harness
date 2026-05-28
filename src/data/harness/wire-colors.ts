// ===========================================================================
// WIRE COLOUR PALETTE
// ---------------------------------------------------------------------------
// Two sources:
//   1. FACTORY — the 1969 Series 2 schematic (sheet R4 / Model 10530). Colour
//      maps to circuit role, per Alfa Romeo / Italian convention of the era.
//      Used on wires that share function with the factory equivalent.
//   2. NEW — circuits that did not exist in 1969 (PDM, ignition main relay,
//      electric fuel pump, USB/stereo, hazard, PWM dimmer, AFR/O2). Picked to
//      sit OUTSIDE the factory palette so the modern additions are visually
//      distinct from period correctness.
//
// Two-tone wires are written `"Base/Stripe"` (e.g. `"Yellow/Black"`); single
// colour just `"Red"`. Helpers below split that into renderable hex pairs.
// ===========================================================================

// Dark-theme-friendly hex per colour name. Slight saturation lift so wires
// read against the panel background.
const HEX: Record<string, string> = {
  Red: "#e2554a",
  Black: "#9aa3ad", // not literal black — needs to read on the dark canvas
  Blue: "#56b4e9",
  Yellow: "#f5c451",
  Gray: "#bdbdbd",
  Green: "#8bd17c",
  White: "#f0f0f0",
  Pink: "#f48fb1",
  Brown: "#c98a4b",
  Violet: "#b07cd1",

  // Modern-only (deliberately outside the factory palette)
  Orange: "#ff9933", // PDM + ignition main relay chain
  Cyan: "#4bc0c0",   // fuel pump (modern injection-era addition)
  Purple: "#a060d0", // accessory (USB / stereo)
  Tan: "#d0b070",    // PWM dimmer
  Olive: "#b0a040",  // hazard (didn't exist 1969)
  Magenta: "#e060a0", // AFR / O2 (future)
  Lime: "#b0d040",   // modern auxiliary relays (starter/washer/fan)
};

export interface WireStroke {
  base: string;          // hex
  stripe?: string;       // hex if two-tone
  baseName: string;      // colour name (for tooltips)
  stripeName?: string;
}

export const FALLBACK = "#888";

export function parseWireColor(color?: string): WireStroke | null {
  if (!color) return null;
  const [b, s] = color.split("/").map((x) => x.trim());
  const base = HEX[b];
  if (!base) return null;
  if (!s) return { base, baseName: b };
  const stripe = HEX[s];
  return stripe ? { base, stripe, baseName: b, stripeName: s } : { base, baseName: b };
}

/** CSS background for a small swatch (pin layout, toggle chips). Solid colour
 *  for a single-tone wire, 50/50 diagonal split for two-tone. */
export function swatchBackground(color?: string): string {
  const s = parseWireColor(color);
  if (!s) return FALLBACK;
  if (!s.stripe) return s.base;
  return `linear-gradient(135deg, ${s.base} 0 50%, ${s.stripe} 50% 100%)`;
}
