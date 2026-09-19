import { Children, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCarousel } from '../hooks/useCarousel';

interface Props {
  children: ReactNode;
  label: string;
}

// Carrusel horizontal: una propuesta visible por vez, scroll-snap,
// botones, flechas del teclado y swipe nativo en móvil. Sin librerías.
export function Carousel({ children, label }: Props) {
  const count = Children.count(children);
  const { trackRef, index, goTo, handleScroll, handleKeyDown } = useCarousel(count);

  const navButton =
    'hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-edge/60 bg-surface-raised text-secondary hover:bg-surface-hover hover:text-primary active:scale-[0.97] disabled:opacity-40 md:inline-flex';
  const navButtonMobile =
    'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-edge/60 bg-surface-raised text-secondary hover:bg-surface-hover hover:text-primary active:scale-[0.97] disabled:opacity-40 md:hidden';

  return (
    <section role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={navButton}
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Propuesta anterior"
        >
          <ChevronLeft size={20} aria-hidden />
        </button>

        <div
          ref={trackRef}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-label={`${label}. Usa las flechas del teclado para navegar.`}
          className="no-scrollbar flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto pb-1"
        >
          {Children.map(children, (child, i) => (
            <div
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${count}`}
              className="w-full shrink-0 snap-center"
            >
              {child}
            </div>
          ))}
        </div>

        <button
          type="button"
          className={navButton}
          onClick={() => goTo(index + 1)}
          disabled={index === count - 1}
          aria-label="Propuesta siguiente"
        >
          <ChevronRight size={20} aria-hidden />
        </button>
      </div>

      {/* Controles móviles: botones debajo junto al contador. */}
      <div className="mt-4 flex items-center justify-between md:hidden">
        <button
          type="button"
          className={navButtonMobile}
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Propuesta anterior"
        >
          <ChevronLeft size={20} aria-hidden />
        </button>
        <MobileCounter index={index} count={count} goTo={goTo} />
        <button
          type="button"
          className={navButtonMobile}
          onClick={() => goTo(index + 1)}
          disabled={index === count - 1}
          aria-label="Propuesta siguiente"
        >
          <ChevronRight size={20} aria-hidden />
        </button>
      </div>

      {/* Contador y puntos en escritorio. */}
      <div className="mt-4 hidden items-center justify-center gap-4 md:flex">
        <MobileCounter index={index} count={count} goTo={goTo} />
      </div>
    </section>
  );
}

function MobileCounter({
  index,
  count,
  goTo,
}: {
  index: number;
  count: number;
  goTo: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <p aria-live="polite" className="font-mono text-xs text-secondary">
        {index + 1} / {count}
      </p>
      <div className="flex items-center gap-1" role="group" aria-label="Elegir propuesta">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir a la propuesta ${i + 1}`}
            aria-current={i === index}
            onClick={() => goTo(i)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center active:scale-[0.97]"
          >
            <span
              aria-hidden
              className={
                i === index
                  ? 'h-2.5 w-2.5 rounded-full bg-primary'
                  : 'h-2.5 w-2.5 rounded-full border border-edge bg-surface-raised'
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
}
