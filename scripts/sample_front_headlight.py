"""Pictorial-schematic SAMPLE of the front-headlight circuit (schemdraw).

Component symbols + wires, the way the factory PDF draws things — so we can
compare the look against the WireViz and interactive node views.

    .venv/bin/python scripts/sample_front_headlight.py
    -> public/diagrams/sample-front-headlight.svg
"""
import schemdraw
schemdraw.use("svg")
import schemdraw.elements as elm


def beam(d, x, relay_label, lamp_label, trig_label):
    """One relay-driven beam: feed -> relay contact -> lamp -> ground,
    coil driven by the dip-switch trigger (via BH4), coil -> ground."""
    k = d.add(elm.Relay().at((x, 0)).label(relay_label, "top", ofst=0.7))
    # contact top (a) <- battery feed (from above)
    d += elm.Line().up().at(k.a).length(1.0).label("BAT +B", "right")
    # contact bottom (b) -> headlight -> ground
    d += elm.Line().down().at(k.b).length(0.6)
    d += elm.Lamp().down().label(lamp_label)
    d += elm.Ground()
    # coil: trigger in (in1) from the left, ground out (in2)
    d += elm.Line().left().at(k.in1).length(1.8).label(trig_label, "left")
    d += elm.Line().down().at(k.in2).length(0.8)
    d += elm.Ground()
    return k


with schemdraw.Drawing(file="public/diagrams/sample-front-headlight.svg", show=False) as d:
    d.config(fontsize=11, unit=1.9)
    beam(d, 0.0, "LOW-beam relay (PDM)", "Headlights\nLOW  (L + R)", "HL.LO.TRG\n(dip sw, via BH4)")
    beam(d, 8.0, "HIGH-beam relay (PDM)", "Headlights\nHIGH (L + R)\n+ tell-tale", "HL.HI.TRG\n(dip sw, via BH4)")

print("Wrote public/diagrams/sample-front-headlight.svg")
