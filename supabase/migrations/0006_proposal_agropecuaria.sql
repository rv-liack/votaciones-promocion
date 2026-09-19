-- Migración 0006: propuesta Agropecuaria (posición 3).

insert into public.proposals (position, promotion_name, tagline, description, shirt_images, jacket_images, extra_info)
select 3, 'Agropecuaria', 'Brillamos, Logramos, Egresamos, Siempre Somos Unidos y Destacados',
  null,
  '{/proposals/Agropecuaria/agropecuaria-camiseta-1.jpeg,/proposals/Agropecuaria/agropecuaria-camiseta-2.jpeg}',
  '{}',
  '[{"label":"Logo","value":"/proposals/Agropecuaria/agropecuaria-logo-1.jpeg"},{"label":"Eslogan","value":"/proposals/Agropecuaria/agropecuaria-eslogan-1.jpeg"}]'::jsonb
where not exists (select 1 from public.proposals where position = 3);
