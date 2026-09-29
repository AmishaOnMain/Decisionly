import React from 'react';
import { Alternative, Criterion, DeterministicResults } from '@shared/types/index.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MatrixTableProps {
  alternatives: Alternative[];
  criteria: Criterion[];
  scores: DeterministicResults;
}

export const MatrixTable: React.FC<MatrixTableProps> = ({
  alternatives,
  criteria,
  scores,
}) => {
  return (
    <Card className="overflow-hidden border-slate-200 dark:border-white/10">
      <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Multi-Criteria Evaluation Matrix
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Raw inputs and normalized mathematical contributions per alternative.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-100/70 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/5">
            <tr>
              <th className="py-3 px-4">Evaluation Criteria</th>
              <th className="py-3 px-4">Direction</th>
              <th className="py-3 px-4">Normalized Weight</th>
              {alternatives.map((alt) => (
                <th key={alt.id} className="py-3 px-4 text-center font-bold text-slate-800 dark:text-white">
                  {alt.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {criteria.map((c) => {
              const normWeight = scores.normalizedWeights?.[c.id] || 0;
              const weightPct = Math.round(normWeight * 100);

              return (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    {c.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {c.direction === 'higher_better' && (
                        <>
                          <ArrowUpRight className="w-3 h-3 text-emerald-500" /> Higher
                        </>
                      )}
                      {c.direction === 'lower_better' && (
                        <>
                          <ArrowDownRight className="w-3 h-3 text-amber-500" /> Lower (Cost)
                        </>
                      )}
                      {c.direction === 'judgment' && '⚖️ Judgment'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      {weightPct}%
                    </span>
                  </td>

                  {/* Values for each alternative */}
                  {alternatives.map((alt) => {
                    const scoreObj = scores.alternativeScores.find((s) => s.alternativeId === alt.id);
                    const breakdown = scoreObj?.breakdown[c.id];

                    if (!breakdown || breakdown.isUnknown) {
                      return (
                        <td key={alt.id} className="py-3 px-4 text-center">
                          <span className="text-amber-500 text-[11px] bg-amber-500/10 px-2 py-0.5 rounded">
                            Unknown
                          </span>
                        </td>
                      );
                    }

                    return (
                      <td key={alt.id} className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {breakdown.rawValue}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            (Norm: {Math.round((breakdown.normalizedScore || 0) * 100)}%)
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          {/* Footer Total Score Row */}
          <tfoot className="bg-slate-50/80 dark:bg-slate-900/80 font-bold border-t-2 border-slate-200 dark:border-white/10 text-xs">
            <tr>
              <td colSpan={3} className="py-3.5 px-4 text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Deterministic Utility Score (0 - 100)
              </td>
              {alternatives.map((alt) => {
                const scoreObj = scores.alternativeScores.find((s) => s.alternativeId === alt.id);
                const score = scoreObj?.totalScore;

                return (
                  <td key={alt.id} className="py-3.5 px-4 text-center">
                    {score !== null && score !== undefined ? (
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
                          {score}/100
                        </span>
                        {scoreObj?.rank && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Rank #{scoreObj.rank}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Insufficient Data</span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
};
