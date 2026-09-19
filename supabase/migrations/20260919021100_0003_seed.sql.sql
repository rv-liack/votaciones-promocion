-- Migración 0003: semilla idempotente (4 propuestas de ejemplo).

insert into public.proposals (position, promotion_name, tagline, description, shirt_images, jacket_images, extra_info)
select 1, 'Por definir 1', 'Eslogan de ejemplo 1',
  'Descripción de ejemplo. Reemplaza este texto con la información real de la propuesta.',
  array['/placeholders/shirt-front.svg', '/placeholders/shirt-back.svg'],
  array['/placeholders/jacket-front.svg', '/placeholders/jacket-back.svg'],
  '[{"label": "Color", "value": "Por definir"}]'::jsonb
where not exists (select 1 from public.proposals where position = 1);

insert into public.proposals (position, promotion_name, tagline, description, shirt_images, jacket_images, extra_info)
select 2, 'Por definir 2', 'Eslogan de ejemplo 2',
  'Descripción de ejemplo. Reemplaza este texto con la información real de la propuesta.',
  array['/placeholders/shirt-front.svg', '/placeholders/shirt-back.svg'],
  array['/placeholders/jacket-front.svg', '/placeholders/jacket-back.svg'],
  '[{"label": "Color", "value": "Por definir"}]'::jsonb
where not exists (select 1 from public.proposals where position = 2);

insert into public.proposals (position, promotion_name, tagline, description, shirt_images, jacket_images, extra_info)
select 3, 'Por definir 3', 'Eslogan de ejemplo 3',
  'Descripción de ejemplo. Reemplaza este texto con la información real de la propuesta.',
  array['/placeholders/shirt-front.svg', '/placeholders/shirt-back.svg'],
  array['/placeholders/jacket-front.svg', '/placeholders/jacket-back.svg'],
  '[{"label": "Color", "value": "Por definir"}]'::jsonb
where not exists (select 1 from public.proposals where position = 3);

insert into public.proposals (position, promotion_name, tagline, description, shirt_images, jacket_images, extra_info)
select 4, 'Por definir 4', 'Eslogan de ejemplo 4',
  'Descripción de ejemplo. Reemplaza este texto con la información real de la propuesta.',
  array['/placeholders/shirt-front.svg', '/placeholders/shirt-back.svg'],
  array['/placeholders/jacket-front.svg', '/placeholders/jacket-back.svg'],
  '[{"label": "Color", "value": "Por definir"}]'::jsonb
where not exists (select 1 from public.proposals where position = 4);
