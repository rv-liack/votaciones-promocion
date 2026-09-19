import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
const KEY = 'promo.vote.theme';

function initialTheme(): Theme {
  try {
    if (localStorage.getItem(KEY) === 'light') return 'light';
  } catch {
    // Sin acceso a localStorage: tema oscuro por defecto.
  }
  return 'dark';
}

// Tema oscuro por defecto; la clase "light" en <html> activa el claro.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(KEY, next);
      } catch {
        // Preferencia no guardada: se mantiene solo en memoria.
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
