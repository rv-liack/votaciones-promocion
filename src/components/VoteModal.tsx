import { useEffect, useRef, type KeyboardEvent } from 'react';
import { TriangleAlert } from 'lucide-react';
import type { Proposal, RatedSummaryItem } from '../types';

interface Props {
  proposal: Proposal;
  summary: RatedSummaryItem[];
  sending: boolean;
  serverError: string;
  onCancel: () => void;
  onConfirm: () => void;
}

// Modal accesible: focus trap, Esc para cerrar, foco devuelto al cerrar.
export function VoteModal({ proposal, summary, sending, serverError, onCancel, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    prevFocus.current = document.activeElement as HTMLElement | null;
    document.getElementById('vote-cancel')?.focus();
    return () => prevFocus.current?.focus();
  }, []);

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      if (!sending) onCancel();
      return;
    }
    if (e.key !== 'Tab') return;
    const root = dialogRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vote-modal-title"
        onKeyDown={handleKeyDown}
        className="w-full max-w-md rounded-lg border border-edge bg-surface-card p-6"
      >
        <div className="flex items-center gap-3">
          <TriangleAlert size={22} className="shrink-0 text-primary" aria-hidden />
          <h2 id="vote-modal-title" className="font-pixel text-xl text-primary">
            Confirma tu voto
          </h2>
        </div>

        <p className="mt-4 text-sm text-primary">
          Votarás a favor de <strong>{proposal.promotion_name}</strong>.
        </p>
        <p className="prose-body mt-2">
          Esta votación es única y no podrá ser cambiada. Una vez confirmada, tu código quedará
          inhabilitado.
        </p>

        <div className="mt-4 border-t border-edge-subtle pt-3">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
            Resumen de tus calificaciones
          </h3>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm">
            {summary.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2">
                <span className="truncate text-secondary">{item.name}</span>
                <span className="shrink-0 font-mono text-xs text-primary">
                  {item.score === null ? 'Sin calificar' : `${item.score}/10`}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p aria-live="polite" className="mt-3 min-h-[1.5rem] text-sm font-medium text-primary">
          {serverError}
        </p>

        <div className="mt-2 flex gap-3">
          <button
            id="vote-cancel"
            type="button"
            onClick={onCancel}
            disabled={sending}
            className="min-h-[44px] flex-1 rounded-lg border border-edge/60 bg-surface-raised px-4 py-2 font-mono text-sm text-secondary hover:bg-surface-hover hover:text-primary active:scale-[0.97] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={sending}
            className="min-h-[44px] flex-1 rounded-lg bg-primary px-4 py-2 font-mono text-sm font-medium text-surface hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
          >
            {sending ? 'Enviando…' : 'Confirmar voto'}
          </button>
        </div>
      </div>
    </div>
  );
}
