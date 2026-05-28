# Engine-bay architecture — plug-in 155 TS swap via the Alfaholics K6+ kit

Forward-compatible design for swapping the Giulia GT 1300 Junior's Nord
engine for an Alfa Romeo 155 Twin Spark engine running on carburetors, with
the Alfaholics 3D Mapped Ignition Kit (Emerald K6+ rebadged) handling spark.

**Scope:** physical / electrical architecture and the engine-boundary
connector design. Programming + tuning are deferred to a separate document
once the engine is on the bench.

**Status:** designed AND implemented in the harness model — the EM1 connector
is in the chassis loom now, populated for the Nord engine today. Engine swap
requires no chassis-loom modification, only a fuse-blade swap.

---

## TL;DR

```
┌──────────────────────────────┐         ┌───────────────────────────────┐
│  CHASSIS-SIDE LOOM           │   EM1   │  ENGINE-SIDE WIRING           │
│  (stays with the car)        │ 12-way  │  (goes with the engine)       │
│                              │ sealed  │                               │
│  rtmr-ign.f-ign-1 ──────────►┤  ◄══════╪◄── coil.15 (or K6+ power)     │
│  gnd-eng       ◄─────────────┤  ◄══════╪◄── coil GND (or K6+ GND)      │
│  g-tach.sig    ◄─────────────┤  ◄══════╪◄── coil.1 (or K6+ tach out)   │
│  g-temp.s      ◄─────────────┤  ◄══════╪◄── snd-temp.s (today or new)  │
│  g-oil.s       ◄─────────────┤  ◄══════╪◄── snd-oil.s (today or new)   │
│  wl-oil.s      ◄─────────────┤  ◄══════╪◄── sw-oillight.s (today/new)  │
│  wl-charge.d   ◄─────────────┤  ◄══════╪◄── alternator.D+              │
│  rly-starter.87 ────────────►┤  ◄══════╪──► starter.50 (solenoid trg)  │
│                              │  ◄══════╪◄── future ECU fan trigger     │
│                              │  ◄══════╪◄── future CTS/AFR pass-thru   │
│                  sealed ─────┤  ─sealed│ spare                         │
└──────────────────────────────┘         └───────────────────────────────┘
        Stays put when engine                 Lifts out with the engine
        comes out                             as one assembly
```

Engine swap day, harness side = **unplug EM1 + unbolt 2 heavy cables + swap
1 fuse blade**. ~5 minutes work.

---

## 1. What we're targeting

A future swap from the original 1300 Nord engine to an Alfa Romeo 155 Twin
Spark 2.0 engine. The 155 TS:

- Is **distributorless** — crank-trigger-and-coil-pack, no distributor
- Originally ran on Bosch Motronic fuel injection + ignition
- For our use: **carbs** (Webers or Dellortos), so no fuel injection
- Needs an aftermarket ignition controller to fire the coils based on crank
  position, replacing the Motronic ECU

The chosen controller is the **Alfaholics 3D Mapped Ignition Kit for Twin
Spark & Nord** — built around an **Emerald K6+** standalone ECU loaded with
an Alfaholics base map.

---

## 2. What's in the Alfaholics kit

| Item | Detail |
|---|---|
| ECU | Emerald K6+ standalone ECU, pre-loaded with Alfaholics base map |
| Coil packs | 2 × dual-output coil packs (4 outputs total for the 4 cylinders, Twin Spark fires both plugs in each cylinder via the coil pack's wasted-spark Y-arrangement) |
| Amplifiers | 2 × external ignition amps to drive the coils (K6+ provides the trigger; amps sink the coil current) |
| Crank sensor | Bosch VR sensor at the existing front-cover trigger wheel |
| Throttle sensor | TPS on the front carb spindle (3D mapping = RPM × throttle position) |
| Kit loom | Self-contained engine-side loom; terminates at the EM1 mating connector |
| Programming | USB/serial + Emerald software (one-time setup) |

**Optional:** coolant temp sensor (for cold-start advance), fan-relay output
(drives `rly-fan` based on CTS), AFR/lambda input.

---

## 3. The K6+ ECU itself

| Spec | Value |
|---|---|
| Manufacturer | Emerald M3D (UK) |
| Model | K6+ |
| Case | ~140 × 110 × 35 mm aluminium |
| Connector | 36-way Tyco/AMP Superseal (sealed) — on the kit-loom side |
| Ignition drivers | 6 (4 used for Twin Spark wasted-spark) |
| Injection drivers | 6 (unused on a carb car) |
| Trigger inputs | 3 speed triggers, digital or inductive (1 for crank) |
| Programming | Serial over USB, free Emerald software, optional CAN logging |
| Logic power | ~0.5 A (drivers + amps + coils are the real current) |

See manufacturer docs linked at the bottom for full pinout + manuals.

---

## 4. EM1 boundary connector — heart of the plug-in design

A **12-way Metri-Pack 280 sealed connector** at the engine-bay boundary
carries every light-signal engine-related wire. Same pin assignment serves
both engines.

### Connector physical spec

- **Family:** Metri-Pack 280 (matches the rest of our engine-bay connectors)
- **Ways:** 12 (8 used today + 4 sealed-cavity spares reserved for the swap)
- **Gender:** chassis-side female / engine-side male (or vice-versa — pick
  the one that survives the swap intact, since the chassis side stays put)
- **Sealing:** unused cavities get sealing plugs; connector stays IP-rated
  regardless of which pins are populated
- **Mounting:** chassis-side bracketed to the firewall (upper-driver-side,
  near the original coil mount); engine-side on a ~30 cm flying lead from
  the engine

### Pin map (same connector both engines)

| Pin | Signal (purpose) | Today (Nord) | Future (155 TS + K6+) | Gauge |
|----:|---|---|---|---|
| 1 | Ignition +12V supply | → coil terminal 15 | → ECU + amps + coil power | **high** (2.5 mm²) |
| 2 | Engine ground | ← coil chassis bond | ← ECU + amp + coil grounds | **high** (2.5 mm²) |
| 3 | Tach signal | ← coil terminal 1 | ← K6+ tach output | signal |
| 4 | Coolant temp signal | ← Nord temp sender | ← 155 TS temp sender | signal |
| 5 | Coolant temp ground | ← Nord sender ground | ← 155 TS sender ground | signal |
| 6 | Oil pressure (gauge) | ← Nord oil sender | ← 155 TS oil sender | signal |
| 7 | Oil pressure (warning lamp) | ← Nord oil switch | ← 155 TS oil switch | signal |
| 8 | Alternator D+ (charge lamp) | ← Nord alt D+ | ← 155 alt D+ | signal |
| 9 | Starter solenoid trigger | → Nord starter 50 | → 155 starter 50 | high (2.5 mm²) |
| 10 | *sealed spare* | — | ECU → rly-fan trigger (opt.) | — |
| 11 | *sealed spare* | — | CTS pass-through to gauge (opt.) | — |
| 12 | *sealed spare* | — | spare | — |

### Wire-sizing rationale (pin 1 + pin 2)

Pin 1 carries ~0.5 A today (Nord coil) but ~15 A peak at swap day (K6+ +
amps + coils). The wire is sized for the FUTURE worst case (**high gauge,
2.5 mm² / 14 AWG**) so it never needs to change. The fuse can stay at 10 A
today and bump to 20 A at swap day — the wire's 25 A ampacity comfortably
protects against either.

Pin 2 is the engine-management ground return — same logic, sized **high
gauge** to handle the same 15 A peak.

Pin 9 (starter solenoid trigger) is `high` gauge already in our model
because of starter solenoid pull-in current (~10 A) — no change.

The other pins (3-8, 10-12) are signal-level and stay `signal` gauge.

### Wires that DON'T go through EM1

The two heaviest cables can't physically fit in any 12-way sealed connector
— they remain **direct stud-mount**:

- **Battery + → Starter B+** (25 mm² / 4 AWG) — heavy cable, ring terminal
  on starter stud
- **Alternator B+ → Battery** (25 mm² / 4 AWG) — heavy cable, ring terminal
  on alternator stud
- **Alternator case ground → engine block** (6 mm² / 10 AWG) — local bond

These are 2-3 ring nuts to crack at engine swap, separate from EM1.

---

## 5. Power budget at swap day

| Load (K6+ running) | Steady (A) | Peak (A) |
|---|---:|---:|
| K6+ ECU logic | 0.3 | 0.5 |
| Ignition amplifiers (2×) | 0.5 | 6 |
| Coil packs (2×) | 4 | 10 |
| **Total** | **~5** | **~15** |

Current fuse f-ign-1 is 10 A; swap day = bump to 20 A blade in the same RTMR
slot. No wire change required since EM1 pin 1 is already `high` gauge.

---

## 6. Engine swap day — what physically happens

1. **Disconnect EM1** at the firewall (single connector unlatch)
2. **Unbolt the 2 heavy cables**: alternator B+ ring, starter B+ ring
3. **Unbolt the engine ground strap** (engine block ↔ gnd-eng stud)
4. **Hoist the old Nord engine out** as a complete assembly (coil,
   distributor, plug leads, all sensors come with it — they were on the
   engine-side pigtail)
5. **Drop the 155 TS in** with the Alfaholics kit pre-installed (kit loom
   routed, coil packs + amps mounted, CPS + TPS fitted)
6. **Plug EM1** chassis-side ↔ engine-side, single connector mate
7. **Bolt** the 2 heavy cables + ground strap to the 155 TS terminals
8. **Swap f-ign-1's blade fuse** from 10 A to 20 A (same slot)
9. **Optional**: if using ECU fan control, populate EM1 pin 10 with a
   chassis-side jumper to `rly-fan.86`

Harness-side total time: ~15 minutes. The rest is mechanical (mounts,
exhaust, cooling, throttle linkage, etc.).

---

## 7. What you DON'T need to think about

The Alfaholics kit handles everything inside its sealed package:
- Crank trigger conditioning (VR → ECU)
- TPS signal (analog 0–5 V → ECU)
- Coil-pack firing sequence (wasted-spark 1-3-4-2)
- Ignition advance map (pre-loaded, tunable)
- Coil dwell + rev limiter

No wires for any of those need to cross our chassis loom.

---

## 8. Compliance (Norwegian veteran-vehicle)

The ignition-system change is **permitted as a modernisation** under
kjøretøyforskriften § 1-9 + Statens vegvesen's bevaringsverdig kjøretøy
provisions. Veteran status retained as long as:

- All factory-mandated lighting/signalling still works (handled by our
  harness, untouched by this swap)
- The ECU manufacturer + map version are documented (Alfaholics ECU has
  a serial sticker; map ID readable via Emerald software)
- No emissions equipment removed (1969 Junior was never fitted with any)

Document the change in the car's service log for the next inspection;
no re-certification required.

---

## 9. Open questions

These don't affect the EM1 architecture, but want verifying before the
actual swap:

- **Confirm ECU is Emerald K6+** — strong consensus from form factor + kit
  composition; verify by reading the serial sticker when the kit arrives
- **Amplifier part number** — likely Bosch BIM057-class; matters for spares
- **Coil pack part number** — likely Bosch 0221503407-class; matters for
  spares + plug-lead sourcing
- **155 TS sensor connector compatibility** — Nord senders use one connector
  style, 155 TS uses another. Choice at swap day: source sensors with
  Nord-compatible connectors OR adapter pigtails on the engine side (inside
  the EM1 boundary, transparent to the chassis loom)
- **ECU fan control decision** — use EM1 pin 10 (replaces manual heater-fan
  switch in `sw-heaterfan`) or keep manual

---

## 10. Implementation in the model

This architecture is **implemented today** in the harness model. The Nord
engine plugs into EM1; the 155 TS swap is a documented future variant.

| Module | Status | Components |
|---|---|---|
| `engine-nord` | ACTIVE today | coil, dist, alternator, starter, senders (snd-temp / snd-oil / sw-oillight) — everything physically on the engine |
| `engine-155ts` | DOCUMENTED future | (no components in the model — kit loom + sensors + coils all hide behind EM1 when fitted) |
| `main-loom` | Unchanged | RTMRs + relays + the chassis-side wiring up to EM1 |

The EM1 connector is declared in `connectors.ts` as a 12-way Metri-Pack
280 with `expectedPlugs: 1`. The 8 active wires that touch the engine all
carry `via: ["em1"]` so the connector auto-populates with the right pins.

---

## Related documents

- `PHYSICAL-TODO.md` — physical verifications (EM1 mounting, K6+ pinout
  confirmation, kit teardown)
- `src/data/harness/wires.ts` — the wires routed through EM1
- `src/data/harness/connectors.ts` — EM1 connector definition
- `src/data/harness/modules.ts` — engine-nord + engine-155ts module
  definitions
- `src/data/original/factory.ts` — factory architecture reference

## External references

- [Alfaholics 3D Mapped Ignition Kit (product page)](https://www.alfaholics.com/race-parts/105-series/engine-2/full-3-dimensional-ignition-map-for-twin-spark/)
- [Alfaholics installation guide](https://www.alfaholics.com/guides/alfaholics-3-d-mapped-ignition-kit-for-twinspark/)
- [Emerald K6+ Generic ECU (manufacturer)](https://www.emeraldm3d.com/engine-management-ecu-ems-conversion-kits/emerald-k6-ecu-generic.html)
- [Emerald K6 Configuration Guide PDF](https://www.emeraldm3d.com/media/software-manuals/Emerald%20K6%20ECU%20Configuration%20Guide%20Rev3.pdf)
- [Emerald K6 36-way connector pinout PDF](https://www.emeraldm3d.com/media/ppw/FL-D_crank_and_I_cam.pdf)
- [Emerald K6 Relay Connections PDF](https://www.emeraldm3d.com/media/ppw/Relay_Connections-K6.pdf)
