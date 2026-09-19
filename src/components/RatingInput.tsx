interface Props {
  value: number | undefined;
  onChange: (score: number) => void;
  proposalId: string;
  proposalName: string;
}

// Calificación 1–10: radiogroup de 10 botones (móvil: cuadrícula 5×2).
// Seleccionado = colores invertidos. Calificar es opcional.
export function RatingInput({ value, onChange, proposalId, proposalName }: Props) {
  return (
    <div>
      <p id={`rating-label-${proposalId}`} className="font-mono text-xs uppercase tracking-widest text-muted">
        Tu calificación (opcional)
      </p>
      <div
        role="radiogroup"
        aria-labelledby={`rating-label-${proposalId}`}
        aria-label={`Calificación para ${proposalName}`}
        className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-10"
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${n} de 10`}
              onClick={() => onChange(n)}
              className={
                selected
                  ? 'min-h-[44px] rounded-md bg-primary font-mono text-sm font-medium text-surface active:scale-[0.97]'
                  : 'min-h-[44px] rounded-md border border-edge bg-surface font-mono text-sm text-secondary hover:bg-surface-hover hover:text-primary active:scale-[0.97]'
              }
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
