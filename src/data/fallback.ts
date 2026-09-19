import type { Proposal } from '../types';

// Propuestas de respaldo (solo si el backend no está configurado).
// En producción los datos llegan desde la RPC get_proposals.
export const fallbackProposals: Proposal[] = [
  {
    id: 'fallback-1',
    position: 1,
    promotion_name: 'Por definir 1',
    tagline: 'Propuesta de ejemplo',
    description:
      'Conecta la base de datos (variables VITE_ en .env) para ver las propuestas reales.',
    shirt_images: ['/placeholders/shirt-front.svg', '/placeholders/shirt-back.svg'],
    jacket_images: ['/placeholders/jacket-front.svg', '/placeholders/jacket-back.svg'],
    extra_info: [{ label: 'Estado', value: 'Ejemplo local' }],
  },
];
