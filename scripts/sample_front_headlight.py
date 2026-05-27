"""Pictorial SAMPLE of the FRONT-CLIP harness, following the real topology:

    BH4 connector  ->  PDM (beam relays + fuses)  ->  headlights + horn

Component symbols + labelled wires, factory-PDF style (schemdraw).

    .venv/bin/python scripts/sample_front_headlight.py
    -> public/diagrams/sample-front-headlight.svg
"""
import schemdraw
schemdraw.use("svg")
import schemdraw.elements as elm

with schemdraw.Drawing(file="public/diagrams/sample-front-headlight.svg", show=False) as d:
    d.config(fontsize=10, unit=1.4)

    # ===== BH4 connector (left — plugs into the main loom) ==================
    d += elm.Rect(corner1=(0, 0.6), corner2=(1.2, -6.2)).label("BH4\n→ main loom", "left", fontsize=8)
    # pin stubs (right edge), top→bottom
    pins = ["HL.LO.TRG", "HL.HI.TRG", "HL.HI.TELL", "TURN.OUT.F", "HORN.OUT"]
    ph = {}
    for i, name in enumerate(pins):
        y = -i * 1.4
        d += elm.Line().right().at((1.2, y)).length(0.6).label(name, "right", fontsize=8)
        ph[name] = (1.8, y)

    # ===== PDM box (beam relays + fuses) ===================================
    # low + high beam relays inside the PDM enclosure
    kLo = d.add(elm.Relay().at((5.2, 0.2)).label("LO relay", "top", fontsize=8))
    kHi = d.add(elm.Relay().at((5.2, -2.6)).label("HI relay", "bottom", fontsize=8))
    # battery feed to both relay contacts (a)
    d += elm.Line().at(kLo.a).to(kHi.a)
    d += elm.Line().left().at(kLo.a).length(1.2).label("BAT +B", "left", fontsize=8)
    d += elm.Dot().at(kLo.a)
    d += elm.Dot().at(kHi.a)
    # triggers from BH4 into the coils (in1)
    d += elm.Line().at(ph["HL.LO.TRG"]).to(kLo.in1)
    d += elm.Line().at(ph["HL.HI.TRG"]).to(kHi.in1)
    # coil grounds (in2)
    d += elm.Line().down().at(kLo.in2).length(0.5); d += elm.Ground()
    d += elm.Line().down().at(kHi.in2).length(0.5); d += elm.Ground()
    # relay outputs -> beam fuses
    fLo = d.add(elm.Fuse().right().at(kLo.b).label("10A", "bottom", fontsize=8))
    fHi = d.add(elm.Fuse().right().at(kHi.b).label("10A", "bottom", fontsize=8))
    # tell-tale tapped off the HI output, back to BH4
    d += elm.Line().at(kHi.b).to(ph["HL.HI.TELL"]).color("#888")
    # PDM enclosure
    d += elm.EncircleBox([kLo, kHi, fLo, fHi], padx=0.5, pady=0.5).label("Headlight PDM", "top", ofst=0.4)

    # ===== Loads (right) ===================================================
    d += elm.Line().right().at(fLo.end).length(1.0)
    d += elm.Lamp().right().label("Headlights LOW (L+R)", "top", fontsize=8)
    d += elm.Ground()
    d += elm.Line().right().at(fHi.end).length(1.0)
    d += elm.Lamp().right().label("Headlights HIGH (L+R)", "bottom", fontsize=8)
    d += elm.Ground()
    # horn — pass-through from BH4 (main-loom horn relay output), not via PDM
    d += elm.Line().right().at(ph["HORN.OUT"]).length(9.5).label("HORN.OUT", "left", fontsize=8)
    d += elm.Speaker().right().label("Horns", "bottom", fontsize=8)
    d += elm.Ground()
    # front turn pass-through
    d += elm.Line().right().at(ph["TURN.OUT.F"]).length(9.5).label("TURN.OUT.F", "left", fontsize=8)
    d += elm.Lamp().right().label("Front turn L/R", "bottom", fontsize=8)
    d += elm.Ground()

print("Wrote public/diagrams/sample-front-headlight.svg")
