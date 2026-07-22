# Stairgen — Spiral Stair Configurator — Design

**Date:** 2026-04-15
**Status:** Approved, ready for implementation plan
**Scope:** v1 — single spiral run, solid steps with soffit, full PBR/lighting, GLB export

---

## 1. Goals & Non-Goals

**Goals**
- Interactive 3D configurator for spiral stairs with **solid steps + continuous soffit (pełne z podniebieniem)**
- Exhaustive parameterization across geometry, materials, lighting, balustrade
- Live validation against PL building code (Warunki Techniczne §68) with 3 building-type profiles
- 5 presets covering common realization patterns (residential/public × concrete/wood/metal/marble)
- Presentation-ready output: GLB export (with PBR materials, optional Draco), PNG screenshot, config JSON in glTF `extras`

**Non-goals (v2+)**
- Multiple runs / winder stairs / stringer-type stairs
- Structural load calculations
- 2D drawings (plan/section SVG export)
- Custom Bezier profile authoring
- Multi-user persistence / cloud config

---

## 2. Architecture

**Stack:** Vite + React 18 + TypeScript + React Three Fiber + drei + leva + three-stdlib (GLTFExporter, DRACOExporter) + Zustand + Vitest.

**Single source of truth:** Zustand store `useStairStore` holding a `StairConfig` object. All components (3D scene, control panel, validation panel, status bar) read via selectors. Presets are pure `StairConfig → StairConfig` functions.

**Directory layout:**
```
src/
├── config/
│   ├── defaults.ts          # baseline StairConfig
│   ├── presets.ts           # 5 presets + loader
│   ├── validators.ts        # WT rules → Issue[]
│   └── types.ts             # StairConfig, Issue, Severity, BuildingType
├── geometry/
│   ├── stepGeometry.ts      # wedge BufferGeometry builder
│   ├── soffitGeometry.ts    # stepped / smooth_helix / offset_slab
│   ├── columnGeometry.ts
│   ├── balustradeGeometry.ts
│   ├── railGeometry.ts      # helical tube extrusion
│   ├── landingGeometry.ts
│   └── materials.ts         # PBR material presets
├── scene/
│   ├── Stair.tsx            # composes all sub-meshes
│   ├── Step.tsx, Soffit.tsx, Column.tsx, Balustrade.tsx, Rail.tsx, Landing.tsx
│   ├── Environment.tsx      # HDRI, background, shadows
│   └── Camera.tsx           # orbit + 5 preset framings
├── ui/
│   ├── ControlPanel.tsx     # leva folders per section
│   ├── ValidationPanel.tsx  # live Issue list, click to focus field
│   ├── PresetPicker.tsx     # 5 cards with preview thumb
│   ├── StatusBar.tsx        # live computed values (H, n, rise, walkDepth, Blondel)
│   └── ExportButton.tsx     # GLB with options modal
├── export/
│   ├── exportGLB.ts         # GLTFExporter + Draco + metadata
│   └── exportScreenshot.ts
├── store/
│   └── useStairStore.ts
└── App.tsx
```

**Dataflow:** slider → `leva.onChange` → `store.update()` → React re-renders → geometry components `useMemo(() => buildX(cfg), [relevantFields])` → scene updates → `ValidationPanel` recomputes `Issue[]` in `useMemo`.

**Performance strategy:** geometry memoization scoped to minimal dependency lists (material change does not rebuild mesh). Target: 60 fps on mid laptop with 30–50 steps.

---

## 3. Parameter Catalog (StairConfig)

Units: **mm** and **degrees**. GLB exported in meters (scale 0.001 on root).

### 3.1 Geometry — overall
- `totalHeight` (H) — floor-to-floor, default 2900
- `sweepAngle` (α) — 270 / 360 / 450 / 540 / custom 90–720
- `direction` — CW / CCW
- `outerRadius` (R_out) — 600–1200
- `walkLineRatio` — 0.5 default (0.667 = PL norm)
- `headroom` — computed/info

### 3.2 Steps
- `stepCount` (n) — auto from H and rise, editable override
- `riseHeight` — auto = H/n (info + override)
- `stepThickness` — 40–200
- `nosingType` — none / square / rounded / chamfer
- `nosingRadius` / `chamferSize` — conditional
- `nosingOvershoot` — 0–40
- `edgeRoundingTop` / `edgeRoundingBottom` — 0–10
- `topFinish` — flat / antislip_grooves / none

### 3.3 Soffit
- `soffitMode` — `stepped` / `smooth_helix` / `offset_slab`
- `soffitThickness` — 60–300 (for smooth/offset)
- `soffitInset` — 0–50 (decorative shoulder at column)
- `risersEnabled` — only in `stepped`

### 3.4 Central column
- `columnType` — solid / tube / none
- `columnDiameter` — 80–300
- `columnWallThickness` — 4–30 (tube only)
- `columnTopCap` — flat / dome / spike / none
- `columnBottomBase` — flat / flange / plinth / none
- `columnBaseDiameter`, `columnBaseHeight`

### 3.5 Landing
- `landingShape` — none / quarter / half / square / custom
- `landingWidth`, `landingDepth`, `landingOverhang`
- `landingThickness` — default = stepThickness
- `landingEdgeProfile` — square / bullnose / chamfer

### 3.6 Balustrade
- `railingEnabled`
- `railingHeight` — 900–1200
- `railingSide` — outer / inner / both
- `fillType` — vertical_bars / horizontal_bars / glass / cable / panels
- `barSpacing` — 60–200 (WT max 120)
- `barDiameter` — 10–30
- `barProfile` — round / square / flat
- `glassThickness` — 8–21
- `cableCount`, `cableDiameter`
- `bottomRailEnabled`, `bottomRailHeight`
- `handrailProfile` — round / oval / rectangular / flat
- `handrailDiameter` (or width × height)
- `handrailOffsetFromPost` — 50–100

### 3.7 Materials (PBR, per element)
Elements: `step`, `soffit`, `column`, `balustrade_bars`, `handrail`, `landing`, `glass`.
- `materialPreset` — oak_natural / oak_lacquered / walnut / concrete_grey / concrete_anthracite / marble_white / marble_black / steel_black / steel_inox / brass / white_lacquer / custom
- `baseColor`, `roughness` (0–1), `metallic` (0–1)
- `textureScale`

### 3.8 Scene
- `envPreset` — studio / showroom / interior_warm / interior_cool / dusk / hdri_custom
- `envIntensity` — 0–2
- `backgroundMode` — solid / gradient / hdri_visible / transparent
- `backgroundColor`
- `shadowsEnabled`, `shadowSoftness`
- `cameraPreset` — hero / top / elevation / detail_nosing / underside

### 3.9 Compliance
- `buildingType` — residential / public / auxiliary
- `showValidationOverlay`
- Computed: `blondel` (2h+s), `effectiveWidth`, `minHeadroom`, `walklineDepth`

### 3.10 Export
- `format` — glb / gltf+bin
- `includeMaterials`
- `dracoCompression`
- `unitScale` — meters (GLB std) / mm (debug)
- `includeMetadata` — config in `asset.extras.stairgenConfig`
- `screenshotPNG`

Total: ~65 user-controlled + ~10 computed.

---

## 4. Geometry Generation

**Coordinate system:** Y = vertical, axis = (0, y, 0). Step k occupies sector `[k·dα, (k+1)·dα]` where `dα = sweepAngle/stepCount`, from `R_in = columnRadius` to `R_out`. Top face at `y = (k+1)·rise`.

### 4.1 Step (`buildStepGeometry`)
Cylindrical sector as BufferGeometry built directly (no CSG):
1. Top face — triangle fan with angular segmentation (~12 segm/sector)
2. Bottom face — mirrored top at `y − t`
3. Outer/inner arc walls — quad strips
4. Riser front — rectangle at `k·dα`, between `y−t` and `y`
5. Back closure at `(k+1)·dα` (hidden when merged with neighbor)
6. Nosing — conditional half-cylinder / chamfer / none
7. UV — per-face box projection (UV0 diffuse, UV1 lightmap-ready)
8. Normals — `computeVertexNormals()` + forced hard edges on nosing/riser seams

Performance: ~200–400 tris/step → 30 steps ≈ 10k tris.

### 4.2 Soffit — three modes

**A) `stepped`** — each step is a standalone wedge prism; soffit emerges from bottom faces. Risers optional.

**B) `smooth_helix`** — continuous helical slab of thickness `soffitThickness`. Parametric:
```
for i in 0..N_segments:
  θ = i·dθ                           // dθ = sweepAngle/N
  y = θ/sweepAngle · H               // walkline helix
  outer/inner rings on R_out, R_in at y (top shell) and y − t (bottom shell)
```
Steps sit ON this helix — tops form the stepped treads, underside is a clean spiral. Classic monolithic concrete / bent-laminated wood look. Segmentation `max(stepCount·8, 128)`.

**C) `offset_slab`** — variant of B with bottom shell offset further down (thicker visual slab). Common in reinforced concrete.

Single function `buildSoffitGeometry(config, mode) → BufferGeometry`.

### 4.3 Column
`CylinderGeometry` (solid) or two cylinders with flipped inner normals (tube, no CSG needed). Caps/bases from `SphereGeometry` / `ConeGeometry` / `CylinderGeometry`.

### 4.4 Balustrade
Per step k: 2 bars (front + back of sector) at `R_out − handrailOffsetFromPost`, height `y_top → y_top + railingHeight`. Auto-interpolate additional bars so `max(actualSpacing) ≤ barSpacing`. Each bar = `CylinderGeometry` or `BoxGeometry` per profile, merged into one buffer.

- Glass: flat panels per sector (slight curvature ignored; matches real segmented glass balustrades)
- Cables: `TubeGeometry` along horizontal helices at specified heights

### 4.5 Handrail (`buildRailGeometry`)
Parametric curve:
```
rail(t) = (R_rail·cos(t·α), t·H + railingHeight + stepThickness, R_rail·sin(t·α)),  t ∈ [0,1]
```
`TubeGeometry` with this `Curve`, cross-section per `handrailProfile`.

### 4.6 Landing
`ExtrudeGeometry` from 2D shape (quarter / half / square) + thickness, positioned at top of run.

### 4.7 Pitfalls & solutions
- Z-fighting step/smooth-soffit: 0.1 mm `soffitInset` tolerance
- Arc normals: `computeVertexNormals` + split vertices for hard edges (nose, riser)
- UV seams at θ=0: duplicate vertices on seam
- Walkline depth = `r_walk · dα` (radians); shown live, red if < 250 mm (residential)

---

## 5. Validation (`validators.ts`)

Pure `validate(cfg): Issue[]`. `Issue = {id, severity: 'error'|'warn'|'info', field, message, rule}`.

| Rule | Residential | Public | Auxiliary |
|---|---|---|---|
| `riseHeight` max | 190 | 175 | 220 |
| `walklineDepth` min | 250 | 300 | 200 |
| `effectiveWidth` min | 800 | 1200 | 600 |
| `railingHeight` min | 900 | 1100 | 900 |
| `barSpacing` max | 120 | 120 | 200 |
| `blondel` (2h+s) | 600–650 | 600–650 | info |
| angle/step max | 30° | 30° | 45° |
| `headroom` min | 2000 | 2000 | 1900 |
| `R_out − R_in ≥ effWidth` | yes | yes | yes |

Each rule is a pure function `(cfg) => Issue | null`. Warning text suggests corrective nudge (e.g., "Rise 195 mm > 190 — reduce to 181 mm: set stepCount 16 → 17").

---

## 6. Presets (5)

1. **mieszkanie_beton_140** — H 2900, α 360°, Ø140, R_out 800, smooth_helix t=120, concrete_anthracite, step 40, glass balustrade + inox handrail
2. **mieszkanie_drewno_160** — oak_natural, offset_slab, vertical round Ø16 bars, oak oval handrail 50×40
3. **loft_metal_120** — steel_black, stepped + risers, cable fill 6×Ø6, steel R30 handrail
4. **publiczny_beton_180** — R_out 1100, H 3200, α 450°, railingHeight 1100, both sides
5. **premium_marmur_150** — marble_white, smooth_helix t=100, glass + brass handrail, `envPreset: showroom`

`PresetPicker` = 5 cards (240×160) with cached thumbnail (one-time render to `public/presets/*.png`).

---

## 7. Export

`exportGLB(scene, config, options)`:
1. Traverse `<Stair>` group (exclude helpers, HDRI background)
2. Scale root 0.001 (mm → m)
3. `GLTFExporter.parse(group, { binary: true, includeCustomExtensions: true })`
4. Optional Draco via `DRACOExporter`
5. `gltf.asset.extras.stairgenConfig = JSON.stringify(config)` + version + timestamp
6. Blob → auto-download, filename `stairgen_<presetId>_<ISO>.glb`

Side exports: PNG screenshot (`gl.domElement.toBlob`, preset resolutions 1920×1080 / 2048×2048 / 4K), optional standalone config JSON.

---

## 8. UI Layout (desktop-first, min 1280 px)

```
┌──────────────────────────────────────────────────────────┐
│  [Stairgen]              [Preset ▾]   [Export GLB ⬇]    │  topbar 56
├───────────┬───────────────────────────┬──────────────────┤
│           │                           │                  │
│  LEVA     │     3D CANVAS (R3F)       │   VALIDATION     │
│  320 px   │     OrbitControls         │   Issues live    │
│           │     HDRI env              │                  │
│  folders  │     contact shadow        │   Blondel 62 ✓   │
│  scroll   │                           │   Width 780 ⚠    │
│           │   [hero][top][side]…      │                  │
├───────────┴───────────────────────────┴──────────────────┤
│  H 2900  α 360°  n 16  rise 181  walkDepth 287  2h+s 649 │  status bar
└──────────────────────────────────────────────────────────┘
```

- Leva folders ordered per catalog sections
- Dark theme throughout (matches user's dense/intense aesthetic)
- ValidationPanel clicks → focus corresponding leva field
- Floating camera-preset chips above canvas

---

## 9. Testing

Vitest, no DOM:
- `validators.test.ts` — every rule × 3 building types (table-driven)
- `stepGeometry.test.ts` — known config → expected vertex/tri counts and bounding box
- `soffitGeometry.test.ts` — each mode produces manifold-ish output (no degenerate tris)
- `export.test.ts` — parse exported GLB, verify `asset.extras.stairgenConfig` roundtrip

---

## 10. Out of Scope (v2 roadmap)

- Drag&drop JSON config import
- Multiple runs / winder / landings between runs
- 2D plan + section SVG export with dimensions
- Accessibility profile (PWD)
- "Unfold" animation for presentation

---

## 11. Decisions Log

- **Tech stack:** React + R3F (vs vanilla Three.js) — component model wins with 7+ sub-meshes and materials per element
- **Geometry approach:** direct BufferGeometry (vs CSG) — faster, cleaner topology for PBR UVs, avoids fragile CSG edge cases
- **Soffit modes:** three explicit modes instead of one flex — users think in realization types (concrete monolithic / timber laminated / stepped slab), not abstract thickness values
- **State:** Zustand (vs Redux/Context) — minimal boilerplate, selector-based subscriptions, perfect for high-frequency slider updates
- **Units:** mm in-app, meters in GLB — matches PL convention and glTF standard
