import React from 'react';
import { Trophy, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { DeterministicResults } from '@shared/types/index.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';

interface ScoreChartProps {
  scores: DeterministicResults;
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ scores }) => {
  if (!scores.isComputable || scores.alternativeScores.length === 0) {
    return (
      <Card className="p-6 text-center text-xs text-slate-500 space-y-2 border-dashed">
        <Info className="w-6 h-6 mx-auto text-slate-400" />
        <p className="font-medium text-slate-700 dark:text-slate-300">
          Scores cannot be computed yet
        </p>
        <p>{scores.scoringMethodExplanation}</p>
      </Card>
    );
  }

  // Sort alternative scores by rank
  const sorted = [...scores.alternativeScores].sort((a, b) => (a.rank || 999) - (b.rank || 999));

  return (
    <div className="space-y-4">
      {/* Top Banner / Winner Highlight if present */}
      {scores.winnerAlternativeId && (
        <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-300">
                Top Deterministic Alignment
              </p>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {sorted[0]?.alternativeName}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
              {sorted[0]?.totalScore}/100
            </span>
          </div>
        </div>
      )}

      {/* Alternative comparative score bars */}
      <div className="space-y-3">
        {sorted.map((alt, idx) => {
          const score = alt.totalScore || 0;
          const isWinner = alt.rank === 1;

          return (
            <Card key={alt.alternativeId} className="p-4 border-slate-200 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isWinner
                        ? 'bg-amber-400/20 text-amber-600 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    #{alt.rank || idx + 1}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {alt.alternativeName}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {alt.uncertaintyFlag ? (
                    <Badge variant="warning" size="sm">
                      <AlertTriangle className="w-3 h-3" /> {Math.round(alt.knownRatio * 100)}% Data Known
                    </Badge>
                  ) : (
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="w-3 h-3" /> Complete Data
                    </Badge>
                  )}
                  <span className="text-base font-extrabold text-slate-900 dark:text-white w-14 text-right">
                    {score}/100
                  </span>
                </div>
              </div>

              {/* Visual Bar */}
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isWinner
                      ? 'bg-gradient-to-r from-brand-600 to-cyan-500 shadow-sm'
                      : 'bg-slate-400 dark:bg-slate-600'
                  }`}
                  style={{ width: `${Math.max(score, 3)}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Uncertainty and Method Footnote */}
      <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          Scoring Methodology & Transparency Note
        </p>
        <p>{scores.scoringMethodExplanation}</p>
      </div>
    </div>
  );
};
