import { CheckCircle2 } from 'lucide-react';
import type { DoneSummary } from '../types';

// Vista "done": confirmación sin botón para votar de nuevo.
export function DoneView({ summary }: { summary: DoneSummary }) {
  return (
    <section className="relative">
      <div className="hero-glow pointer-events-none absolute inset-x-0 top-0 h-64" aria-hidden />
      <div className="relative mx-auto max-w-2xl px-4 py-12 text-center sm:px-6 sm:py-16">
        <CheckCircle2 size={40} className="mx-auto text-primary" aria-hidden />
        <h1 className="hero-title mt-4 text-primary">Voto registrado</h1>
        <p className="lede mt-4">
          Gracias por participar. Tu código ya no puede volver a usarse.
        </p>
        <div className="mx-auto mt-8 max-w-md rounded-lg border border-edge/60 bg-surface-card p-6 text-left">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Tu voto a favor
          </p>
          <p className="mt-2 font-pixel text-xl text-primary">{summary.proposalName}</p>
          <ul className="mt-4 space-y-1 border-t border-edge-subtle pt-3 text-sm">
            {summary.ratings.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2">
                <span className="truncate text-secondary">{item.name}</span>
                <span className="shrink-0 font-mono text-xs text-primary">
                  {item.score === null ? 'Sin calificar' : `${item.score}/10`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
