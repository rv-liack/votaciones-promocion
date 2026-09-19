import type { Proposal } from '../types';
import { resolveImageUrl } from '../lib/images';
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
            <div className="mt-3 space-y-3">
              {proposal.extra_info.map((item) => {
                const isImage = /\.(jpe?g|png|gif|webp|svg)$/i.test(item.value);
                return (
                  <div key={item.label}>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted">
                      {item.label}
                    </p>
                    {isImage ? (
                      <img
                        src={resolveImageUrl(item.value)}
                        alt={`${proposal.promotion_name}: ${item.label}`}
                        loading="lazy"
                        className="mt-1 aspect-[4/3] w-full rounded-md border border-edge object-cover"
                      />
                    ) : (
                      <p className="mt-0.5 text-sm text-secondary">{item.value}</p>
                    )}
                  </div>
                );
              })}
            </div>
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
