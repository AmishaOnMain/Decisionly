import Groq from 'groq-sdk';
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

let groqClient: Groq | null = null;

if (config.GROQ_API_KEY && config.GROQ_API_KEY.startsWith('gsk_')) {
  try {
    groqClient = new Groq({
      apiKey: config.GROQ_API_KEY,
    });
  } catch (err) {
    console.warn('[Groq] Failed to initialize client:', (err as Error).message);
    groqClient = null;
  }
}

const SYSTEM_PROMPT = `You are Decisionly, a thoughtful, empathetic, and smart friend who helps the user think through difficult personal and life choices.
Follow this fundamental UX principle:
Listen → Understand → Ask → Think together → Suggest (NOT Input → Analyse → Score → Rank → Output).

Guidelines:
1. Speak warmly, plainly, and realistically like a trusted human friend, not like a corporate consulting firm, algorithm, or mathematical evaluator.
2. Never say "Our analysis indicates..." or "Alternative A has a higher utility score". Instead say "From what you've told me so far..." or "Honestly, what seems to be bothering you the most is...".
3. Reflect back what you're hearing in simple human terms. Empathize with the real emotional, financial, or daily life friction (like travel fatigue, stress, uncertainty).
4. Ask 2-3 genuine, practical questions that help the user clarify what really matters to them.
5. Provide a clear, honest suggestion/verdict so they feel helped and guided, while remembering they hold the final choice.
6. Return only valid JSON matching the schema.`;

export const groqService = {
  isConfigured(): boolean {
    return Boolean(config.GROQ_API_KEY && config.GROQ_API_KEY.startsWith('gsk_'));
  },

  getModelName(): string {
    return config.GROQ_MODEL || 'llama-3.3-70b-versatile';
  },

  async generateDecisionAnalysis(
    decision: Decision,
    alternatives: Alternative[],
    criteria: Criterion[],
    scores: DeterministicResults,
    snapshot?: DecisionContextSnapshot | null
  ): Promise<{ analysis: AIAnalysisResponse; modelUsed: string }> {
    const model = this.getModelName();

    // Prepare minimum approved data payload
    const payload = {
      decision: {
        title: decision.title,
        description: decision.description,
        category: decision.category,
        custom_category: decision.custom_category,
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
        scoringMethodExplanation: scores.scoringMethodExplanation,
        normalizedWeights: scores.normalizedWeights,
        alternativeScores: scores.alternativeScores.map((s) => ({
          alternativeId: s.alternativeId,
          alternativeName: s.alternativeName,
          totalScore: s.totalScore,
          rank: s.rank,
          knownRatio: s.knownRatio,
          uncertaintyFlag: s.uncertaintyFlag,
        })),
        warnings: scores.warnings,
      },
      approvedContext: {
        savedEntries: snapshot?.context_entries || [],
        decisionSpecificContext: snapshot?.decision_specific_context || [],
      },
    };

    if (this.isConfigured() && groqClient) {
      let retries = 0;
      const maxRetries = 2;

      while (retries <= maxRetries) {
        try {
          const completion = await groqClient.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              {
                role: 'user',
                content: `You are helping a friend think through this decision. Listen, understand, ask, think together, and suggest.
Return ONLY a valid JSON object matching the schema with fields:
- summary (string: concise executive overview)
- conversational: {
    whatImHearing: string (e.g. "Okay, I get what's bothering you. You seem interested in... but the problem is..."),
    thinkingTogether: string (e.g. "If I were helping you think this through as a friend, I'd look at how much this affects your everyday life..."),
    questionsToPonder: array of 2-3 strings (e.g. ["How far are you willing to travel every day?", "Is there something about these colleges that makes the extra travel worth it to you?"]),
    priorityPills: array of 4-6 strings representing key values/factors (e.g. ["College opportunities", "Distance", "Cost", "Family", "Comfort", "I'm not sure yet"]),
    honestVerdict: string (e.g. "Honestly, the distance seems to be the part that's bothering you the most. If the college isn't giving you something significantly better, travelling that far every day could become exhausting.")
  }
- finalVerdict: {
    recommendedAlternativeId: string (exact alternativeId of the best choice),
    verdictTitle: string (e.g. "Choose [Alternative Name]"),
    confidence: "high" | "moderate" | "conditional",
    bottomLineReasoning: string (maximum 2 clear sentences explaining why this option is superior based on the user's weighted criteria),
    keyTradeOff: string (1 direct sentence stating the primary compromise),
    nextAction: string (concrete next step to execute this decision)
  }
- alternativeInsights (array of { alternativeId, advantages, drawbacks, goalAlignment, scoreContext })
- tradeOffs (array of string)
- risks (array of { description, appliesTo: string[], likelihood: "low" | "medium" | "high" | "unknown", basis: string })
- uncertainties (array of string)
- missingInformation (array of string)
- assumptions (array of string)
- followUpQuestions (array of string)
- overallNote (string)

Use the exact alternativeId strings provided. Avoid making ungrounded likelihood claims.

INPUT DATA:
${JSON.stringify(payload, null, 2)}`,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 3000,
          });

          const rawContent = completion.choices[0]?.message?.content || '{}';
          const parsed = JSON.parse(rawContent);

          // Normalize any fields where the LLM may have produced a string instead of an array of strings
          if (Array.isArray(parsed.alternativeInsights)) {
            parsed.alternativeInsights = parsed.alternativeInsights.map((alt: any) => ({
              ...alt,
              advantages: Array.isArray(alt.advantages)
                ? alt.advantages
                : typeof alt.advantages === 'string' && alt.advantages.trim()
                ? [alt.advantages]
                : [],
              drawbacks: Array.isArray(alt.drawbacks)
                ? alt.drawbacks
                : typeof alt.drawbacks === 'string' && alt.drawbacks.trim()
                ? [alt.drawbacks]
                : [],
              goalAlignment: Array.isArray(alt.goalAlignment)
                ? alt.goalAlignment
                : typeof alt.goalAlignment === 'string' && alt.goalAlignment.trim()
                ? [alt.goalAlignment]
                : [],
            }));
          }

          const normalizeArray = (val: any) =>
            Array.isArray(val) ? val : typeof val === 'string' && val.trim() ? [val] : [];

          if (parsed.tradeOffs) parsed.tradeOffs = normalizeArray(parsed.tradeOffs);
          if (parsed.uncertainties) parsed.uncertainties = normalizeArray(parsed.uncertainties);
          if (parsed.missingInformation) parsed.missingInformation = normalizeArray(parsed.missingInformation);
          if (parsed.assumptions) parsed.assumptions = normalizeArray(parsed.assumptions);
          if (parsed.followUpQuestions) parsed.followUpQuestions = normalizeArray(parsed.followUpQuestions);

          const validated = AIAnalysisResponseSchema.parse(parsed);

          return {
            analysis: validated,
            modelUsed: model,
          };
        } catch (err: any) {
          retries++;
          console.warn(`[Groq] Attempt ${retries} failed:`, err?.message || err);
          if (retries > maxRetries) {
            console.warn('[Groq] Retries exhausted, falling back to local deterministic intelligence engine.');
            break;
          }
          // Backoff
          await new Promise((r) => setTimeout(r, 1000 * retries));
        }
      }
    }

    // High quality deterministic fallback generator when Groq is not configured or fails
    return {
      analysis: generateLocalDeterministicAnalysis(decision, alternatives, criteria, scores, snapshot),
      modelUsed: 'decisionly-deterministic-engine-v1',
    };
  },

  async generateScenarioExplanation(
    baselineScores: DeterministicResults,
    scenarioScores: DeterministicResults,
    changedInputs: any,
    snapshot?: DecisionContextSnapshot | null
  ): Promise<{ explanation: AIScenarioResponse; modelUsed: string }> {
    const model = this.getModelName();

    const payload = {
      baselineScores: baselineScores.alternativeScores,
      scenarioScores: scenarioScores.alternativeScores,
      changedInputs,
      approvedContext: snapshot?.context_entries || [],
    };

    if (this.isConfigured() && groqClient) {
      try {
        const completion = await groqClient.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Explain the differences between the baseline decision scores and this what-if scenario.
Return ONLY valid JSON matching this schema:
{
  "summary": string,
  "changes": string[],
  "limitations": string[]
}

DATA:
${JSON.stringify(payload, null, 2)}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
          max_tokens: 1500,
        });

        const raw = completion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(raw);
        const validated = AIScenarioResponseSchema.parse(parsed);

        return {
          explanation: validated,
          modelUsed: model,
        };
      } catch (err) {
        console.warn('[Groq] Scenario explanation failed:', (err as Error).message);
      }
    }

    // Deterministic fallback for scenario
    return {
      explanation: generateLocalScenarioExplanation(baselineScores, scenarioScores, changedInputs),
      modelUsed: 'decisionly-scenario-engine-v1',
    };
  },
};

// Grounded local deterministic analysis synthesizer
function generateLocalDeterministicAnalysis(
  decision: Decision,
  alternatives: Alternative[],
  criteria: Criterion[],
  scores: DeterministicResults,
  snapshot?: DecisionContextSnapshot | null
): AIAnalysisResponse {
  const topOption = scores.alternativeScores.find((a) => a.rank === 1);
  const contextNotes = snapshot?.context_entries?.map((c) => c.title) || [];

  const summary = `Evaluation of ${alternatives.length} alternatives for "${decision.title}" within the ${decision.category} domain. Analysis considers ${criteria.length} criteria with normalized importance weights.${
    topOption?.totalScore ? ` Alternative "${topOption.alternativeName}" currently leads with a weighted index of ${topOption.totalScore}/100.` : ''
  } Remember: this analysis serves as decision intelligence to support your personal judgment, not a definitive verdict.`;

  const alternativeInsights = alternatives.map((alt) => {
    const scoreItem = scores.alternativeScores.find((s) => s.alternativeId === alt.id);
    const score = scoreItem?.totalScore;
    const advantages: string[] = [];
    const drawbacks: string[] = [];

    criteria.forEach((c) => {
      const breakdown = scoreItem?.breakdown[c.id];
      if (breakdown && !breakdown.isUnknown && breakdown.normalizedScore !== null) {
        if (breakdown.normalizedScore >= 0.7) {
          advantages.push(`Strong performance in ${c.name} (relative score: ${Math.round(breakdown.normalizedScore * 100)}%)`);
        } else if (breakdown.normalizedScore <= 0.3) {
          drawbacks.push(`Weaker standing in ${c.name} (relative score: ${Math.round(breakdown.normalizedScore * 100)}%)`);
        }
      }
    });

    if (advantages.length === 0) advantages.push('Balanced baseline performance across criteria');
    if (drawbacks.length === 0) drawbacks.push('Requires validation on edge-case contingencies');

    return {
      alternativeId: alt.id,
      advantages,
      drawbacks,
      goalAlignment: [
        decision.desired_outcome
          ? `Assessed against desired outcome: "${decision.desired_outcome}"`
          : 'Aligned with overall decision priorities',
      ],
      scoreContext: score !== null && score !== undefined
        ? `Deterministic utility score of ${score}/100 based on evaluated criteria.`
        : 'Score deferred due to missing or unknown criteria parameters.',
    };
  });

  const tradeOffs = [
    `Balancing high-weight criteria against practical day-to-day constraints.`,
    `Short-term implementation effort versus long-term satisfaction in ${decision.category}.`,
  ];

  const risks = alternatives.map((alt) => ({
    description: `Potential divergence between expected outcomes and actual execution for "${alt.name}".`,
    appliesTo: [alt.id],
    likelihood: 'medium' as const,
    basis: `Derived from assumptions and criteria variances in the ${decision.category} category.`,
  }));

  const uncertainties: string[] = [];
  if (scores.hasUncertainty) {
    uncertainties.push('Certain criteria values were marked as unknown and excluded from zero-penalty calculation.');
  }
  if (!decision.deadline) {
    uncertainties.push('No concrete deadline specified; timeline sensitivity remains unmeasured.');
  }

  const missingInformation: string[] = [];
  if (decision.assumptions.length === 0) {
    missingInformation.push('Explicit assumptions regarding external factors or third-party dependencies.');
  }
  if (snapshot?.context_entries.length === 0) {
    missingInformation.push('No Personal Space context was approved for this run; results reflect generic parameters.');
  }

  const followUpQuestions = [
    'What single factor, if altered unexpectedly, would reverse your preference?',
    'Have you confirmed the feasibility of your top constraint with stakeholders or advisors?',
    'What is your fallback plan if implementation takes twice as long as anticipated?',
  ];

  // Construct final verdict for decisive clarity
  const runnerUp = scores.alternativeScores.find((a) => a.rank === 2);
  const scoreDiff = (topOption?.totalScore ?? 0) - (runnerUp?.totalScore ?? 0);
  const confidence: 'high' | 'moderate' | 'conditional' =
    scoreDiff >= 12 ? 'high' : scoreDiff >= 5 ? 'moderate' : 'conditional';

  const bestChoiceName = topOption?.alternativeName || alternatives[0]?.name || 'Top Option';
  const bestChoiceId = topOption?.alternativeId || alternatives[0]?.id || '';

  const finalVerdict = {
    recommendedAlternativeId: bestChoiceId,
    verdictTitle: `Recommended Choice: ${bestChoiceName}`,
    confidence,
    bottomLineReasoning: topOption?.totalScore
      ? `"${bestChoiceName}" emerges as your strongest path with a leading utility score of ${topOption.totalScore}/100, outperforming alternatives across your highest-weighted priorities.`
      : `"${bestChoiceName}" is recommended as the most aligned option based on your qualitative criteria.`,
    keyTradeOff: tradeOffs[0] || 'Balancing immediate execution speed against long-term flexibility.',
    nextAction: `Formally commit to "${bestChoiceName}" as your primary strategy and schedule an initial milestone review.`,
  };

  const conversational = {
    whatImHearing: decision.description
      ? `Okay, I get what's on your mind. You're weighing "${decision.title}" because: "${decision.description}".`
      : `Okay, I hear what you're working through with "${decision.title}". You're trying to figure out which direction serves your everyday life best.`,
    thinkingTogether: `If I were helping you think this through as a friend, I'd look at how each option actually impacts your daily energy, peace of mind, expenses, and long-term satisfaction—not just what sounds good on paper.`,
    questionsToPonder: [
      `What is the one factor here that, if it goes wrong, would cause you the most regret?`,
      `How much does your everyday comfort and peace of mind compare to potential future upside?`,
      `If you had to make this call right now without overthinking, which option feels right in your gut?`,
    ],
    priorityPills: [
      'Growth & Opportunities',
      'Peace of Mind & Comfort',
      'Daily Distance & Time',
      'Cost & Financial Freedom',
      'Family & Relationships',
      "I'm not sure yet",
    ],
    honestVerdict: topOption?.totalScore
      ? `Honestly, from what you've shared so far, "${bestChoiceName}" feels like your strongest move. It gives you the best balance where it matters most, as long as you're okay with ${tradeOffs[0] ? tradeOffs[0].toLowerCase() : 'the primary trade-off'}.`
      : `Honestly, "${bestChoiceName}" seems to fit your situation best right now. Take a deep breath and trust your instincts.`,
  };

  return {
    summary,
    finalVerdict,
    conversational,
    alternativeInsights,
    tradeOffs,
    risks,
    uncertainties: uncertainties.length > 0 ? uncertainties : ['Minimal immediate data uncertainties detected.'],
    missingInformation: missingInformation.length > 0 ? missingInformation : ['All core decision parameters provided.'],
    assumptions: decision.assumptions.length > 0 ? decision.assumptions : ['Assumed standard conditions and unvarying constraints.'],
    followUpQuestions,
    overallNote: 'This decision intelligence assessment is deterministic and advisory. The final choice always rests with you.',
  };
}

function generateLocalScenarioExplanation(
  baseline: DeterministicResults,
  scenario: DeterministicResults,
  changedInputs: any
): AIScenarioResponse {
  const changes: string[] = [];

  scenario.alternativeScores.forEach((sAlt) => {
    const bAlt = baseline.alternativeScores.find((b) => b.alternativeId === sAlt.alternativeId);
    if (bAlt && sAlt.totalScore !== null && bAlt.totalScore !== null) {
      const diff = Math.round((sAlt.totalScore - bAlt.totalScore) * 10) / 10;
      if (diff > 0) {
        changes.push(`"${sAlt.alternativeName}" improved by +${diff} points (from ${bAlt.totalScore} to ${sAlt.totalScore}).`);
      } else if (diff < 0) {
        changes.push(`"${sAlt.alternativeName}" decreased by ${diff} points (from ${bAlt.totalScore} to ${sAlt.totalScore}).`);
      } else {
        changes.push(`"${sAlt.alternativeName}" remained steady at ${sAlt.totalScore} points.`);
      }
    }
  });

  return {
    summary: 'The scenario simulation tested the sensitivity of alternative rankings under modified weights and parameters.',
    changes: changes.length > 0 ? changes : ['No significant score divergence observed.'],
    limitations: [
      'Scenario models are mathematical sensitivities, not predictions of future events.',
      'Altering weights reflects shifting subjective priorities, not changes in real-world conditions.',
    ],
  };
}
