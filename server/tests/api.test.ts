import { describe, it, expect, beforeAll } from 'vitest';
import { usersRepository } from '../db/repositories/users.js';
import { personalContextRepository } from '../db/repositories/personalContext.js';
import { decisionsRepository } from '../db/repositories/decisions.js';
import { alternativesRepository } from '../db/repositories/alternatives.js';
import { criteriaRepository } from '../db/repositories/criteria.js';
import { calculateDeterministicScores } from '../services/scoring.js';
import { contextRetrievalService } from '../services/contextRetrieval.js';
import { groqService } from '../services/groq.js';
import { hashPassword, verifyPassword } from '../auth/passwords.js';

describe('Decisionly Core End-to-End Domain Logic', () => {
  let testUserId: string;
  let testDecisionId: string;

  beforeAll(async () => {
    // 1. User Creation
    const pwHash = await hashPassword('SecurePassword123!');
    const user = await usersRepository.create('test.user@decisionly.io', pwHash, 'Test Analyst');
    testUserId = user.id;
  });

  it('verifies secure password hashing and checking', async () => {
    const user = await usersRepository.findByEmail('test.user@decisionly.io');
    expect(user).toBeDefined();
    const valid = await verifyPassword('SecurePassword123!', user!.password_hash);
    expect(valid).toBe(true);
    const invalid = await verifyPassword('WrongPassword', user!.password_hash);
    expect(invalid).toBe(false);
  });

  it('manages Personal Space entries with review dates and categories', async () => {
    const entry = await personalContextRepository.create(testUserId, {
      entry_type: 'goal',
      title: 'Target Savings $30k',
      content: 'Aiming to save for down payment before end of year.',
      duration_type: 'temporary',
      review_at: new Date(Date.now() + 86400000).toISOString(),
    });

    expect(entry.id).toBeDefined();
    expect(entry.user_id).toBe(testUserId);
    expect(entry.entry_type).toBe('goal');

    const list = await personalContextRepository.listByUser(testUserId);
    expect(list.length).toBeGreaterThan(0);
    expect(list.some((e) => e.id === entry.id)).toBe(true);
  });

  it('creates decision, alternatives, and criteria with strict ownership', async () => {
    const decision = await decisionsRepository.create(testUserId, {
      title: 'Graduate School vs Immediate Tech Job',
      description: 'Deciding between pursuing an MS in CS or accepting a Senior SWE role.',
      category: 'Career',
      desired_outcome: 'Long-term compensation growth and intellectual fulfillment.',
      constraints: ['Max tuition debt $40k'],
      assumptions: ['Tech hiring remains stable'],
    });

    testDecisionId = decision.id;
    expect(decision.category).toBe('Career');

    // Alternatives
    const alts = await alternativesRepository.replaceForDecision(decision.id, testUserId, [
      { name: 'Stanford MS CS', description: '2 years degree in Palo Alto', sort_order: 0 },
      { name: 'Senior SWE Offer', description: 'Immediate $160k compensation', sort_order: 1 },
    ]);
    expect(alts.length).toBe(2);

    // Criteria
    const crit = await criteriaRepository.replaceForDecision(decision.id, testUserId, [
      {
        name: 'Upfront Cost',
        criterion_type: 'numeric',
        direction: 'lower_better', // lower cost is better
        weight: 40,
      },
      {
        name: '5-Year Earnings Potential',
        criterion_type: 'numeric',
        direction: 'higher_better',
        weight: 60,
      },
    ]);
    expect(crit.length).toBe(2);
  });

  it('correctly calculates deterministic utility scores and respects lower_better', async () => {
    const alts = await alternativesRepository.listByDecision(testDecisionId, testUserId);
    const crits = await criteriaRepository.listByDecision(testDecisionId, testUserId);

    // Set values
    const costCrit = crits.find((c) => c.direction === 'lower_better')!;
    const earnCrit = crits.find((c) => c.direction === 'higher_better')!;

    const alt1 = alts[0]; // Grad school
    const alt2 = alts[1]; // Job

    alt1.values = { [costCrit.id]: 80000, [earnCrit.id]: 250000 };
    alt2.values = { [costCrit.id]: 0, [earnCrit.id]: 200000 };

    const scores = calculateDeterministicScores([alt1, alt2], crits);
    expect(scores.isComputable).toBe(true);
    expect(scores.alternativeScores.length).toBe(2);

    // Senior SWE has 0 cost, so for lower_better it receives maximum normalized utility
    const alt2Score = scores.alternativeScores.find((s) => s.alternativeId === alt2.id);
    expect(alt2Score?.breakdown[costCrit.id].normalizedScore).toBe(1.0);
  });

  it('suggests relevant context entries and generates grounded decision analysis', async () => {
    const decision = (await decisionsRepository.findById(testDecisionId, testUserId))!;
    const alts = await alternativesRepository.listByDecision(testDecisionId, testUserId);
    const crits = await criteriaRepository.listByDecision(testDecisionId, testUserId);
    const scores = calculateDeterministicScores(alts, crits);

    // Context preview
    const candidates = await contextRetrievalService.getCandidateContext(testUserId, decision);
    expect(candidates).toBeDefined();

    // Groq / Deterministic analysis
    const { analysis, modelUsed } = await groqService.generateDecisionAnalysis(
      decision,
      alts,
      crits,
      scores,
      null
    );

    expect(analysis.summary).toBeDefined();
    expect(analysis.alternativeInsights.length).toBe(2);
    expect(analysis.tradeOffs.length).toBeGreaterThan(0);
    expect(analysis.risks.length).toBeGreaterThan(0);
    expect(analysis.overallNote).toContain('advisory');
  });

  it('records user-chosen outcome and verifies export', async () => {
    const alts = await alternativesRepository.listByDecision(testDecisionId, testUserId);
    const updated = await decisionsRepository.recordOutcome(testDecisionId, testUserId, {
      chosen_alternative_id: alts[1].id,
      outcome_reflection: 'Accepted the senior role; saving aggressively.',
    });

    expect(updated?.chosen_alternative_id).toBe(alts[1].id);
    expect(updated?.outcome_reflection).toContain('Accepted');

    // Data Export
    const exportData = await usersRepository.exportUserData(testUserId);
    expect(exportData.exportVersion).toBe('1.0');
    expect(exportData.decisions.length).toBeGreaterThan(0);
  });
});
