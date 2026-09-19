import { Moon, Sun } from 'lucide-react';
import { config } from '../config';
import type { Theme } from '../hooks/useTheme';

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
}

// Header: h-14, borde inferior, solo logotipo + botón de tema.
export function Header({ theme, onToggleTheme }: Props) {
  return (
    <header className="h-14 border-b border-edge/50">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <span className="font-pixel text-lg tracking-tight text-primary">
          {config.siteName}
        </span>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-edge/60 bg-surface-raised px-3 font-mono text-sm text-secondary hover:bg-surface-hover hover:text-primary active:scale-[0.97]"
        >
          {theme === 'dark' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
        </button>
      </div>
    </header>
  );
}
