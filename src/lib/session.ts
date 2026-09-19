import type { DoneSummary, DraftRatings } from '../types';

// Persistencia en sessionStorage (NO en localStorage):
// el código validado y el borrador sobreviven al refresco,
// pero se limpian al cerrar la pestaña o al votar/salir.

const CODE_KEY = 'promo.vote.code';
const DRAFT_KEY = 'promo.vote.drafts';
const DONE_KEY = 'promo.vote.done';

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Almacenamiento no disponible: se sigue en memoria.
  }
}

function remove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Sin almacenamiento: nada que limpiar.
  }
}

export const session = {
  getCode: () => read(CODE_KEY),
  setCode: (code: string) => write(CODE_KEY, code),
  clearCode: () => remove(CODE_KEY),

  getDrafts(): DraftRatings {
    const raw = read(DRAFT_KEY);
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw) as DraftRatings;
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  },
  setDrafts: (drafts: DraftRatings) => write(DRAFT_KEY, JSON.stringify(drafts)),
  clearDrafts: () => remove(DRAFT_KEY),

  getDone(): DoneSummary | null {
    const raw = read(DONE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as DoneSummary;
    } catch {
      return null;
    }
  },
  setDone: (summary: DoneSummary) => write(DONE_KEY, JSON.stringify(summary)),
  clearDone: () => remove(DONE_KEY),
};
