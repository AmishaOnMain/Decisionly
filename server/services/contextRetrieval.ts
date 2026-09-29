import { PersonalContextEntry, Decision } from '../../shared/types/index.js';
import { personalContextRepository } from '../db/repositories/personalContext.js';

export interface CandidateContextEntry {
  entry: PersonalContextEntry;
  relevanceScore: number;
  matchReasons: string[];
  isReviewDue: boolean;
  suggested: boolean;
}

export const contextRetrievalService = {
  async getCandidateContext(
    userId: string,
    decision: Decision
  ): Promise<CandidateContextEntry[]> {
    const allEntries = await personalContextRepository.listByUser(userId, {
      includeArchived: false,
    });

    const now = new Date();
    const decisionText = [
      decision.title,
      decision.description,
      decision.category,
      decision.custom_category || '',
      decision.desired_outcome || '',
      ...(decision.constraints || []),
      ...(decision.assumptions || []),
    ]
      .join(' ')
      .toLowerCase();

    // Extract significant keywords (longer than 3 chars)
    const keywords = Array.from(
      new Set(
        decisionText
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter((w) => w.length > 3)
      )
    );

    const candidates: CandidateContextEntry[] = allEntries.map((entry) => {
      let score = 0;
      const matchReasons: string[] = [];

      const entryTitleLower = entry.title.toLowerCase();
      const entryContentLower = entry.content.toLowerCase();

      // Check review date status
      const isReviewDue = entry.review_at ? new Date(entry.review_at) <= now : false;

      // Category / Type heuristics
      if (entry.entry_type === 'goal') {
        score += 2;
        matchReasons.push('Active personal goal');
      }
      if (entry.entry_type === 'constraint') {
        score += 3;
        matchReasons.push('Standing personal constraint');
      }

      // Keyword matching
      let matchedKeywordCount = 0;
      for (const kw of keywords) {
        if (entryTitleLower.includes(kw) || entryContentLower.includes(kw)) {
          matchedKeywordCount++;
        }
      }

      if (matchedKeywordCount > 0) {
        score += Math.min(matchedKeywordCount * 2, 8);
        matchReasons.push(`Shares ${matchedKeywordCount} related keyword(s) with decision`);
      }

      // Check for direct category mentions
      const catLower = decision.category.toLowerCase();
      if (entryTitleLower.includes(catLower) || entryContentLower.includes(catLower)) {
        score += 4;
        matchReasons.push(`Directly mentions ${decision.category} topic`);
      }

      const suggested = score >= 2;

      return {
        entry,
        relevanceScore: score,
        matchReasons: matchReasons.length > 0 ? matchReasons : ['General personal context'],
        isReviewDue,
        suggested,
      };
    });

    // Sort by relevance score descending
    candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return candidates;
  },
};
