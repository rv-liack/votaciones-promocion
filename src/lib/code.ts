// Normalización y formato del código XXXX-XXXX.
// Alfabeto sin ambiguos: 23456789ABCDEFGHJKMNPQRSTUVWXYZ.

const CODE_RE = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/;

/** Mayúsculas + recorte + elimina espacios e caracteres invisibles. No valida el formato. */
export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s/g, '');
}

/** Formatea el input: filtra al alfabeto y agrupa como XXXX-XXXX. */
export function formatCodeInput(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^23456789ABCDEFGHJKMNPQRSTUVWXYZ]/g, '').slice(0, 8);
  if (clean.length <= 4) return clean;
  return `${clean.slice(0, 4)}-${clean.slice(4)}`;
}

export function isValidFormat(code: string): boolean {
  return CODE_RE.test(code);
}

/** Enmascara la segunda mitad: ABCD-••••. */
export function maskCode(code: string): string {
  const head = code.slice(0, 4);
  return head ? `${head}-••••` : '••••-••••';
}
