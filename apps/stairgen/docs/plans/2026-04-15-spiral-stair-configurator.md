# Stairgen — Spiral Stair Configurator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web-based interactive configurator for spiral stairs with solid steps and continuous soffit, exhaustively parametric, exporting to GLB with PBR materials.

**Architecture:** Vite + React + R3F single-page app. Zustand store holds one `StairConfig`. Pure geometry builders in `src/geometry/` produce memoized `BufferGeometry` from config. Scene components are thin wrappers around those geometries. Leva drives the panel; validators run as a pure function on every config change.

**Tech Stack:** Vite 5 · React 18 · TypeScript 5 · @react-three/fiber · @react-three/drei · three · three-stdlib · zustand · leva · vitest.

**Reference:** `docs/plans/2026-04-15-spiral-stair-configurator-design.md`

---

## Phase 0 — Project Bootstrap

### Task 1: Scaffold Vite + React + TS project

**Files:** project root

**Step 1: Init Vite**

Run:
```bash
cd c:/Users/Przemek/Desktop/Stairgen
npm create vite@latest . -- --template react-ts
```
When prompted "directory not empty" → accept/ignore (docs/ already exists).

**Step 2: Install runtime deps**

```bash
npm install three @react-three/fiber @react-three/drei three-stdlib zustand leva
npm install -D @types/three vitest @vitest/ui jsdom
```

**Step 3: Configure TS strict**

Edit `tsconfig.json` — ensure `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`.

**Step 4: Add vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { globals: true, environment: 'node' },
});
```

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

**Step 5: Init git and commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Vite + React + TS + R3F toolchain"
```

---

### Task 2: Clean template, set up folder structure

**Files:**
- Delete: default `src/App.css`, `src/assets/`, boilerplate in `src/App.tsx`
- Create: `src/config/`, `src/geometry/`, `src/scene/`, `src/ui/`, `src/export/`, `src/store/` (each with `.gitkeep`)

**Step 1: Delete boilerplate**

```bash
rm src/App.css src/assets/react.svg
```

**Step 2: Replace `src/App.tsx`**

```tsx
export default function App() {
  return <div style={{ padding: 16 }}>Stairgen — booting…</div>;
}
```

**Step 3: Create folder skeleton**

```bash
mkdir -p src/config src/geometry src/scene src/ui src/export src/store
touch src/config/.gitkeep src/geometry/.gitkeep src/scene/.gitkeep src/ui/.gitkeep src/export/.gitkeep src/store/.gitkeep
```

**Step 4: Verify dev server**

Run `npm run dev` — open browser, confirm "Stairgen — booting…" renders.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold folder structure"
```

---

## Phase 1 — Config Types, Defaults, Store

### Task 3: Define `StairConfig` types

**Files:**
- Create: `src/config/types.ts`

**Step 1: Write the types**

```ts
// src/config/types.ts
export type BuildingType = 'residential' | 'public' | 'auxiliary';
export type Direction = 'CW' | 'CCW';
export type NosingType = 'none' | 'square' | 'rounded' | 'chamfer';
export type TopFinish = 'flat' | 'antislip_grooves' | 'none';
export type SoffitMode = 'stepped' | 'smooth_helix' | 'offset_slab';
export type ColumnType = 'solid' | 'tube' | 'none';
export type ColumnCap = 'flat' | 'dome' | 'spike' | 'none';
export type ColumnBase = 'flat' | 'flange' | 'plinth' | 'none';
export type LandingShape = 'none' | 'quarter' | 'half' | 'square' | 'custom';
export type EdgeProfile = 'square' | 'bullnose' | 'chamfer';
export type RailingSide = 'outer' | 'inner' | 'both';
export type FillType = 'vertical_bars' | 'horizontal_bars' | 'glass' | 'cable' | 'panels';
export type BarProfile = 'round' | 'square' | 'flat';
export type HandrailProfile = 'round' | 'oval' | 'rectangular' | 'flat';
export type MaterialPreset =
  | 'oak_natural' | 'oak_lacquered' | 'walnut'
  | 'concrete_grey' | 'concrete_anthracite'
  | 'marble_white' | 'marble_black'
  | 'steel_black' | 'steel_inox' | 'brass' | 'white_lacquer' | 'custom';
export type EnvPreset = 'studio' | 'showroom' | 'interior_warm' | 'interior_cool' | 'dusk' | 'hdri_custom';
export type BackgroundMode = 'solid' | 'gradient' | 'hdri_visible' | 'transparent';
export type CameraPreset = 'hero' | 'top' | 'elevation' | 'detail_nosing' | 'underside';

export interface MaterialConfig {
  preset: MaterialPreset;
  baseColor: string; // hex
  roughness: number; // 0..1
  metallic: number;  // 0..1
  textureScale: number;
}

export interface StairConfig {
  // 3.1 geometry
  totalHeight: number;
  sweepAngle: number;
  direction: Direction;
  outerRadius: number;
  walkLineRatio: number;

  // 3.2 steps
  stepCount: number;
  stepCountAuto: boolean;
  stepThickness: number;
  nosingType: NosingType;
  nosingRadius: number;
  chamferSize: number;
  nosingOvershoot: number;
  edgeRoundingTop: number;
  edgeRoundingBottom: number;
  topFinish: TopFinish;

  // 3.3 soffit
  soffitMode: SoffitMode;
  soffitThickness: number;
  soffitInset: number;
  risersEnabled: boolean;

  // 3.4 column
  columnType: ColumnType;
  columnDiameter: number;
  columnWallThickness: number;
  columnTopCap: ColumnCap;
  columnBottomBase: ColumnBase;
  columnBaseDiameter: number;
  columnBaseHeight: number;

  // 3.5 landing
  landingShape: LandingShape;
  landingWidth: number;
  landingDepth: number;
  landingOverhang: number;
  landingThickness: number;
  landingEdgeProfile: EdgeProfile;

  // 3.6 balustrade
  railingEnabled: boolean;
  railingHeight: number;
  railingSide: RailingSide;
  fillType: FillType;
  barSpacing: number;
  barDiameter: number;
  barProfile: BarProfile;
  glassThickness: number;
  cableCount: number;
  cableDiameter: number;
  bottomRailEnabled: boolean;
  bottomRailHeight: number;
  handrailProfile: HandrailProfile;
  handrailDiameter: number;
  handrailOffsetFromPost: number;

  // 3.7 materials
  materials: {
    step: MaterialConfig;
    soffit: MaterialConfig;
    column: MaterialConfig;
    bars: MaterialConfig;
    handrail: MaterialConfig;
    landing: MaterialConfig;
    glass: MaterialConfig;
  };

  // 3.8 scene
  envPreset: EnvPreset;
  envIntensity: number;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  shadowsEnabled: boolean;
  shadowSoftness: number;
  cameraPreset: CameraPreset;

  // 3.9 compliance
  buildingType: BuildingType;
  showValidationOverlay: boolean;

  // 3.10 export
  exportFormat: 'glb' | 'gltf+bin';
  exportIncludeMaterials: boolean;
  exportDraco: boolean;
  exportUnitScale: 'meters' | 'mm';
  exportIncludeMetadata: boolean;
  exportScreenshotPNG: boolean;
}

export type Severity = 'error' | 'warn' | 'info';
export interface Issue {
  id: string;
  severity: Severity;
  field: keyof StairConfig | string;
  message: string;
  rule: string;
}

export interface ComputedMetrics {
  riseHeight: number;
  walklineDepth: number;
  effectiveWidth: number;
  blondel: number;
  stepAngle: number;
  columnRadius: number;
}
```

**Step 2: Commit**

```bash
git add src/config/types.ts
git commit -m "feat(config): define StairConfig and Issue types"
```

---

### Task 4: Defaults and computed metrics

**Files:**
- Create: `src/config/defaults.ts`
- Create: `src/config/metrics.ts`
- Create: `src/config/metrics.test.ts`

**Step 1: Write failing test for metrics**

```ts
// src/config/metrics.test.ts
import { describe, it, expect } from 'vitest';
import { computeMetrics } from './metrics';
import { DEFAULT_CONFIG } from './defaults';

describe('computeMetrics', () => {
  it('computes rise from totalHeight and stepCount', () => {
    const m = computeMetrics({ ...DEFAULT_CONFIG, totalHeight: 2900, stepCount: 16 });
    expect(m.riseHeight).toBeCloseTo(181.25, 2);
  });

  it('computes walkline depth from stepAngle and walkline radius', () => {
    const m = computeMetrics({ ...DEFAULT_CONFIG, totalHeight: 2900, stepCount: 16, sweepAngle: 360, outerRadius: 800, columnDiameter: 140, walkLineRatio: 0.5 });
    const expectedR = (800 + 70) / 2; // 435
    const expectedAngle = (360 / 16) * Math.PI / 180;
    expect(m.walklineDepth).toBeCloseTo(expectedR * expectedAngle, 2);
  });

  it('computes Blondel as 2*rise + walklineDepth', () => {
    const m = computeMetrics(DEFAULT_CONFIG);
    expect(m.blondel).toBeCloseTo(2 * m.riseHeight + m.walklineDepth, 3);
  });
});
```

**Step 2: Run — expect fail**

`npm test` → fails (`computeMetrics` not defined).

**Step 3: Write defaults**

```ts
// src/config/defaults.ts
import type { StairConfig, MaterialConfig } from './types';

const mat = (preset: MaterialConfig['preset'], baseColor: string, roughness: number, metallic: number): MaterialConfig => ({
  preset, baseColor, roughness, metallic, textureScale: 1,
});

export const DEFAULT_CONFIG: StairConfig = {
  totalHeight: 2900, sweepAngle: 360, direction: 'CW', outerRadius: 800, walkLineRatio: 0.5,
  stepCount: 16, stepCountAuto: true, stepThickness: 40,
  nosingType: 'rounded', nosingRadius: 8, chamferSize: 4, nosingOvershoot: 20,
  edgeRoundingTop: 2, edgeRoundingBottom: 2, topFinish: 'flat',
  soffitMode: 'smooth_helix', soffitThickness: 120, soffitInset: 0.1, risersEnabled: false,
  columnType: 'solid', columnDiameter: 140, columnWallThickness: 6,
  columnTopCap: 'flat', columnBottomBase: 'flange', columnBaseDiameter: 260, columnBaseHeight: 20,
  landingShape: 'quarter', landingWidth: 900, landingDepth: 900, landingOverhang: 0,
  landingThickness: 40, landingEdgeProfile: 'bullnose',
  railingEnabled: true, railingHeight: 1000, railingSide: 'outer',
  fillType: 'vertical_bars', barSpacing: 110, barDiameter: 14, barProfile: 'round',
  glassThickness: 10, cableCount: 6, cableDiameter: 6,
  bottomRailEnabled: false, bottomRailHeight: 100,
  handrailProfile: 'round', handrailDiameter: 42, handrailOffsetFromPost: 60,
  materials: {
    step:     mat('oak_natural',     '#b68654', 0.55, 0.0),
    soffit:   mat('concrete_grey',   '#cccccc', 0.85, 0.0),
    column:   mat('steel_black',     '#1a1a1a', 0.4,  1.0),
    bars:     mat('steel_black',     '#1a1a1a', 0.4,  1.0),
    handrail: mat('steel_inox',      '#c8c8c8', 0.3,  1.0),
    landing:  mat('oak_natural',     '#b68654', 0.55, 0.0),
    glass:    mat('custom',          '#e8f0f5', 0.05, 0.0),
  },
  envPreset: 'studio', envIntensity: 1, backgroundMode: 'gradient', backgroundColor: '#1a1d22',
  shadowsEnabled: true, shadowSoftness: 0.7, cameraPreset: 'hero',
  buildingType: 'residential', showValidationOverlay: true,
  exportFormat: 'glb', exportIncludeMaterials: true, exportDraco: false,
  exportUnitScale: 'meters', exportIncludeMetadata: true, exportScreenshotPNG: false,
};
```

**Step 4: Write metrics module**

```ts
// src/config/metrics.ts
import type { StairConfig, ComputedMetrics } from './types';

export function computeMetrics(c: StairConfig): ComputedMetrics {
  const riseHeight = c.totalHeight / c.stepCount;
  const stepAngle = c.sweepAngle / c.stepCount;
  const columnRadius = c.columnDiameter / 2;
  const effectiveWidth = c.outerRadius - columnRadius;
  const walklineRadius = columnRadius + effectiveWidth * c.walkLineRatio;
  const walklineDepth = walklineRadius * (stepAngle * Math.PI / 180);
  const blondel = 2 * riseHeight + walklineDepth;
  return { riseHeight, walklineDepth, effectiveWidth, blondel, stepAngle, columnRadius };
}
```

**Step 5: Run tests, expect pass**

`npm test` → all 3 green.

**Step 6: Commit**

```bash
git add src/config/defaults.ts src/config/metrics.ts src/config/metrics.test.ts
git commit -m "feat(config): add defaults and computed metrics"
```

---

### Task 5: Zustand store

**Files:**
- Create: `src/store/useStairStore.ts`
- Create: `src/store/useStairStore.test.ts`

**Step 1: Failing test**

```ts
// src/store/useStairStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useStairStore } from './useStairStore';
import { DEFAULT_CONFIG } from '../config/defaults';

describe('useStairStore', () => {
  beforeEach(() => useStairStore.getState().reset());

  it('has DEFAULT_CONFIG initially', () => {
    expect(useStairStore.getState().config).toEqual(DEFAULT_CONFIG);
  });

  it('update() changes a single field', () => {
    useStairStore.getState().update({ totalHeight: 3000 });
    expect(useStairStore.getState().config.totalHeight).toBe(3000);
  });

  it('applyPreset() merges partial into config', () => {
    useStairStore.getState().applyPreset({ stepCount: 20, outerRadius: 900 });
    const c = useStairStore.getState().config;
    expect(c.stepCount).toBe(20);
    expect(c.outerRadius).toBe(900);
    expect(c.totalHeight).toBe(DEFAULT_CONFIG.totalHeight);
  });
});
```

**Step 2: Run — fail**

**Step 3: Implement store**

```ts
// src/store/useStairStore.ts
import { create } from 'zustand';
import type { StairConfig } from '../config/types';
import { DEFAULT_CONFIG } from '../config/defaults';

interface State {
  config: StairConfig;
  update: (patch: Partial<StairConfig>) => void;
  applyPreset: (preset: Partial<StairConfig>) => void;
  reset: () => void;
}

export const useStairStore = create<State>((set) => ({
  config: DEFAULT_CONFIG,
  update: (patch) => set((s) => ({ config: { ...s.config, ...patch } })),
  applyPreset: (preset) => set((s) => ({ config: { ...s.config, ...preset } })),
  reset: () => set({ config: DEFAULT_CONFIG }),
}));
```

**Step 4: Run tests — pass**

**Step 5: Commit**

```bash
git add src/store/
git commit -m "feat(store): zustand store with update/preset/reset"
```

---

## Phase 2 — Validation Engine

### Task 6: Validator rule framework + rise rule

**Files:**
- Create: `src/config/validators.ts`
- Create: `src/config/validators.test.ts`

**Step 1: Failing test for rise rule**

```ts
// src/config/validators.test.ts
import { describe, it, expect } from 'vitest';
import { validate } from './validators';
import { DEFAULT_CONFIG } from './defaults';

describe('rule: riseHeight max', () => {
  it('residential: rise > 190 → error', () => {
    const issues = validate({ ...DEFAULT_CONFIG, totalHeight: 3500, stepCount: 16, buildingType: 'residential' });
    expect(issues.find(i => i.rule === 'rise_max')?.severity).toBe('error');
  });
  it('residential: rise = 180 → no rise_max issue', () => {
    const issues = validate({ ...DEFAULT_CONFIG, totalHeight: 2880, stepCount: 16, buildingType: 'residential' });
    expect(issues.find(i => i.rule === 'rise_max')).toBeUndefined();
  });
  it('public: threshold is tighter (175)', () => {
    const issues = validate({ ...DEFAULT_CONFIG, totalHeight: 2880, stepCount: 16, buildingType: 'public' });
    expect(issues.find(i => i.rule === 'rise_max')?.severity).toBe('error');
  });
});
```

**Step 2: Run — fail**

**Step 3: Implement**

```ts
// src/config/validators.ts
import type { StairConfig, Issue, BuildingType } from './types';
import { computeMetrics } from './metrics';

type Thresholds = {
  riseMax: number; walkMin: number; widthMin: number; railMin: number;
  barSpacingMax: number; stepAngleMax: number; headroomMin: number;
};

const T: Record<BuildingType, Thresholds> = {
  residential: { riseMax: 190, walkMin: 250, widthMin: 800,  railMin: 900,  barSpacingMax: 120, stepAngleMax: 30, headroomMin: 2000 },
  public:      { riseMax: 175, walkMin: 300, widthMin: 1200, railMin: 1100, barSpacingMax: 120, stepAngleMax: 30, headroomMin: 2000 },
  auxiliary:   { riseMax: 220, walkMin: 200, widthMin: 600,  railMin: 900,  barSpacingMax: 200, stepAngleMax: 45, headroomMin: 1900 },
};

type Rule = (c: StairConfig, t: Thresholds) => Issue | null;

const ruleRiseMax: Rule = (c, t) => {
  const { riseHeight } = computeMetrics(c);
  if (riseHeight > t.riseMax) return {
    id: 'rise_max', rule: 'rise_max', severity: 'error', field: 'stepCount',
    message: `Wysokość stopnia ${riseHeight.toFixed(0)} mm > dopuszczalne ${t.riseMax} mm. Zwiększ liczbę stopni.`,
  };
  return null;
};

const RULES: Rule[] = [ruleRiseMax];

export function validate(c: StairConfig): Issue[] {
  const t = T[c.buildingType];
  return RULES.map(r => r(c, t)).filter((x): x is Issue => x !== null);
}
```

**Step 4: Run tests — pass**

**Step 5: Commit**

```bash
git add src/config/validators.ts src/config/validators.test.ts
git commit -m "feat(validators): rise_max rule with building-type thresholds"
```

---

### Task 7: Remaining validator rules

**Files:** modify `src/config/validators.ts` and `validators.test.ts`

**Step 1: Add failing tests for each rule**

Append to `validators.test.ts` — one `describe` block per rule: `walkline_min`, `width_min`, `rail_height_min`, `bar_spacing_max`, `blondel_range`, `step_angle_max`, `width_vs_radius`. For each rule: positive and negative case.

Example skeleton:
```ts
describe('rule: walkline depth min', () => {
  it('residential: depth < 250 → error', () => {
    const cfg = { ...DEFAULT_CONFIG, stepCount: 40 }; // forces small depth
    const issues = validate(cfg);
    expect(issues.find(i => i.rule === 'walk_min')?.severity).toBe('error');
  });
  it('residential: depth >= 250 → no issue', () => {
    const issues = validate(DEFAULT_CONFIG);
    expect(issues.find(i => i.rule === 'walk_min')).toBeUndefined();
  });
});
```

Write similar pairs for each rule listed above. **Total new tests: ~14.**

**Step 2: Run — fail**

**Step 3: Implement each rule**

Append to `validators.ts`:
```ts
const ruleWalkMin: Rule = (c, t) => {
  const { walklineDepth } = computeMetrics(c);
  return walklineDepth < t.walkMin
    ? { id: 'walk_min', rule: 'walk_min', severity: 'error', field: 'walkLineRatio', message: `Głębokość na linii marszu ${walklineDepth.toFixed(0)} mm < ${t.walkMin} mm.` }
    : null;
};

const ruleWidthMin: Rule = (c, t) => {
  const { effectiveWidth } = computeMetrics(c);
  return effectiveWidth < t.widthMin
    ? { id: 'width_min', rule: 'width_min', severity: 'error', field: 'outerRadius', message: `Szerokość użytkowa ${effectiveWidth.toFixed(0)} mm < ${t.widthMin} mm.` }
    : null;
};

const ruleRailHeight: Rule = (c, t) =>
  c.railingEnabled && c.railingHeight < t.railMin
    ? { id: 'rail_h_min', rule: 'rail_h_min', severity: 'error', field: 'railingHeight', message: `Wysokość pochwytu ${c.railingHeight} < ${t.railMin} mm.` }
    : null;

const ruleBarSpacing: Rule = (c, t) =>
  c.fillType === 'vertical_bars' && c.barSpacing > t.barSpacingMax
    ? { id: 'bar_spc_max', rule: 'bar_spc_max', severity: 'error', field: 'barSpacing', message: `Rozstaw tralek ${c.barSpacing} > ${t.barSpacingMax} mm.` }
    : null;

const ruleBlondel: Rule = (c) => {
  const { blondel } = computeMetrics(c);
  if (blondel < 600 || blondel > 650)
    return { id: 'blondel', rule: 'blondel', severity: 'warn', field: 'stepCount',
      message: `2h+s = ${blondel.toFixed(0)} poza 600–650 mm (wzór Blondela).` };
  return null;
};

const ruleStepAngle: Rule = (c, t) => {
  const { stepAngle } = computeMetrics(c);
  return stepAngle > t.stepAngleMax
    ? { id: 'step_angle', rule: 'step_angle', severity: 'warn', field: 'stepCount', message: `Kąt stopnia ${stepAngle.toFixed(1)}° > ${t.stepAngleMax}°.` }
    : null;
};

const ruleWidthVsRadius: Rule = (c, t) => {
  const { effectiveWidth } = computeMetrics(c);
  return effectiveWidth < t.widthMin
    ? null // already reported by widthMin
    : null;
};

const RULES: Rule[] = [ruleRiseMax, ruleWalkMin, ruleWidthMin, ruleRailHeight, ruleBarSpacing, ruleBlondel, ruleStepAngle, ruleWidthVsRadius];
```

**Step 4: Run all tests — green**

**Step 5: Commit**

```bash
git add src/config/validators.ts src/config/validators.test.ts
git commit -m "feat(validators): add walkline, width, rail, spacing, blondel, angle rules"
```

---

## Phase 3 — Geometry

### Task 8: Step geometry — basic wedge

**Files:**
- Create: `src/geometry/stepGeometry.ts`
- Create: `src/geometry/stepGeometry.test.ts`

**Step 1: Failing test**

```ts
// src/geometry/stepGeometry.test.ts
import { describe, it, expect } from 'vitest';
import { buildStepGeometry } from './stepGeometry';
import { DEFAULT_CONFIG } from '../config/defaults';

describe('buildStepGeometry', () => {
  it('produces non-empty BufferGeometry', () => {
    const g = buildStepGeometry(DEFAULT_CONFIG, 0);
    expect(g.getAttribute('position').count).toBeGreaterThan(20);
  });

  it('bounding box respects outerRadius', () => {
    const g = buildStepGeometry(DEFAULT_CONFIG, 0);
    g.computeBoundingBox();
    const bb = g.boundingBox!;
    const maxR = Math.max(Math.abs(bb.max.x), Math.abs(bb.min.x), Math.abs(bb.max.z), Math.abs(bb.min.z));
    expect(maxR).toBeLessThanOrEqual(DEFAULT_CONFIG.outerRadius + DEFAULT_CONFIG.nosingOvershoot + 1);
  });

  it('step k sits at height k*rise to (k+1)*rise', () => {
    const cfg = { ...DEFAULT_CONFIG };
    const g = buildStepGeometry(cfg, 2);
    g.computeBoundingBox();
    const rise = cfg.totalHeight / cfg.stepCount;
    expect(g.boundingBox!.max.y).toBeCloseTo(3 * rise, 1);
    expect(g.boundingBox!.min.y).toBeCloseTo(3 * rise - cfg.stepThickness, 1);
  });
});
```

**Step 2: Run — fail**

**Step 3: Implement basic wedge (nosing = square for now)**

Full implementation in design doc Section 4.1 — build BufferGeometry with inner/outer arc rings at top and bottom, stitch into top face, bottom face, outer/inner walls, riser front, back closure. ARC_SEGMENTS = 12.

**Step 4: Run — pass**

**Step 5: Commit**

```bash
git add src/geometry/stepGeometry.ts src/geometry/stepGeometry.test.ts
git commit -m "feat(geometry): basic step wedge geometry"
```

---

### Task 9: Step nosing variants

Extend `stepGeometry.ts` with rounded and chamfer nosing profiles, sweeping a 2D cross-section along the outer edge. Tests assert vertex-count differences.

Commit: `feat(geometry): nosing variants (rounded, chamfer)`

---

### Task 10: Soffit — `stepped` mode

Create `src/geometry/soffitGeometry.ts` + test. In `stepped` mode returns empty unless `risersEnabled`, then produces vertical quads between adjacent step heights.

Commit: `feat(geometry): stepped soffit mode (risers)`

---

### Task 11: Soffit — `smooth_helix` mode

Continuous helical slab per design doc Section 4.2. N=max(stepCount*8,128) angular segments, 4 rings (inner/outer × top/bottom), stitched as top shell, bottom shell, outer side, inner side, with end caps.

Commit: `feat(geometry): smooth_helix soffit mode`

---

### Task 12: Soffit — `offset_slab` mode

Delegate to `buildSmoothHelix` with `soffitThickness + stepThickness`.

Commit: `feat(geometry): offset_slab soffit mode`

---

### Task 13: Column geometry

CylinderGeometry shaft + optional dome/spike top cap + optional flange/plinth base, merged via `mergeGeometries` from three-stdlib.

Commit: `feat(geometry): central column with caps/bases`

---

### Task 14: Balustrade — vertical bars

Per step, 2 bars at front and midpoint of sector at `Rout − handrailOffsetFromPost`. Cylinder or Box per `barProfile`. Handles `outer`/`inner`/`both` sides.

Commit: `feat(geometry): vertical-bar balustrade`

---

### Task 15: Balustrade — glass, cable, horizontal

Glass: per-sector flat `BoxGeometry` panels. Cable: N horizontal helical tubes via segmented cylinders. Horizontal bars: similar to cable but fewer, thicker.

Commit: `feat(geometry): glass and cable balustrade fills`

---

### Task 16: Handrail helical tube

Custom `HelixCurve extends Curve<Vector3>` + `TubeGeometry`. Cross-section per `handrailProfile` (radialSegments).

Commit: `feat(geometry): helical handrail tube`

---

### Task 17: Landing geometry

`ExtrudeGeometry` from 2D `Shape` — quarter/half pie-slice or square. Rotated and translated to top of run.

Commit: `feat(geometry): landing shapes (quarter/half/square)`

---

### Task 18: Material presets

`buildMaterial(cfg): MeshStandardMaterial` — maps `MaterialConfig` to three.js material. Presets live in `defaults.ts` and `presets.ts`.

Commit: `feat(materials): MeshStandardMaterial factory`

---

## Phase 4 — Scene

### Task 19: Scene skeleton with Canvas

`App.tsx` with R3F `<Canvas shadows>`, ambient+directional lights, `<OrbitControls>`, grid helper. Empty `<Stair>` placeholder.

Commit: `feat(scene): R3F canvas with orbit controls and grid`

---

### Task 20: `<Stair>` composition

Create `Step/Soffit/Column/Balustrade/Rail/Landing` sub-components, each reading relevant config slice via `useStairStore` selector and memoizing geometry. `<Stair>` composes all.

Commit: `feat(scene): compose Stair from memoized geometry components`

---

### Task 21: Environment HDRI + shadows

`SceneEnvironment` wraps drei `<Environment>` with preset mapping + optional `<ContactShadows>` under the stair. Background mode controlled from store.

Commit: `feat(scene): HDRI environment + contact shadows`

---

### Task 22: Camera presets

`CameraRig` component reads `cameraPreset` and imperatively sets camera position + lookAt on change.

Commit: `feat(scene): camera preset rig`

---

## Phase 5 — UI

### Task 23: Leva ControlPanel — Geometria folder

Wire leva `useControls` to store `update()` for the Geometria folder fields. Mounted outside Canvas.

Commit: `feat(ui): leva control panel — Geometria folder`

---

### Task 24: ControlPanel — all folders

Add remaining folders: Stopnie, Podniebienie, Słup, Spocznik, Balustrada, Materiały (nested per element), Scena, Zgodność, Export.

Commit: `feat(ui): full leva control panel (all sections)`

---

### Task 25: ValidationPanel

Right-side panel rendering `validate(cfg)` output. Dark theme, severity-colored left border, scrollable.

Commit: `feat(ui): live validation panel`

---

### Task 26: StatusBar

Bottom strip showing computed metrics (H, α, n, rise, walkDepth, width, Blondel).

Commit: `feat(ui): computed-metrics status bar`

---

### Task 27: Topbar + final layout

Fixed topbar (logo, preset button placeholder, export button placeholder). Canvas container inset by topbar/left/right/bottom. Leva pinned left width 320.

Commit: `feat(ui): final 3-column + topbar + status bar layout`

---

## Phase 6 — Export

### Task 28: GLB export (basic)

`exportSceneToGLB(object, config, opts)` — uses `GLTFExporter` from three-stdlib. Scales root by 0.001 for mm→m. If `includeMetadata`, parses the JSON chunk of the GLB and injects `asset.extras.stairgenConfig`. Returns `Blob`.

Test roundtrips the GLB via `GLTFLoader` and verifies extras survive.

Commit: `feat(export): GLB export with config metadata in asset.extras`

---

### Task 29: Export button + download

`<ExportButton>` dispatches `stairgen:export` event. `<ExportListener>` inside Canvas listens, finds `scene.getObjectByName('StairRoot')`, calls `exportSceneToGLB`, triggers download.

Commit: `feat(export): wire Export button to GLB download`

---

## Phase 7 — Presets

### Task 30: 5 presets

`src/config/presets.ts` with 5 entries (`mieszkanie_beton_140`, `mieszkanie_drewno_160`, `loft_metal_120`, `publiczny_beton_180`, `premium_marmur_150`) as `Partial<StairConfig>` + material overrides. `applyPreset(base, id)` merges them.

Commit: `feat(presets): 5 realization presets with materials`

---

### Task 31: Preset picker UI

`<PresetPicker>` — dropdown with 5 named presets; click calls `applyPreset(base, id)` and pushes to store.

Commit: `feat(ui): preset picker dropdown`

---

## Phase 8 — Polish

### Task 32: Manual QA pass

Run through checklist (each preset, each slider, each validator rule, GLB roundtrip, 60 fps target). Record results in `docs/qa-checklist.md`.

Commit: `docs: manual QA checklist results`

---

### Task 33: README

Short README describing the app, install/run, presets, export workflow.

Commit: `docs: README`

---

## Done — v1 ships when all 33 tasks are green.
