import type { Proposal } from '../types';
import { ProposalGallery } from './ProposalGallery';
import { RatingInput } from './RatingInput';

interface Props {
  proposal: Proposal;
  index: number;
  rating: number | undefined;
  onRate: (proposalId: string, score: number) => void;
  onVoteIntent: (proposal: Proposal) => void;
  votingBlocked: boolean;
  isFirst: boolean;
}

// Tarjeta de propuesta: kicker, nombre, eslogan, galería,
// información adicional, calificación y voto a favor.
export function ProposalCard({ proposal, index, rating, onRate, onVoteIntent, votingBlocked, isFirst }: Props) {
  const kicker = `Propuesta ${String(index + 1).padStart(2, '0')}`;
  return (
    <article className="rounded-lg border border-edge/60 bg-surface-card p-5 hover:bg-surface-hover sm:p-6">
      <p className="kicker">{kicker}</p>
      <h3 className="mt-2 font-pixel text-2xl leading-tight text-primary">
        {proposal.promotion_name}
      </h3>
      {proposal.tagline && <p className="mt-1 text-sm text-secondary">{proposal.tagline}</p>}

      <div className="mt-5">
        <ProposalGallery
          shirtImages={proposal.shirt_images}
          jacketImages={proposal.jacket_images}
          proposalName={proposal.promotion_name}
          eagerFirst={isFirst}
        />
      </div>

      {(proposal.description || proposal.extra_info.length > 0) && (
        <div className="mt-5 border-t border-edge-subtle pt-4">
          <h4 className="font-mono text-xs uppercase tracking-widest text-muted">
            Información adicional
          </h4>
          {proposal.description && <p className="prose-body mt-2">{proposal.description}</p>}
          {proposal.extra_info.length > 0 && (
            <dl className="mt-3 space-y-2">
              {proposal.extra_info.map((item) => (
                <div key={item.label} className="flex gap-2 text-sm">
                  <dt className="shrink-0 font-mono text-xs uppercase tracking-widest text-muted">
                    {item.label}:
                  </dt>
                  <dd className="text-secondary">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      <div className="mt-5 border-t border-edge-subtle pt-4">
        <RatingInput
          value={rating}
          onChange={(score) => onRate(proposal.id, score)}
          proposalId={proposal.id}
          proposalName={proposal.promotion_name}
        />
        <button
          type="button"
          onClick={() => onVoteIntent(proposal)}
          disabled={votingBlocked}
          className="mt-4 min-h-[44px] w-full rounded-lg bg-primary px-4 py-2 font-mono text-sm font-medium text-surface hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
        >
          Votar a favor
        </button>
      </div>
    </article>
  );
}
