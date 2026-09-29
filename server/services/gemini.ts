import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { config } from '../config.js';
import {
  AIAnalysisResponse,
  AIScenarioResponse,
  Decision,
  Alternative,
  Criterion,
  DeterministicResults,
  DecisionContextSnapshot,
} from '../../shared/types/index.js';
import {
  AIAnalysisResponseSchema,
  AIScenarioResponseSchema,
} from '../../shared/schemas/analysis.js';

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

if (config.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({
      model: config.GEMINI_MODEL || 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 4000,
      },
    });
    console.log('[Gemini] Initialized with model: ' + (config.GEMINI_MODEL || 'gemini-2.5-flash'));
  } catch (err) {
    console.warn('[Gemini] Failed to initialize client:', (err as Error).message);
    genAI = null;
    model = null;
  }
}

const SYSTEM_PROMPT = 'You are Decisionly, a thoughtful, empathetic, and smart friend who helps the user think through difficult personal and life choices. Follow this fundamental UX principle: Listen - Understand - Ask - Think together - Suggest. Guidelines: 1. Speak warmly, plainly, and realistically like a trusted human friend. 2. Never say "Our analysis indicates..." Instead say "From what you\'ve told me so far..." 3. Reflect back what you\'re hearing in simple human terms. 4. Ask 2-3 genuine, practical questions. 5. Provide a clear, honest suggestion/verdict. 6. Return only valid JSON matching the schema.';

export const geminiService = {
  isConfigured(): boolean {
    return Boolean(config.GEMINI_API_KEY && model);
  },

  getModelName(): string {
    return config.GEMINI_MODEL || 'gemini-2.5-flash';
  },

  async generateDecisionAnalysis(
    decision: Decision,
    alternatives: Alternative[],
    criteria: Criterion[],
    scores: DeterministicResults,
    snapshot?: DecisionContextSnapshot | null
  ): Promise<{ analysis: AIAnalysisResponse; modelUsed: string } | null> {
    if (!this.isConfigured() || !model) return null;

    const payload = {
      decision: {
        title: decision.title,
        description: decision.description,
        category: decision.category,
        desired_outcome: decision.desired_outcome,
        deadline: decision.deadline,
        constraints: decision.constraints,
        assumptions: decision.assumptions,
      },
      alternatives: alternatives.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        values: a.values,
      })),
      criteria: criteria.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        type: c.criterion_type,
        direction: c.direction,
        weight: c.weight,
      })),
      deterministicResults: {
        isComputable: scores.isComputable,
        alternativeScores: scores.alternativeScores.map((s) => ({
          alternativeId: s.alternativeId,
          alternativeName: s.alternativeName,
          totalScore: s.totalScore,
          rank: s.rank,
        })),
        warnings: scores.warnings,
      },
      approvedContext: {
        savedEntries: snapshot?.context_entries || [],
        decisionSpecificContext: snapshot?.decision_specific_context || [],
      },
    };

    const prompt = SYSTEM_PROMPT + '\n\nYou are helping a friend think through this decision. Return ONLY a valid JSON object with fields: summary, conversational (whatImHearing, thinkingTogether, questionsToPonder array, priorityPills array, honestVerdict), finalVerdict (recommendedAlternativeId, verdictTitle, confidence, bottomLineReasoning, keyTradeOff, nextAction), alternativeInsights array, tradeOffs array, risks array, uncertainties array, missingInformation array, assumptions array, followUpQuestions array, overallNote. confidence must be high or moderate or conditional. risks likelihood must be low or medium or high or unknown. Speak like a warm honest friend. Use exact alternativeId strings provided.\n\nINPUT DATA:\n' + JSON.stringify(payload, null, 2);

function cleanAndParseJson(raw: string): any {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Try removing trailing commas
    const fixed = cleaned.replace(/,\s*([\]}])/g, '$1');
    return JSON.parse(fixed);
  }
}

    let retries = 0;
    const maxRetries = 1;

    while (retries <= maxRetries) {
      try {
        const result = await model.generateContent(prompt);
        const rawContent = result.response.text();
        const parsed = cleanAndParseJson(rawContent);

        if (Array.isArray(parsed.alternativeInsights)) {
          parsed.alternativeInsights = parsed.alternativeInsights.map((alt: any) => ({
            ...alt,
            advantages: Array.isArray(alt.advantages) ? alt.advantages : typeof alt.advantages === 'string' && alt.advantages.trim() ? [alt.advantages] : [],
            drawbacks: Array.isArray(alt.drawbacks) ? alt.drawbacks : typeof alt.drawbacks === 'string' && alt.drawbacks.trim() ? [alt.drawbacks] : [],
            goalAlignment: Array.isArray(alt.goalAlignment) ? alt.goalAlignment : typeof alt.goalAlignment === 'string' && alt.goalAlignment.trim() ? [alt.goalAlignment] : [],
            scoreContext: typeof alt.scoreContext === 'string' ? alt.scoreContext : '',
          }));
        }

        if (Array.isArray(parsed.risks)) {
          parsed.risks = parsed.risks.map((r: any) => ({
            description: typeof r?.description === 'string' ? r.description : (typeof r === 'string' ? r : 'Potential risk'),
            appliesTo: Array.isArray(r?.appliesTo) ? r.appliesTo : (typeof r?.appliesTo === 'string' ? [r.appliesTo] : []),
            likelihood: ['low', 'medium', 'high', 'unknown'].includes(r?.likelihood) ? r.likelihood : 'unknown',
            basis: typeof r?.basis === 'string' ? r.basis : 'General assessment',
          }));
        } else {
          parsed.risks = [];
        }

        const normalizeArray = (val: any) =>
          Array.isArray(val) ? val : typeof val === 'string' && val.trim() ? [val] : [];

        if (parsed.tradeOffs) parsed.tradeOffs = normalizeArray(parsed.tradeOffs);
        if (parsed.uncertainties) parsed.uncertainties = normalizeArray(parsed.uncertainties);
        if (parsed.missingInformation) parsed.missingInformation = normalizeArray(parsed.missingInformation);
        if (parsed.assumptions) parsed.assumptions = normalizeArray(parsed.assumptions);
        if (parsed.followUpQuestions) parsed.followUpQuestions = normalizeArray(parsed.followUpQuestions);

        const validated = AIAnalysisResponseSchema.parse(parsed);
        return { analysis: validated, modelUsed: this.getModelName() };
      } catch (err: any) {
        retries++;
        console.warn('[Gemini] Attempt ' + retries + ' failed:', err?.message || err);
        if (retries > maxRetries) {
          console.warn('[Gemini] Retries exhausted, returning null to allow fallback.');
          return null;
        }
        await new Promise((r) => setTimeout(r, 1000 * retries));
      }
    }

    return null;
  },

  async generateScenarioExplanation(
    baselineScores: DeterministicResults,
    scenarioScores: DeterministicResults,
    changedInputs: any,
    snapshot?: DecisionContextSnapshot | null
  ): Promise<{ explanation: AIScenarioResponse; modelUsed: string } | null> {
    if (!this.isConfigured() || !model) return null;

    const payload = {
      baselineScores: baselineScores.alternativeScores,
      scenarioScores: scenarioScores.alternativeScores,
      changedInputs,
      approvedContext: snapshot?.context_entries || [],
    };

    const prompt = SYSTEM_PROMPT + '\n\nExplain the differences between the baseline decision scores and this what-if scenario. Return ONLY valid JSON: { "summary": string, "changes": string[], "limitations": string[] }\n\nDATA:\n' + JSON.stringify(payload, null, 2);

    try {
      const result = await model!.generateContent(prompt);
      const raw = result.response.text();
      const parsed = JSON.parse(raw);
      const validated = AIScenarioResponseSchema.parse(parsed);
      return { explanation: validated, modelUsed: this.getModelName() };
    } catch (err) {
      console.warn('[Gemini] Scenario explanation failed:', (err as Error).message);
      return null;
    }
  },
};
