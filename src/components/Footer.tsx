import { useState } from 'react';
import { config } from '../config';
import { developers, type Developer } from '../data/developers';
import { SocialIcon, socialLabel } from './SocialIcons';

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function DeveloperCard({ dev }: { dev: Developer }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPlaceholder = !dev.photo || imgFailed;

  return (
    <article className="rounded-lg border border-edge/60 bg-surface-card p-5 hover:bg-surface-hover">
      <div className="flex items-center gap-4">
        {showPlaceholder ? (
          <div
            role="img"
            aria-label={`Avatar de ${dev.name}`}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-edge bg-surface-raised font-mono text-lg text-secondary"
          >
            {initials(dev.name)}
          </div>
        ) : (
          <img
            src={dev.photo}
            alt={`Foto de ${dev.name}`}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="photo-gray h-16 w-16 shrink-0 rounded-full border border-edge object-cover"
          />
        )}
        <div>
          <h3 className="text-sm font-medium text-primary">{dev.name}</h3>
          <p className="mt-0.5 font-mono text-xs text-muted">{dev.role}</p>
        </div>
      </div>
      {dev.socials.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label={`Redes de ${dev.name}`}>
          {dev.socials.map((s) => (
            <li key={s.type}>
              <a
                href={s.url}
                target={s.url.startsWith('mailto:') ? undefined : '_blank'}
                rel="noreferrer"
                aria-label={`${socialLabel(s.type)} de ${dev.name}`}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-edge/60 bg-surface-raised text-secondary hover:bg-surface-hover hover:text-primary active:scale-[0.97]"
              >
                <SocialIcon type={s.type} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

// Footer con las tarjetas de desarrolladores.
export function Footer() {
  return (
    <footer className="border-t border-edge/50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-center font-pixel text-xl text-primary">Desarrollado por</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {developers.map((dev) => (
            <DeveloperCard key={dev.name} dev={dev} />
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-muted">
          © {config.year} Promoción {config.year} · Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
