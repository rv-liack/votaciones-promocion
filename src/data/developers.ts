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
    name: 'Rafaelito Vicioso Fleurimond',
    role: 'Director General de Desarrllo',
    photo: '/developers/rafael.jpg',
    socials: [
      { type: 'github', url: 'https://github.com/rv-liack' },
      { type: 'linkedin', url: 'https://linkedin.com/' },
      { type: 'email', url: 'rafaelito.vicioso@gmail.com' },
      { type: "x", url: "https://x.com/liack_"}
    ],
  },
   {
    name: 'Christopher Lorenzo Encarnación',
    role: 'Prime enginer',
    photo: '',
    socials: [
      { type: 'github', url: '' },
      { type: 'linkedin', url: '' },
      { type: 'email', url: '' },
      { type: "x", url: ""}
    ],
  },
];


