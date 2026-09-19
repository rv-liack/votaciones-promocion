// Datos de los desarrolladores.
// ─────────────────────────────────────────────────────────────
// Cómo añadir un desarrollador: agrega un objeto al array `developers`
// con name, role, photo y socials. Para quitarlo, borra su objeto.
// Las fotos van en /public/developers/ (p. ej. dev-1.jpg). Si falta la
// foto o falla la carga, se muestra un avatar monocromo con iniciales.
// Tipos de red válidos: github | linkedin | instagram | x | email | web.
// Solo se muestran los iconos de las redes que tengan URL.

export type SocialType = 'github' | 'linkedin' | 'instagram' | 'x' | 'email' | 'web';

export interface DeveloperSocial {
  type: SocialType;
  url: string;
}

export interface Developer {
  name: string;
  role: string;
  photo: string;
  socials: DeveloperSocial[];
}

export const developers: Developer[] = [
  {
    name: 'Ana Quispe',
    role: 'Desarrolladora Frontend',
    photo: '/developers/dev-1.svg',
    socials: [
      { type: 'github', url: 'https://github.com/' },
      { type: 'linkedin', url: 'https://linkedin.com/' },
      { type: 'email', url: 'mailto:ana@example.com' },
    ],
  },
  {
    name: 'Luis Mamani',
    role: 'Desarrollador Backend',
    photo: '/developers/dev-2.svg',
    socials: [
      { type: 'github', url: 'https://github.com/' },
      { type: 'x', url: 'https://x.com/' },
      { type: 'web', url: 'https://example.com/' },
    ],
  },
  {
    name: 'María Flores',
    role: 'Diseñadora UI',
    photo: '/developers/dev-3.svg',
    socials: [
      { type: 'instagram', url: 'https://instagram.com/' },
      { type: 'linkedin', url: 'https://linkedin.com/' },
      { type: 'email', url: 'mailto:maria@example.com' },
    ],
  },
];
