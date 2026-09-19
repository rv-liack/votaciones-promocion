import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
}

// Lightbox accesible: clic para ampliar, Esc para cerrar, foco gestionado.
export function Lightbox({ src, alt, onClose }: Props) {
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.getElementById('lightbox-close')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <div className="relative max-h-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <button
          id="lightbox-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar imagen ampliada"
          className="absolute -top-2 right-0 inline-flex min-h-[44px] min-w-[44px] -translate-y-full items-center justify-center rounded-lg border border-edge bg-surface-raised font-mono text-sm text-secondary hover:text-primary"
        >
          <X size={18} aria-hidden />
        </button>
        <img
          src={src}
          alt={alt}
          className="max-h-[80vh] w-auto rounded-lg border border-edge bg-surface object-contain"
        />
      </div>
    </div>
  );
}
