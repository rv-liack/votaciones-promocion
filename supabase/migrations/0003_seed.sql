-- Migración 0003: semilla idempotente (4 propuestas de ejemplo).
-- Imágenes placeholder: SVG monocromos en /public/placeholders/.
-- Cómo reemplazarlas por imágenes reales:
--   1. Sube las fotos a /public/proposals/ (p. ej. promo-a-frente.jpg).
--   2. Actualiza shirt_images / jacket_images con las nuevas rutas:
--      update proposals set shirt_images = '{/proposals/promo-a-frente.jpg,...}'
--      where position = 1;
--
-- CÓDIGOS: esta migración NO incluye códigos fijos. Los 10 códigos de
-- PRUEBA y el lote real se generan con el SQL comentado al final
-- (aleatorios con gen_random_bytes del alfabeto sin ambiguos).

-- Propuesta 1
insert into public.proposals (position, promotion_name, tagline, description, shirt_images, jacket_images, extra_info)
select 1, 'Por definir 1', 'Eslogan de ejemplo 1',
  'Descripción de ejemplo. Reemplaza este texto con la información real de la propuesta.',
  array['/placeholders/shirt-front.svg', '/placeholders/shirt-back.svg'],
  array['/placeholders/jacket-front.svg', '/placeholders/jacket-back.svg'],
  '[{"label": "Color", "value": "Por definir"}]'::jsonb
where not exists (select 1 from public.proposals where position = 1);

-- Propuesta 2
insert into public.proposals (position, promotion_name, tagline, description, shirt_images, jacket_images, extra_info)
select 2, 'Por definir 2', 'Eslogan de ejemplo 2',
  'Descripción de ejemplo. Reemplaza este texto con la información real de la propuesta.',
  array['/placeholders/shirt-front.svg', '/placeholders/shirt-back.svg'],
  array['/placeholders/jacket-front.svg', '/placeholders/jacket-back.svg'],
  '[{"label": "Color", "value": "Por definir"}]'::jsonb
where not exists (select 1 from public.proposals where position = 2);

-- Propuesta 3
insert into public.proposals (position, promotion_name, tagline, description, shirt_images, jacket_images, extra_info)
select 3, 'Por definir 3', 'Eslogan de ejemplo 3',
  'Descripción de ejemplo. Reemplaza este texto con la información real de la propuesta.',
  array['/placeholders/shirt-front.svg', '/placeholders/shirt-back.svg'],
  array['/placeholders/jacket-front.svg', '/placeholders/jacket-back.svg'],
  '[{"label": "Color", "value": "Por definir"}]'::jsonb
where not exists (select 1 from public.proposals where position = 3);

-- Propuesta 4
insert into public.proposals (position, promotion_name, tagline, description, shirt_images, jacket_images, extra_info)
select 4, 'Por definir 4', 'Eslogan de ejemplo 4',
  'Descripción de ejemplo. Reemplaza este texto con la información real de la propuesta.',
  array['/placeholders/shirt-front.svg', '/placeholders/shirt-back.svg'],
  array['/placeholders/jacket-front.svg', '/placeholders/jacket-back.svg'],
  '[{"label": "Color", "value": "Por definir"}]'::jsonb
where not exists (select 1 from public.proposals where position = 4);

-- ─────────────────────────────────────────────────────────────
-- Generar un lote de códigos aleatorios (alfabeto sin ambiguos).
-- Cambia 'test' por el batch real ('main', 'promo-2026', etc.) y
-- ajusta generate_series(1, N) a la cantidad deseada.
--
-- insert into public.voter_codes (code, batch)
-- select string_agg(substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ',
--            1 + (get_byte(gen_random_bytes(1), 0) % 32), 1), '')
--        || '-' ||
--        string_agg(substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ',
--            1 + (get_byte(gen_random_bytes(1), 0) % 32), 1), '')
--   from generate_series(1, 4) a, generate_series(1, 10) b
--  group by b;
--
-- Para que el batch sea 'test' en el lote de prueba, envuelve el
-- insert anterior: with nuevo as (...) insert into voter_codes...
-- (versión simple: genera con batch por defecto y luego
--  update voter_codes set batch = 'test' where ...).
--
-- Borrar el lote de prueba (solo códigos sin usar):
-- delete from public.voter_codes where batch = 'test' and used = false;
-- ─────────────────────────────────────────────────────────────
