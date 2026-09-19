# Votaciones de la Promoción

Plataforma web en español para votar la planificación de una promoción estudiantil.
Una sola URL con tres vistas: ingresar código → votar → confirmación.

## Stack

- Vite + React + TypeScript + Tailwind CSS + lucide-react
- Sin react-router (estado de vista propio), sin carrusel externo (CSS scroll-snap)
- Backend: Bolt Database (Postgres) solo con funciones SQL llamadas por RPC
- Iconos sociales como SVG inline propios

## Cómo correr el proyecto

```bash
npm install
cp .env.example .env   # completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

Build de producción:

```bash
npm run build
npm run preview
```

> Usa solo la **anon key** (`VITE_SUPABASE_ANON_KEY`). NUNCA pongas la
> `service_role` key en el frontend ni en variables `VITE_`.

## Cómo publicar

1. Crea el proyecto en Bolt y ejecuta las migraciones de `supabase/migrations/`
   en orden (`0001_schema.sql`, `0002_functions.sql`, `0003_seed.sql`).
2. Genera el lote real de códigos (ver abajo) y borra el lote `test`.
3. Publica con Bolt (o `npm run build` + hosting estático como Netlify/Vercel),
   configurando las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

## Base de datos: migraciones

Aplica los archivos de `supabase/migrations/` en orden numérico desde el
panel SQL de Bolt Database. Regla central: el navegador NUNCA lee ni escribe
tablas directamente (RLS activado sin políticas; todo pasa por `validate_code`,
`get_proposals` y `cast_vote`).

## Cómo generar e importar códigos reales

Ejecuta en el panel SQL (alfabeto sin ambiguos `23456789ABCDEFGHJKMNPQRSTUVWXYZ`):

```sql
-- Genera 200 códigos del lote 'main' (ajusta generate_series a la cantidad deseada)
insert into public.voter_codes (code, batch)
select string_agg(substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ',
           1 + (get_byte(gen_random_bytes(1), 0) % 32), 1), '')
       || '-' ||
       string_agg(substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ',
           1 + (get_byte(gen_random_bytes(1), 0) % 32), 1), '')
  from generate_series(1, 4) a, generate_series(1, 200) b
 group by b;

-- Ver los códigos generados (cópialos para repartirlos)
select code from public.voter_codes where batch = 'main' and used = false order by code;
```

Borrar el lote `test` (solo códigos sin usar):

```sql
delete from public.voter_codes where batch = 'test' and used = false;
```

## Cómo agregar propuestas

```sql
insert into public.proposals
  (position, promotion_name, tagline, description, shirt_images, jacket_images, extra_info)
values
  (5, 'Nombre de la promoción', 'Eslogan opcional',
   'Descripción de la propuesta.',
   '{/proposals/promo-e-frente.jpg,/proposals/promo-e-espalda.jpg}',
   '{/proposals/chaqueta-e-frente.jpg,/proposals/chaqueta-e-espalda.jpg}',
   '[{"label": "Color", "value": "Azul"}]');
```

Las imágenes van en `public/` (p. ej. `public/proposals/`). Los SVG de ejemplo
están en `public/placeholders/` (siluetas monocromas de camiseta y chaqueta):
reemplázalos subiendo fotos reales y actualizando `shirt_images`/`jacket_images`.
Para ocultar una propuesta sin borrarla: `update proposals set is_active = false where position = N;`

## Cómo agregar desarrolladores

Edita `src/data/developers.ts`: agrega un objeto `{ name, role, photo, socials }`
al array (o borra el objeto para quitarlo). Coloca la foto en
`public/developers/` (p. ej. `dev-4.jpg`) y apunta `photo` a `/developers/dev-4.jpg`.
Tipos de red válidos: `github | linkedin | instagram | x | email | web`; solo se
muestran las que tengan URL. Sin foto se genera un avatar monocromo con iniciales.
Las fotos se ven en escala de grises por la clase `photo-gray` (quítala para color).

## Cómo consultar proposal_results

Desde el panel de base de datos (la vista no es accesible desde el frontend):

```sql
select * from public.proposal_results;
```

Muestra por propuesta: votos a favor, cantidad de calificaciones y promedio.

## Criterios de aceptación

1. Código válido → entra a votar. 2. Código inexistente → error.
3. Tras votar, el mismo código muestra "ya utilizado".
4. Llamadas directas con la anon key a las tablas no devuelven datos.
5. Dos envíos simultáneos del mismo código → solo uno se registra.
6. Refrescar no pierde el código validado ni el borrador.
7. El carrusel funciona con botones, teclado y swipe.
8. Los dos temas se ven correctos.
9. La auditoría de seguridad no muestra advertencias.
