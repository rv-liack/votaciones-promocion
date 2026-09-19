// Resolución de URLs de imágenes.
// En local, las imágenes están en public/ y se sirven como estáticos.
// En producción (Bolt Hosting), los archivos de public/ no se sirven
// como archivos reales (SPA fallback), así que usamos Supabase Storage.
//
// Para configurar:
//   1. En Bolt → Database → File Storage: crea un bucket público "proposals".
//   2. Sube las imágenes manteniendo la estructura: proposals/administracion/*.jpeg, etc.
//   3. Añade la variable VITE_SUPABASE_STORAGE_URL (opcional; se deriva de VITE_SUPABASE_URL si se omite).

const storageUrl = import.meta.env.VITE_SUPABASE_STORAGE_URL as string | undefined;

/** URL base de Supabase Storage (sin barra final). */
function getStorageBase(): string | null {
  if (storageUrl) return storageUrl.replace(/\/+$/, '');
  const projectUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!projectUrl) return null;
  // https://<ref>.supabase.co → https://<ref>.supabase.co/storage/v1/object/public/proposals
  return projectUrl.replace(/\/+$/, '') + '/storage/v1/object/public/proposals';
}

/**
 * Convierte una ruta relativa del tipo /proposals/administracion/archivo.jpeg
 * en una URL pública de Supabase Storage.
 * Si la ruta ya es una URL completa (http/https), se devuelve tal cual.
 * Si no hay configuración de Storage, se devuelve la ruta tal cual (modo local).
 */
export function resolveImageUrl(path: string): string {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = getStorageBase();
  if (!base) return path;
  // La ruta empieza con /proposals/... → quitar /proposals para el path del bucket
  const bucketPath = path.replace(/^\/proposals\//, '');
  return `${base}/${bucketPath}`;
}

/** Resuelve un array de rutas de imágenes. */
export function resolveImageUrls(paths: string[]): string[] {
  return paths.map(resolveImageUrl);
}
