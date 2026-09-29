import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { decisionsRepository } from '../db/repositories/decisions.js';
import { alternativesRepository } from '../db/repositories/alternatives.js';
import { criteriaRepository } from '../db/repositories/criteria.js';
import { snapshotsRepository } from '../db/repositories/snapshots.js';
import { analysesRepository } from '../db/repositories/analyses.js';
import { scenariosRepository } from '../db/repositories/scenarios.js';
import { personalContextRepository } from '../db/repositories/personalContext.js';
import { calculateDeterministicScores } from '../services/scoring.js';
import { contextRetrievalService } from '../services/contextRetrieval.js';
import { groqService } from '../services/groq.js';
import { geminiService } from '../services/gemini.js';
import {
  CreateDecisionSchema,
  UpdateDecisionSchema,
  AlternativesPayloadSchema,
  CriteriaPayloadSchema,
  RecordOutcomeSchema,
} from '../../shared/schemas/decision.js';
import { ContextConfirmPayloadSchema } from '../../shared/schemas/context.js';
import { CreateScenarioPayloadSchema } from '../../shared/schemas/analysis.js';
import { TargetCategory } from '../../shared/constants/categories.js';

const router = Router();
router.use(requireAuth);

// 1. List Decisions
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const search = req.query.search ? String(req.query.search) : undefined;
    const category = req.query.category ? (req.query.category as TargetCategory) : undefined;
    const status = req.query.status ? (req.query.status as any) : undefined;
    const includeArchived = req.query.includeArchived === 'true';
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
    const offset = req.query.offset ? parseInt(String(req.query.offset), 10) : 0;

    const result = await decisionsRepository.listByUser(userId, {
      search,
      category,
      status,
      includeArchived,
      limit,
      offset,
    });
    res.json(result);
  } catch (err: any) {
    console.error('[Decisions] List error:', err);
    res.status(500).json({ error: 'Failed to list decisions' });
  }
});

// 2. Create Decision
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const parsed = CreateDecisionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid decision details' });
      return;
    }

    const decision = await decisionsRepository.create(userId, parsed.data);
    res.status(201).json({ decision });
  } catch (err: any) {
    console.error('[Decisions] Create error:', err);
    res.status(500).json({ error: 'Failed to create decision' });
  }
});

// 3. Get Decision Details (including children)
router.get('/:decisionId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decisionId = req.params.decisionId as string;
    const decision = await decisionsRepository.findById(decisionId, userId);
    if (!decision) {
      res.status(404).json({ error: 'Decision not found' });
      return;
    }

    const [alternatives, criteria, latestSnapshot, analyses, scenarios] = await Promise.all([
      alternativesRepository.listByDecision(decision.id, userId),
      criteriaRepository.listByDecision(decision.id, userId),
      snapshotsRepository.getLatestForDecision(decision.id, userId),
      analysesRepository.listByDecision(decision.id, userId),
      scenariosRepository.listByDecision(decision.id, userId),
    ]);

    // Deterministic calculation
    const scores = calculateDeterministicScores(alternatives, criteria);

    res.json({
      decision,
      alternatives,
      criteria,
      scores,
      latestSnapshot,
      analyses,
      scenarios,
    });
  } catch (err: any) {
    console.error('[Decisions] Get details error:', err);
    res.status(500).json({ error: 'Failed to get decision details' });
  }
});

// 4. Update Decision Details
router.patch('/:decisionId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decisionId = req.params.decisionId as string;
    const parsed = UpdateDecisionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid update' });
      return;
    }

    const updated = await decisionsRepository.update(decisionId, userId, parsed.data);
    if (!updated) {
      res.status(404).json({ error: 'Decision not found' });
      return;
    }
    res.json({ decision: updated });
  } catch (err: any) {
    console.error('[Decisions] Update error:', err);
    res.status(500).json({ error: 'Failed to update decision' });
  }
});

// 5. Delete Decision
router.delete('/:decisionId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decisionId = req.params.decisionId as string;
    const deleted = await decisionsRepository.delete(decisionId, userId);
    if (!deleted) {
      res.status(404).json({ error: 'Decision not found' });
      return;
    }
    res.json({ success: true, message: 'Decision deleted successfully' });
  } catch (err: any) {
    console.error('[Decisions] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete decision' });
  }
});

// 6. Archive / Restore Decision
router.post('/:decisionId/archive', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decisionId = req.params.decisionId as string;
    const archive = req.body.archive !== false;
    const updated = await decisionsRepository.setArchived(decisionId, userId, archive);
    if (!updated) {
      res.status(404).json({ error: 'Decision not found' });
      return;
    }
    res.json({ decision: updated });
  } catch (err: any) {
    console.error('[Decisions] Archive error:', err);
    res.status(500).json({ error: 'Failed to modify archive status' });
  }
});

// 7. Replace Alternatives (support both PUT and POST)
const handleReplaceAlternatives = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decisionId = req.params.decisionId as string;
    const parsed = AlternativesPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid alternatives data' });
      return;
    }

    const alternatives = await alternativesRepository.replaceForDecision(
      decisionId,
      userId,
      parsed.data.alternatives
    );
    res.json({ alternatives });
  } catch (err: any) {
    console.error('[Decisions] Replace alternatives error:', err);
    res.status(500).json({ error: err.message || 'Failed to update alternatives' });
  }
};
router.put('/:decisionId/alternatives', handleReplaceAlternatives);
router.post('/:decisionId/alternatives', handleReplaceAlternatives);

// 8. Replace Criteria (support both PUT and POST)
const handleReplaceCriteria = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decisionId = req.params.decisionId as string;
    const parsed = CriteriaPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid criteria data' });
      return;
    }

    const criteria = await criteriaRepository.replaceForDecision(
      decisionId,
      userId,
      parsed.data.criteria
    );
    res.json({ criteria });
  } catch (err: any) {
    console.error('[Decisions] Replace criteria error:', err);
    res.status(500).json({ error: err.message || 'Failed to update criteria' });
  }
};
router.put('/:decisionId/criteria', handleReplaceCriteria);
router.post('/:decisionId/criteria', handleReplaceCriteria);

// 9. Score calculation preview (supports /score and /calculate)
const handleCalculateScore = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decisionId = req.params.decisionId as string;
    const decision = await decisionsRepository.findById(decisionId, userId);
    if (!decision) {
      res.status(404).json({ error: 'Decision not found' });
      return;
    }

    const [alternatives, criteria] = await Promise.all([
      alternativesRepository.listByDecision(decision.id, userId),
      criteriaRepository.listByDecision(decision.id, userId),
    ]);

    const scores = calculateDeterministicScores(alternatives, criteria);
    res.json({ scores });
  } catch (err: any) {
    console.error('[Decisions] Score error:', err);
    res.status(500).json({ error: 'Failed to calculate scores' });
  }
};
router.post('/:decisionId/score', handleCalculateScore);
router.post('/:decisionId/calculate', handleCalculateScore);

// 10. Context Preview (Candidate entries)
router.post('/:decisionId/context-preview', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decisionId = req.params.decisionId as string;
    const decision = await decisionsRepository.findById(decisionId, userId);
    if (!decision) {
      res.status(404).json({ error: 'Decision not found' });
      return;
    }

    const candidates = await contextRetrievalService.getCandidateContext(userId, decision);
    res.json({ candidates });
  } catch (err: any) {
    console.error('[Decisions] Context preview error:', err);
    res.status(500).json({ error: 'Failed to preview context' });
  }
});

// 11. Context Confirm (Save Snapshot)
router.post('/:decisionId/context-confirm', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decisionId = req.params.decisionId as string;
    const decision = await decisionsRepository.findById(decisionId, userId);
    if (!decision) {
      res.status(404).json({ error: 'Decision not found' });
      return;
    }

    const parsed = ContextConfirmPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid context confirmation' });
      return;
    }

    // Verify all requested context entries belong to this user
    const confirmedEntries: any[] = [];
    for (const entryId of parsed.data.included_entry_ids) {
      const entry = await personalContextRepository.findById(entryId, userId);
      if (entry) {
        confirmedEntries.push({
          id: entry.id,
          entry_type: entry.entry_type,
          title: entry.title,
          content: entry.content,
          duration_type: entry.duration_type,
        });
      }
    }

    const snapshot = await snapshotsRepository.create(
      decision.id,
      userId,
      confirmedEntries,
      parsed.data.decision_specific_context
    );

    res.status(201).json({ snapshot });
  } catch (err: any) {
    console.error('[Decisions] Context confirm error:', err);
    res.status(500).json({ error: 'Failed to save context snapshot' });
  }
});

// 12. Run Full AI & Deterministic Analysis
router.post('/:decisionId/analyze', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decisionId = req.params.decisionId as string;
    const decision = await decisionsRepository.findById(decisionId, userId);
    if (!decision) {
      res.status(404).json({ error: 'Decision not found' });
      return;
    }

    const [alternatives, criteria, latestSnapshot] = await Promise.all([
      alternativesRepository.listByDecision(decision.id, userId),
      criteriaRepository.listByDecision(decision.id, userId),
      snapshotsRepository.getLatestForDecision(decision.id, userId),
    ]);

    if (alternatives.length < 2) {
      res.status(400).json({ error: 'At least 2 alternatives are required for analysis.' });
      return;
    }

    // Calculate deterministic comparison scores
    const deterministicResults = calculateDeterministicScores(alternatives, criteria);

    // Call AI engine: Gemini first, then Groq fallback, then deterministic engine
    let aiResult = await geminiService.generateDecisionAnalysis(
      decision,
      alternatives,
      criteria,
      deterministicResults,
      latestSnapshot
    );

    if (!aiResult) {
      console.log('[Decisions] Gemini unavailable or failed, falling back to Groq...');
      aiResult = await groqService.generateDecisionAnalysis(
        decision,
        alternatives,
        criteria,
        deterministicResults,
        latestSnapshot
      );
    }

    if (!aiResult) {
      res.status(503).json({ error: 'AI analysis engines are temporarily unavailable. Please try again shortly.' });
      return;
    }

    const { analysis: aiAnalysis, modelUsed } = aiResult;

    // Save Analysis record
    const savedAnalysis = await analysesRepository.create({
      decision_id: decision.id,
      user_id: userId,
      context_snapshot_id: latestSnapshot?.id || null,
      input_snapshot: {
        decision,
        alternatives,
        criteria,
        context_snapshot: latestSnapshot || undefined,
      },
      deterministic_results: deterministicResults,
      ai_analysis: aiAnalysis,
      model_name: modelUsed,
    });

    // Update decision status to analyzed if it was draft/ready
    if (decision.status !== 'archived') {
      await decisionsRepository.update(decision.id, userId, { status: 'analyzed' });
    }

    res.status(201).json({
      analysis: savedAnalysis,
      deterministicResults,
    });
  } catch (err: any) {
    console.error('[Decisions] Analysis error:', err);
    res.status(500).json({ error: 'Failed to complete decision analysis' });
  }
});

// 13. List Analyses
router.get('/:decisionId/analyses', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decisionId = req.params.decisionId as string;
    const analyses = await analysesRepository.listByDecision(decisionId, userId);
    res.json({ analyses });
  } catch (err: any) {
    console.error('[Decisions] List analyses error:', err);
    res.status(500).json({ error: 'Failed to retrieve analyses' });
  }
});

// 14. Get Single Analysis
router.get('/:decisionId/analyses/:analysisId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decisionId = req.params.decisionId as string;
    const analysisId = req.params.analysisId as string;
    const analysis = await analysesRepository.findById(analysisId, userId);
    if (!analysis || analysis.decision_id !== decisionId) {
      res.status(404).json({ error: 'Analysis not found' });
      return;
    }
    res.json({ analysis });
  } catch (err: any) {
    console.error('[Decisions] Get analysis error:', err);
    res.status(500).json({ error: 'Failed to get analysis' });
  }
});

// 15. Create What-If Scenario
router.post('/:decisionId/scenarios', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decisionId = req.params.decisionId as string;
    const decision = await decisionsRepository.findById(decisionId, userId);
    if (!decision) {
      res.status(404).json({ error: 'Decision not found' });
      return;
    }

    const parsed = CreateScenarioPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid scenario payload' });
      return;
    }

    const [alternatives, criteria, latestSnapshot] = await Promise.all([
      alternativesRepository.listByDecision(decision.id, userId),
      criteriaRepository.listByDecision(decision.id, userId),
      snapshotsRepository.getLatestForDecision(decision.id, userId),
    ]);

    const baselineScores = calculateDeterministicScores(alternatives, criteria);

    // Apply scenario changes
    const { criteriaWeights, alternativeValues, excludedAlternativeIds, excludedCriteriaIds } =
      parsed.data.scenario_inputs;

    const scenarioCriteria = criteria
      .filter((c) => !excludedCriteriaIds?.includes(c.id))
      .map((c) => ({
        ...c,
        weight: criteriaWeights?.[c.id] !== undefined ? criteriaWeights[c.id] : c.weight,
      }));

    const scenarioAlternatives = alternatives
      .filter((a) => !excludedAlternativeIds?.includes(a.id))
      .map((a) => ({
        ...a,
        values: {
          ...a.values,
          ...(alternativeValues?.[a.id] || {}),
        },
      }));

    const scenarioScores = calculateDeterministicScores(scenarioAlternatives, scenarioCriteria);

    let aiExplanation = null;
    if (parsed.data.include_ai_explanation) {
      // Try Gemini first, fall back to Groq
      let scenarioResult = await geminiService.generateScenarioExplanation(
        baselineScores,
        scenarioScores,
        parsed.data.scenario_inputs,
        latestSnapshot
      );
      if (!scenarioResult) {
        scenarioResult = await groqService.generateScenarioExplanation(
          baselineScores,
          scenarioScores,
          parsed.data.scenario_inputs,
          latestSnapshot
        );
      }
      if (scenarioResult) {
        aiExplanation = scenarioResult.explanation;
      }
    }

    const scenario = await scenariosRepository.create({
      decision_id: decision.id,
      user_id: userId,
      name: parsed.data.name,
      scenario_inputs: parsed.data.scenario_inputs,
      deterministic_results: scenarioScores,
      ai_explanation: aiExplanation,
    });

    res.status(201).json({
      scenario,
      baselineScores,
      scenarioScores,
    });
  } catch (err: any) {
    console.error('[Decisions] Scenario error:', err);
    res.status(500).json({ error: 'Failed to create scenario simulation' });
  }
});

// 16. List Scenarios
router.get('/:decisionId/scenarios', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decisionId = req.params.decisionId as string;
    const scenarios = await scenariosRepository.listByDecision(decisionId, userId);
    res.json({ scenarios });
  } catch (err: any) {
    console.error('[Decisions] List scenarios error:', err);
    res.status(500).json({ error: 'Failed to list scenarios' });
  }
});

// 17. Update Scenario
router.patch('/:decisionId/scenarios/:scenarioId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const scenarioId = req.params.scenarioId as string;
    const updated = await scenariosRepository.update(scenarioId, userId, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Scenario not found' });
      return;
    }
    res.json({ scenario: updated });
  } catch (err: any) {
    console.error('[Decisions] Update scenario error:', err);
    res.status(500).json({ error: 'Failed to update scenario' });
  }
});

// 18. Delete Scenario
router.delete('/:decisionId/scenarios/:scenarioId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const scenarioId = req.params.scenarioId as string;
    const deleted = await scenariosRepository.delete(scenarioId, userId);
    if (!deleted) {
      res.status(404).json({ error: 'Scenario not found' });
      return;
    }
    res.json({ success: true, message: 'Scenario deleted successfully' });
  } catch (err: any) {
    console.error('[Decisions] Delete scenario error:', err);
    res.status(500).json({ error: 'Failed to delete scenario' });
  }
});

// 19. Record User Choice and Outcome Reflection
router.post('/:decisionId/outcome', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decisionId = req.params.decisionId as string;
    const parsed = RecordOutcomeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid outcome submission' });
      return;
    }

    const updated = await decisionsRepository.recordOutcome(
      decisionId,
      userId,
      parsed.data
    );
    if (!updated) {
      res.status(404).json({ error: 'Decision not found' });
      return;
    }
    res.json({ decision: updated });
  } catch (err: any) {
    console.error('[Decisions] Record outcome error:', err);
    res.status(500).json({ error: 'Failed to record decision outcome' });
  }
});

export default router;
