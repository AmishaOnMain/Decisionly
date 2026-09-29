import { describe, it, expect } from 'vitest';
import { calculateDeterministicScores } from '../services/scoring.js';
import { Alternative, Criterion } from '../../shared/types/index.js';

describe('Deterministic Scoring Engine', () => {
  it('returns not computable if fewer than 2 alternatives', () => {
    const alts: Alternative[] = [
      {
        id: 'alt-1',
        decision_id: 'dec-1',
        name: 'Option A',
        description: '',
        sort_order: 0,
        values: {},
        created_at: '',
        updated_at: '',
      },
    ];
    const criteria: Criterion[] = [
      {
        id: 'crit-1',
        decision_id: 'dec-1',
        name: 'Salary',
        description: '',
        criterion_type: 'numeric',
        direction: 'higher_better',
        weight: 10,
        sort_order: 0,
        created_at: '',
        updated_at: '',
      },
    ];

    const result = calculateDeterministicScores(alts, criteria);
    expect(result.isComputable).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('correctly calculates higher_better and lower_better with normalized weights', () => {
    const criteria: Criterion[] = [
      {
        id: 'c1',
        decision_id: 'dec-1',
        name: 'Salary',
        description: '',
        criterion_type: 'numeric',
        direction: 'higher_better',
        weight: 60,
        sort_order: 0,
        created_at: '',
        updated_at: '',
      },
      {
        id: 'c2',
        decision_id: 'dec-1',
        name: 'Commute Minutes',
        description: '',
        criterion_type: 'numeric',
        direction: 'lower_better', // lower is better
        weight: 40,
        sort_order: 1,
        created_at: '',
        updated_at: '',
      },
    ];

    const alts: Alternative[] = [
      {
        id: 'a1',
        decision_id: 'dec-1',
        name: 'Remote Tech Job',
        description: '',
        sort_order: 0,
        values: {
          c1: 120000, // High salary
          c2: 0, // Zero commute (best for lower_better)
        },
        created_at: '',
        updated_at: '',
      },
      {
        id: 'a2',
        decision_id: 'dec-1',
        name: 'Office Corporate Job',
        description: '',
        sort_order: 1,
        values: {
          c1: 100000, // Lower salary
          c2: 60, // 60 min commute (worst for lower_better)
        },
        created_at: '',
        updated_at: '',
      },
    ];

    const result = calculateDeterministicScores(alts, criteria);
    expect(result.isComputable).toBe(true);
    expect(result.normalizedWeights['c1']).toBeCloseTo(0.6);
    expect(result.normalizedWeights['c2']).toBeCloseTo(0.4);

    const a1Score = result.alternativeScores.find((s) => s.alternativeId === 'a1');
    const a2Score = result.alternativeScores.find((s) => s.alternativeId === 'a2');

    expect(a1Score?.totalScore).toBe(100);
    expect(a2Score?.totalScore).toBe(0);
    expect(result.winnerAlternativeId).toBe('a1');
  });

  it('marks unknown values without fabricating zeros or skewing normalization', () => {
    const criteria: Criterion[] = [
      {
        id: 'c1',
        decision_id: 'dec-1',
        name: 'Cost',
        description: '',
        criterion_type: 'numeric',
        direction: 'lower_better',
        weight: 50,
        sort_order: 0,
        created_at: '',
        updated_at: '',
      },
      {
        id: 'c2',
        decision_id: 'dec-1',
        name: 'Culture',
        description: '',
        criterion_type: 'qualitative',
        direction: 'judgment',
        weight: 50,
        sort_order: 1,
        created_at: '',
        updated_at: '',
      },
    ];

    const alts: Alternative[] = [
      {
        id: 'a1',
        decision_id: 'dec-1',
        name: 'Startup',
        description: '',
        sort_order: 0,
        values: {
          c1: 5000,
          c2: 'unknown', // Unknown!
        },
        created_at: '',
        updated_at: '',
      },
      {
        id: 'a2',
        decision_id: 'dec-1',
        name: 'Enterprise',
        description: '',
        sort_order: 1,
        values: {
          c1: 8000,
          c2: 4,
        },
        created_at: '',
        updated_at: '',
      },
    ];

    const result = calculateDeterministicScores(alts, criteria);
    expect(result.isComputable).toBe(true);
    expect(result.hasUncertainty).toBe(true);

    const a1Score = result.alternativeScores.find((s) => s.alternativeId === 'a1');
    expect(a1Score?.breakdown['c2'].isUnknown).toBe(true);
    expect(a1Score?.uncertaintyFlag).toBe(true);
    expect(a1Score?.knownRatio).toBeLessThan(1.0);
  });
});
