import { useMemo, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Lightbox } from './Lightbox';

interface Props {
  shirtImages: string[];
  jacketImages: string[];
  proposalName: string;
  eagerFirst: boolean;
}

interface GalleryItem {
  src: string;
  label: string;
}

// Galería completa: visor principal con flechas, teclado y swipe,
// tira de miniaturas clicables, contador y clic para ampliar.
// Muestra TODAS las imágenes (camiseta + chaqueta), no solo 4.
export function ProposalGallery({ shirtImages, jacketImages, proposalName, eagerFirst }: Props) {
  const items = useMemo<GalleryItem[]>(
    () => [
      ...shirtImages.map((src, i) => ({
        src,
        label: `Camiseta ${i + 1} de ${shirtImages.length}`,
      })),
      ...jacketImages.map((src, i) => ({
        src,
        label: `Chaqueta ${i + 1} de ${jacketImages.length}`,
      })),
    ],
    [shirtImages, jacketImages],
  );

  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = items.length;

  if (count === 0) return null;
  const current = items[Math.max(0, Math.min(index, count - 1))];
  const alt = `${proposalName}: ${current.label}`;

  function goTo(next: number) {
    // Navegación circular: del final vuelve al inicio y viceversa.
    setIndex(((next % count) + count) % count);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      goTo(index + (e.key === 'ArrowRight' ? 1 : -1));
    }
  }

  function handleTouchStart(e: TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: TouchEvent) {
    if (touchX.current === null) return;
    const delta = touchX.current - e.changedTouches[0].clientX;
    touchX.current = null;
    if (Math.abs(delta) > 40) goTo(index + (delta > 0 ? 1 : -1));
  }

  const navButton =
    'absolute top-1/2 inline-flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-edge/60 bg-surface-raised/90 text-secondary hover:bg-surface-hover hover:text-primary active:scale-[0.97]';

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Galería</p>
        <p aria-live="polite" className="font-mono text-xs text-secondary">
          {index + 1} / {count}
        </p>
      </div>

      <div
        tabIndex={0}
        role="group"
        aria-roledescription="galería"
        aria-label={`Galería de ${proposalName}. Usa las flechas para navegar.`}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative mt-2 overflow-hidden rounded-md border border-edge bg-surface"
      >
        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label={`Ampliar ${alt}`}
          className="block w-full active:scale-[0.99]"
        >
          {/* Las imágenes conservan sus colores originales. */}
          <img
            key={current.src}
            src={current.src}
            alt={alt}
            loading={eagerFirst && index === 0 ? 'eager' : 'lazy'}
            className="aspect-[4/3] w-full object-cover"
          />
        </button>
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Imagen anterior"
              className={`${navButton} left-2`}
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Imagen siguiente"
              className={`${navButton} right-2`}
            >
              <ChevronRight size={20} aria-hidden />
            </button>
          </>
        )}
      </div>
      <p className="mt-2 text-center font-mono text-xs text-muted">{current.label}</p>

      {count > 1 && (
        <div
          className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label="Miniaturas"
        >
          {items.map((item, i) => (
            <button
              key={item.src + i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver ${proposalName}: ${item.label}`}
              aria-current={i === index}
              className={
                i === index
                  ? 'shrink-0 overflow-hidden rounded-md border-2 border-primary active:scale-[0.97]'
                  : 'shrink-0 overflow-hidden rounded-md border border-edge active:scale-[0.97] hover:border-secondary'
              }
            >
              <img
                src={item.src}
                alt=""
                loading="lazy"
                className="h-16 w-16 object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {zoom && <Lightbox src={current.src} alt={alt} onClose={() => setZoom(false)} />}
    </div>
  );
}
