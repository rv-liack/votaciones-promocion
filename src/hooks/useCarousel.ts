import { useCallback, useRef, useState, type KeyboardEvent } from 'react';

// Estado propio del carrusel sobre CSS scroll-snap (sin librerías).
export function useCarousel(count: number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(count - 1, next));
      setIndex(clamped);
      const el = trackRef.current;
      if (el) {
        el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
      }
    },
    [count],
  );

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(Math.max(0, Math.min(count - 1, next)));
  }, [count]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(index - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(index + 1);
      }
    },
    [goTo, index],
  );

  return { trackRef, index, goTo, handleScroll, handleKeyDown };
}
