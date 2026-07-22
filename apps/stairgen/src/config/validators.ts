import type { StairConfig, Issue, BuildingType } from './types';
import { computeMetrics } from './metrics';

type Thresholds = {
  riseMax: number;
  walkMin: number;
  widthMin: number;
  railMin: number;
  barSpacingMax: number;
  stepAngleMax: number;
  headroomMin: number;
};

const T: Record<BuildingType, Thresholds> = {
  residential: { riseMax: 190, walkMin: 250, widthMin: 800,  railMin: 900,  barSpacingMax: 120, stepAngleMax: 30, headroomMin: 2000 },
  public:      { riseMax: 175, walkMin: 300, widthMin: 1200, railMin: 1100, barSpacingMax: 120, stepAngleMax: 30, headroomMin: 2000 },
  auxiliary:   { riseMax: 220, walkMin: 200, widthMin: 600,  railMin: 900,  barSpacingMax: 200, stepAngleMax: 45, headroomMin: 1900 },
};

type Rule = (c: StairConfig, t: Thresholds) => Issue | null;

const ruleRiseMax: Rule = (c, t) => {
  const { riseHeight } = computeMetrics(c);
  if (riseHeight > t.riseMax) {
    return {
      id: 'rise_max', rule: 'rise_max', severity: 'error', field: 'stepCount',
      message: `Wysokość stopnia ${riseHeight.toFixed(0)} mm > dopuszczalne ${t.riseMax} mm. Zwiększ liczbę stopni.`,
    };
  }
  return null;
};

const ruleWalkMin: Rule = (c, t) => {
  const { walklineDepth } = computeMetrics(c);
  if (walklineDepth < t.walkMin) {
    return {
      id: 'walk_min', rule: 'walk_min', severity: 'error', field: 'walkLineRatio',
      message: `Głębokość na linii marszu ${walklineDepth.toFixed(0)} mm < ${t.walkMin} mm.`,
    };
  }
  return null;
};

const ruleWidthMin: Rule = (c, t) => {
  const { effectiveWidth } = computeMetrics(c);
  if (effectiveWidth < t.widthMin) {
    return {
      id: 'width_min', rule: 'width_min', severity: 'error', field: 'outerRadius',
      message: `Szerokość użytkowa ${effectiveWidth.toFixed(0)} mm < ${t.widthMin} mm.`,
    };
  }
  return null;
};

const ruleRailHeight: Rule = (c, t) => {
  if (!c.railingEnabled) return null;
  if (c.railingHeight < t.railMin) {
    return {
      id: 'rail_h_min', rule: 'rail_h_min', severity: 'error', field: 'railingHeight',
      message: `Wysokość pochwytu ${c.railingHeight} mm < ${t.railMin} mm.`,
    };
  }
  return null;
};

const ruleBarSpacing: Rule = (c, t) => {
  if (!c.railingEnabled || c.fillType !== 'vertical_bars') return null;
  if (c.barSpacing > t.barSpacingMax) {
    return {
      id: 'bar_spc_max', rule: 'bar_spc_max', severity: 'error', field: 'barSpacing',
      message: `Rozstaw tralek ${c.barSpacing} mm > ${t.barSpacingMax} mm.`,
    };
  }
  return null;
};

const ruleBlondel: Rule = (c) => {
  const { blondel } = computeMetrics(c);
  if (blondel < 600 || blondel > 650) {
    return {
      id: 'blondel', rule: 'blondel', severity: 'warn', field: 'stepCount',
      message: `2h+s = ${blondel.toFixed(0)} mm poza optimum 600–650 mm (wzór Blondela).`,
    };
  }
  return null;
};

const ruleStepAngle: Rule = (c, t) => {
  const { stepAngle } = computeMetrics(c);
  if (stepAngle > t.stepAngleMax) {
    return {
      id: 'step_angle', rule: 'step_angle', severity: 'warn', field: 'stepCount',
      message: `Kąt stopnia ${stepAngle.toFixed(1)}° > ${t.stepAngleMax}°.`,
    };
  }
  return null;
};

const RULES: Rule[] = [
  ruleRiseMax, ruleWalkMin, ruleWidthMin,
  ruleRailHeight, ruleBarSpacing,
  ruleBlondel, ruleStepAngle,
];

export function validate(c: StairConfig): Issue[] {
  const t = T[c.buildingType];
  return RULES.map((r) => r(c, t)).filter((x): x is Issue => x !== null);
}
