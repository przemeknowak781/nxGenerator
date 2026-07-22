# Stairgen QA Checklist

**Date:** 2026-04-15
**Version:** v0.1.0 (post-Task 33)

## Automated gates (all passing)

- [x] `npm test` — **62 tests** green across 11 test files
  - metrics (3), store (3), validators (21 across 7 rules × 3 building types), stepGeometry (7), soffitGeometry (5), columnGeometry (3), balustradeGeometry (6), railGeometry (3), landingGeometry (4), materials (3), presets (4)
- [x] `npx tsc -b --noEmit` — clean under `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- [x] `npm run build` — production bundle builds successfully (1.4 MB raw / 401 KB gzipped)
- [x] `npm run dev` — Vite dev server starts in <300 ms

## Manual (browser) QA — to run in browser

Open `npm run dev` → http://localhost:5173 and verify:

### Scene rendering
- [ ] Spiral stair renders with all components (column, steps, soffit, balustrade, handrail, landing)
- [ ] Default config (16 steps, 360° sweep, oak + concrete + inox) looks visually correct
- [ ] HDRI environment lights the model (studio preset)
- [ ] Orbit controls work (drag, zoom, pan)
- [ ] 60 fps stable with 16 steps

### Leva control panel (all 9 folders)
- [ ] Geometria: sliders update geometry live (totalHeight, sweepAngle, outerRadius, etc.)
- [ ] Stopnie: stepCount, nosing variants (none/square/rounded/chamfer) visible
- [ ] Podniebienie: 3 soffit modes (stepped + risers / smooth_helix / offset_slab) produce distinct visuals
- [ ] Słup centralny: diameter, top cap (flat/dome/spike), base (flange/plinth)
- [ ] Spocznik: quarter/half/square shapes at top
- [ ] Balustrada: 5 fill types (vertical_bars / horizontal_bars / glass / cable / panels), inner/outer/both sides
- [ ] Materiały: color picks affect steps, soffit, column, bars, handrail
- [ ] Scena: envPreset switching (studio/showroom/interior_warm/interior_cool/dusk), shadow toggle, camera preset chips
- [ ] Zgodność: buildingType switch updates validator thresholds

### Validation panel (right side)
- [ ] Default config shows 2 issues (walk_min error, blondel warn) — both below thresholds for residential
- [ ] Applying "Publiczny · beton Ø180" preset clears walk_min (wider stair) but keeps tighter public thresholds
- [ ] Applying "Loft · metal Ø120" preset triggers step_angle warn (α=450°/stepCount → > 30°)
- [ ] `railingEnabled: false` hides rail_h_min rule

### Status bar (bottom)
- [ ] Shows live H, α, n, rise, walkDepth, width, 2h+s values
- [ ] Values update immediately with leva changes

### Presets (5)
- [ ] Mieszkanie · beton Ø140 — dark concrete + glass + inox
- [ ] Mieszkanie · drewno Ø160 — oak + vertical bars
- [ ] Loft · metal Ø120 — black steel + cables + stepped+risers
- [ ] Publiczny · beton Ø180 — grey concrete + both-side bars + 1100mm rail
- [ ] Premium · marmur Ø150 — white marble + glass + brass handrail + showroom HDRI

### Export
- [ ] Click "Export GLB ⬇" triggers download `stairgen_<timestamp>.glb`
- [ ] Open downloaded GLB in https://gltf-viewer.donmccurdy.com/
- [ ] Model renders correctly in external viewer
- [ ] Model is scaled in meters (orbit distance reasonable)
- [ ] Materials preserved (colors, roughness, metalness)
- [ ] Parse `asset.extras.stairgenConfig` from the GLB and confirm it's valid JSON matching the current config

## Known limitations (v0.1.0 → v2 backlog)

- No PBR texture maps (only baseColor/roughness/metalness). Textures would need `TextureLoader` + `textureScale` usage.
- No Draco compression in export (toggle exists in config but path not wired)
- Screenshot PNG export not implemented (flag exists)
- JSON config import / drag&drop — v2
- Multiple stair runs, winder, accessibility (PWD) profile — v2
- 2D plan/section SVG export with dimensioning — v2
- Camera preset chips above canvas not yet rendered (preset is selectable via leva Scene folder)

## Code health

- 62 unit tests
- `erasableSyntaxOnly` flag respected (no parameter properties, no enums)
- All geometry builders memoized per-element in scene components
- Zustand single-store pattern — no prop drilling
- Dead code: no unused exports flagged during build
