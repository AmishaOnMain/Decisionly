import {
  Alternative,
  Criterion,
  DeterministicResults,
  AlternativeScoreResult,
  CriterionContribution,
} from '../../shared/types/index.js';

// Qualitative mapping helper
const QUALITATIVE_MAP: Record<string, number> = {
  very_low: 1,
  low: 2,
  poor: 2,
  medium: 3,
  moderate: 3,
  average: 3,
  fair: 3,
  high: 4,
  good: 4,
  very_high: 5,
  excellent: 5,
  outstanding: 5,
};

function parseValueToNumber(val: any): { num: number | null; isUnknown: boolean } {
  if (val === null || val === undefined || val === '' || val === 'unknown') {
    return { num: null, isUnknown: true };
  }
  if (typeof val === 'number' && !isNaN(val)) {
    return { num: val, isUnknown: false };
  }
  if (typeof val === 'string') {
    const clean = val.trim().toLowerCase();
    if (clean === 'unknown' || clean === 'n/a' || clean === '?') {
      return { num: null, isUnknown: true };
    }
    if (QUALITATIVE_MAP[clean] !== undefined) {
      return { num: QUALITATIVE_MAP[clean], isUnknown: false };
    }
    const parsed = parseFloat(clean);
    if (!isNaN(parsed)) {
      return { num: parsed, isUnknown: false };
    }
  }
  return { num: null, isUnknown: true };
}

export function calculateDeterministicScores(
  alternatives: Alternative[],
  criteria: Criterion[]
): DeterministicResults {
  const warnings: string[] = [];

  if (alternatives.length < 2) {
    return {
      isComputable: false,
      scoringMethodExplanation:
        'Comparison requires at least 2 distinct alternatives to calculate relative trade-offs and scores.',
      normalizedWeights: {},
      alternativeScores: [],
      winnerAlternativeId: null,
      hasUncertainty: false,
      warnings: ['At least two alternatives are required to compute comparisons.'],
    };
  }

  if (criteria.length === 0) {
    return {
      isComputable: false,
      scoringMethodExplanation:
        'Evaluation requires at least one defined criterion with a positive weight.',
      normalizedWeights: {},
      alternativeScores: [],
      winnerAlternativeId: null,
      hasUncertainty: false,
      warnings: ['No evaluation criteria have been defined yet.'],
    };
  }

  // 1. Calculate normalized weights (sum to 1.0)
  const totalWeight = criteria.reduce((sum, c) => sum + (c.weight > 0 ? c.weight : 0), 0);

  if (totalWeight <= 0) {
    return {
      isComputable: false,
      scoringMethodExplanation: 'At least one criterion must have a positive weight (> 0).',
      normalizedWeights: {},
      alternativeScores: [],
      winnerAlternativeId: null,
      hasUncertainty: false,
      warnings: ['All criteria weights are zero or negative.'],
    };
  }

  const normalizedWeights: Record<string, number> = {};
  for (const c of criteria) {
    normalizedWeights[c.id] = (c.weight > 0 ? c.weight : 0) / totalWeight;
  }

  // 2. Determine min/max range for each criterion across all alternatives
  const criterionRanges: Record<
    string,
    { min: number; max: number; countKnown: number; totalCount: number }
  > = {};

  for (const c of criteria) {
    let minVal = Infinity;
    let maxVal = -Infinity;
    let countKnown = 0;

    for (const alt of alternatives) {
      const raw = alt.values?.[c.id];
      const { num, isUnknown } = parseValueToNumber(raw);
      if (!isUnknown && num !== null) {
        countKnown++;
        if (num < minVal) minVal = num;
        if (num > maxVal) maxVal = num;
      }
    }

    criterionRanges[c.id] = {
      min: minVal === Infinity ? 0 : minVal,
      max: maxVal === -Infinity ? 0 : maxVal,
      countKnown,
      totalCount: alternatives.length,
    };

    if (countKnown === 0) {
      warnings.push(`Criterion "${c.name}" has no provided values across any alternative.`);
    } else if (countKnown < alternatives.length) {
      warnings.push(
        `Criterion "${c.name}" is missing or unknown for ${alternatives.length - countKnown} alternative(s).`
      );
    }
  }

  // 3. Score each alternative deterministically
  const alternativeScores: AlternativeScoreResult[] = [];
  let anyUncertainty = false;

  for (const alt of alternatives) {
    const breakdown: Record<string, CriterionContribution> = {};
    let weightedSum = 0;
    let knownWeightSum = 0;

    for (const c of criteria) {
      const raw = alt.values?.[c.id];
      const { num, isUnknown } = parseValueToNumber(raw);
      const range = criterionRanges[c.id];
      const normWeight = normalizedWeights[c.id];

      if (isUnknown || num === null) {
        breakdown[c.id] = {
          criterionId: c.id,
          criterionName: c.name,
          rawValue: null,
          normalizedScore: null,
          weightedContribution: null,
          isUnknown: true,
        };
        anyUncertainty = true;
        continue;
      }

      // Compute normalized score 0.0 to 1.0
      let normalizedScore = 0.5;
      if (range.max === range.min) {
        // All options share the exact same value
        normalizedScore = 1.0;
      } else if (c.direction === 'lower_better') {
        // Lower is better: cost, commute time, risk
        normalizedScore = (range.max - num) / (range.max - range.min);
      } else {
        // Higher is better or direct judgment
        normalizedScore = (num - range.min) / (range.max - range.min);
      }

      // Bound strictly to [0, 1]
      normalizedScore = Math.max(0, Math.min(1, normalizedScore));
      const contribution = normalizedScore * normWeight;

      weightedSum += contribution;
      knownWeightSum += normWeight;

      breakdown[c.id] = {
        criterionId: c.id,
        criterionName: c.name,
        rawValue: num,
        normalizedScore: Math.round(normalizedScore * 1000) / 1000,
        weightedContribution: Math.round(contribution * 1000) / 1000,
        isUnknown: false,
      };
    }

    const knownRatio = Math.round(knownWeightSum * 100) / 100;
    const uncertaintyFlag = knownRatio < 1.0;

    // Total score normalized to a 100-point scale based on known evaluated criteria
    const totalScore =
      knownWeightSum > 0 ? Math.round((weightedSum / knownWeightSum) * 1000) / 10 : null;

    alternativeScores.push({
      alternativeId: alt.id,
      alternativeName: alt.name,
      totalScore,
      rank: null,
      breakdown,
      knownRatio,
      uncertaintyFlag,
    });
  }

  // 4. Assign ranks based on computable total score
  const validScores = alternativeScores.filter((a) => a.totalScore !== null);
  validScores.sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));

  validScores.forEach((alt, idx) => {
    alt.rank = idx + 1;
  });

  // Determine if a clear, trustworthy winner exists
  let winnerAlternativeId: string | null = null;
  if (validScores.length >= 2) {
    const top = validScores[0];
    const second = validScores[1];

    // If top option has high known ratio (> 0.75) and a measurable gap (> 1 point)
    if (top.knownRatio >= 0.75 && (top.totalScore ?? 0) > (second.totalScore ?? 0)) {
      winnerAlternativeId = top.alternativeId;
    }
  } else if (validScores.length === 1 && validScores[0].knownRatio >= 0.8) {
    winnerAlternativeId = validScores[0].alternativeId;
  }

  const scoringExplanation = [
    'Deterministic Multi-Attribute Utility Theory (MAUT):',
    '1. Each criterion weight is normalized as weight / total_weight.',
    '2. Values are normalized to a 0–1 scale per criterion. For "lower is better" criteria (e.g., cost, time), lower numbers receive higher relative scores.',
    '3. Missing or marked-unknown criteria are not penalized as zero; scores reflect known data with explicit uncertainty metrics.',
    '4. Note: Mathematical scores reflect your stated criteria and inputs, not an objective guarantee.',
  ].join(' ');

  return {
    isComputable: validScores.length > 0,
    scoringMethodExplanation: scoringExplanation,
    normalizedWeights,
    alternativeScores,
    winnerAlternativeId,
    hasUncertainty: anyUncertainty,
    warnings,
  };
}
