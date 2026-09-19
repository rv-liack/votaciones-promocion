import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { castVote, getProposals } from '../lib/api';
import { maskCode } from '../lib/code';
import { session } from '../lib/session';
import type { DoneSummary, DraftRatings, Proposal, RatedSummaryItem } from '../types';
import { Carousel } from './Carousel';
import { ProposalCard } from './ProposalCard';
import { VoteModal } from './VoteModal';

interface Props {
  code: string;
  onExited: () => void;
  onVoted: (summary: DoneSummary) => void;
}

const LOAD_ERROR = 'No se pudo conectar. Inténtalo de nuevo.';
const USED_MESSAGE = 'Este código ya fue utilizado. Cada código permite una sola votación.';
const INVALID_MESSAGE = 'Código no válido.';

// Vista "vote": barra superior, carrusel, calificación y voto único.
export function VoteView({ code, onExited, onVoted }: Props) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [drafts, setDrafts] = useState<DraftRatings>(() => session.getDrafts());
  const [modalFor, setModalFor] = useState<Proposal | null>(null);
  const [sending, setSending] = useState(false);
  const [voteError, setVoteError] = useState('');
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let alive = true;
    getProposals(code)
      .then((data) => {
        if (alive) {
          setProposals(data);
          setLoadError('');
        }
      })
      .catch((err: Error) => {
        if (!alive) return;
        if (err.message === 'already_used') {
          setLoadError(USED_MESSAGE);
          setBlocked(true);
        } else if (err.message === 'invalid_code') {
          setLoadError(INVALID_MESSAGE);
          setBlocked(true);
        } else {
          setLoadError(LOAD_ERROR);
        }
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [code]);

  function handleRate(proposalId: string, score: number) {
    setDrafts((prev) => {
      const next = { ...prev, [proposalId]: score };
      session.setDrafts(next);
      return next;
    });
  }

  const ratedCount = proposals.filter((p) => drafts[p.id] !== undefined).length;

  function buildSummary(): RatedSummaryItem[] {
    return proposals.map((p) => ({
      id: p.id,
      name: p.promotion_name,
      score: drafts[p.id] ?? null,
    }));
  }

  async function handleConfirm() {
    if (!modalFor || sending) return;
    setSending(true);
    setVoteError('');
    try {
      await castVote(code, modalFor.id, drafts);
      const summary: DoneSummary = {
        proposalId: modalFor.id,
        proposalName: modalFor.promotion_name,
        ratings: buildSummary(),
      };
      session.clearCode();
      session.clearDrafts();
      session.setDone(summary);
      onVoted(summary);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'connect';
      if (message === 'already_used') {
        setVoteError(USED_MESSAGE);
        setBlocked(true);
      } else if (message === 'invalid_code') {
        setVoteError(INVALID_MESSAGE);
        setBlocked(true);
      } else if (message === 'rate_limited') {
        setVoteError('Demasiados intentos. Espera unos minutos e inténtalo de nuevo.');
      } else {
        // Fallo de red: conserva el borrador y permite reintentar.
        setVoteError(LOAD_ERROR);
      }
    } finally {
      setSending(false);
    }
  }

  function handleExit() {
    // Salir limpia la sesión SIN consumir el código.
    session.clearCode();
    session.clearDrafts();
    onExited();
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-edge/60 bg-surface-card px-4 py-3">
        <p className="font-mono text-xs text-secondary">
          Código <span className="text-primary">{maskCode(code)}</span>
        </p>
        <p aria-live="polite" className="font-mono text-xs text-secondary">
          Calificadas: {ratedCount}/{proposals.length || '…'}
        </p>
        <button
          type="button"
          onClick={handleExit}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-edge/60 bg-surface-raised px-4 py-2 font-mono text-sm text-secondary hover:bg-surface-hover hover:text-primary active:scale-[0.97]"
        >
          <LogOut size={16} aria-hidden /> Salir
        </button>
      </div>

      <div className="mt-6">
        {loading && <p className="prose-body">Cargando propuestas…</p>}
        {!loading && loadError && (
          <div className="rounded-lg border border-edge bg-surface-card p-6">
            <p aria-live="polite" className="text-sm font-medium text-primary">
              {loadError}
            </p>
            {!blocked && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 min-h-[44px] rounded-lg border border-edge/60 bg-surface-raised px-4 py-2 font-mono text-sm text-secondary hover:bg-surface-hover hover:text-primary active:scale-[0.97]"
              >
                Reintentar
              </button>
            )}
          </div>
        )}
        {!loading && !loadError && proposals.length > 0 && (
          <Carousel label="Propuestas de la promoción">
            {proposals.map((proposal, i) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                index={i}
                rating={drafts[proposal.id]}
                onRate={handleRate}
                onVoteIntent={setModalFor}
                votingBlocked={blocked}
                isFirst={i === 0}
              />
            ))}
          </Carousel>
        )}
      </div>

      {modalFor && (
        <VoteModal
          proposal={modalFor}
          summary={buildSummary()}
          sending={sending}
          serverError={voteError}
          onCancel={() => !sending && setModalFor(null)}
          onConfirm={handleConfirm}
        />
      )}
    </section>
  );
}
