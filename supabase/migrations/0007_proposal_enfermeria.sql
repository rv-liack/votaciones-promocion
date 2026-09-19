-- Migración 0007: propuesta Enfermería / PRIME (posición 4).

insert into public.proposals (position, promotion_name, tagline, description, shirt_images, jacket_images, extra_info)
select 4, 'Enfermería', 'Más que un uniforme, somos una familia',
  null,
  '{/proposals/Enfermeria/enfermeria-camiseta-1.jpeg}',
  '{/proposals/Enfermeria/enfermeria-chaqueta-1.jpeg}',
  '[{"label":"Logo","value":"/proposals/Enfermeria/enfermeria-logo-1.jpeg"},{"label":"Paleta de colores","value":"/proposals/Enfermeria/enfermeria-paleta-1.jpeg"},{"label":"Presentación","value":"/proposals/Enfermeria/enfermeria-presentacion-1.jpeg"}]'::jsonb
where not exists (select 1 from public.proposals where position = 4);
