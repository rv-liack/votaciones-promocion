// Distribución de calificaciones por propuesta: barras horizontales por score 1-10.
import type { RatingDistributionItem, ProposalResult } from '../../types';

interface Props {
  proposal: ProposalResult;
  distribution: RatingDistributionItem[];
}

const SCORE_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#f59e0b',
  4: '#eab308',
  5: '#ca8a04',
  6: '#84cc16',
  7: '#22c55e',
  8: '#14b8a6',
  9: '#0ea5e9',
  10: '#6366f1',
};

export function RatingDistribution({ proposal, distribution }: Props) {
  const items = distribution.filter((d) => d.proposal_id === proposal.id);
  const scoreMap = new Map<number, number>();
  for (const item of items) {
    scoreMap.set(item.score, (scoreMap.get(item.score) ?? 0) + item.count);
  }

  const scores = Array.from({ length: 10 }, (_, i) => i + 1);
  const maxCount = Math.max(...scores.map((s) => scoreMap.get(s) ?? 0), 1);

  return (
    <div className="rounded-lg border border-edge/60 bg-surface-card p-5">
      <h4 className="font-pixel text-base text-primary">{proposal.promotion_name}</h4>
      <div className="mt-3 flex items-baseline gap-4 text-sm">
        <span className="text-secondary">
          Promedio: <span className="font-mono text-primary">{proposal.avg_score ?? '—'}</span>
        </span>
        <span className="text-secondary">
          Calificaciones: <span className="font-mono text-primary">{proposal.ratings_count}</span>
        </span>
      </div>
      <div className="mt-4 space-y-1.5">
        {scores.map((score) => {
          const count = scoreMap.get(score) ?? 0;
          const pct = (count / maxCount) * 100;
          return (
            <div key={score} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-right font-mono text-xs text-muted">{score}</span>
              <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-surface-raised">
                <div
                  className="h-full rounded-sm transition-all"
                  style={{ width: `${pct}%`, backgroundColor: SCORE_COLORS[score] }}
                />
              </div>
              <span className="w-8 shrink-0 text-right font-mono text-xs text-primary">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
