-- Migración 0005: rutas de imágenes de propuestas.
-- Ejecuta esta migración DESPUÉS de subir las fotos a /public/proposals/.
-- Solo actualiza las filas que aún tengan los placeholders SVG.

-- Administración: 2 chaquetas, 1 camiseta, 3 logos, 2 decoraciones, 1 eslogan
update public.proposals
set shirt_images = '{
  /propsals/administracion/administracion-camiseta-1.jpeg
}',
    jacket_images = '{
  /propsals/administracion/administracion-chaqueta-1.jpeg,
  /propsals/administracion/administracion-chaqueta-2.jpeg
}',
    extra_info = '[
      {"label": "Logo", "value": "/propsals/administracion/administracion-logo-1.jpeg"},
      {"label": "Logo variante", "value": "/propsals/administracion/administracion-logo-2.jpeg"},
      {"label": "Escudo", "value": "/propsals/administracion/administracion-logo-3.jpeg"},
      {"label": "Decoración 1", "value": "/propsals/administracion/administracion-decoracion-1.jpeg"},
      {"label": "Decoración 2", "value": "/propsals/administracion/administracion-decoracion-2.jpeg"},
      {"label": "Eslogan", "value": "/propsals/administracion/administracion-eslogan-1.jpeg"}
    ]'::jsonb,
    promotion_name = 'AUREN',
    tagline = 'Avanzando Unidos, Rompiendo límites, Enfrentando retos y Nuevos caminos'
where position = 1;

-- Logística: 1 camiseta, 1 logo
update public.proposals
set shirt_images = '{
  /propsals/logistica/logistica-camiseta-1.jpeg
}',
    jacket_images = '{}',
    extra_info = '[
      {"label": "Logo", "value": "/propsals/logistica/logistica-logo-1.jpeg"}
    ]'::jsonb,
    promotion_name = 'Logística',
    tagline = 'Por definir'
where position = 2;
