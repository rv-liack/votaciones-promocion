import { useState } from 'react';
import { Lightbox } from './Lightbox';

interface Props {
  shirtImages: string[];
  jacketImages: string[];
  proposalName: string;
  eagerFirst: boolean;
}

function GalleryGroup({
  label,
  images,
  proposalName,
  eager,
  onZoom,
}: {
  label: string;
  images: string[];
  proposalName: string;
  eager: boolean;
  onZoom: (src: string, alt: string) => void;
}) {
  if (images.length === 0) return null;
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-muted">{label}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {images.map((src, i) => {
          const alt = `${proposalName}: ${label.toLowerCase()} ${i + 1} de ${images.length}`;
          return (
            <button
              key={src + i}
              type="button"
              onClick={() => onZoom(src, alt)}
              aria-label={`Ampliar ${alt}`}
              className="overflow-hidden rounded-md border border-edge bg-surface active:scale-[0.97]"
            >
              {/* Las imágenes conservan sus colores originales. */}
              <img
                src={src}
                alt={alt}
                loading={eager && i === 0 ? 'eager' : 'lazy'}
                className="aspect-[4/5] w-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Galería de T-shirt (frente/espalda) y chaqueta con etiquetas.
export function ProposalGallery({ shirtImages, jacketImages, proposalName, eagerFirst }: Props) {
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);

  return (
    <div className="space-y-4">
      <GalleryGroup
        label="Camiseta"
        images={shirtImages}
        proposalName={proposalName}
        eager={eagerFirst}
        onZoom={(src, alt) => setZoom({ src, alt })}
      />
      <GalleryGroup
        label="Chaqueta"
        images={jacketImages}
        proposalName={proposalName}
        eager={false}
        onZoom={(src, alt) => setZoom({ src, alt })}
      />
      {zoom && <Lightbox src={zoom.src} alt={zoom.alt} onClose={() => setZoom(null)} />}
    </div>
  );
}
