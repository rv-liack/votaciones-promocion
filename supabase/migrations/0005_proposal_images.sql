-- Migración 0005: rutas de imágenes de propuestas.
-- Ejecuta esta migración DESPUÉS de subir las fotos a /public/proposals/.

-- Administración: 1 camiseta, 2 chaquetas
update public.proposals
set shirt_images = '{
  /proposals/administracion/administracion-camiseta-1.jpeg
}',
    jacket_images = '{
  /proposals/administracion/administracion-chaqueta-1.jpeg,
  /proposals/administracion/administracion-chaqueta-2.jpeg
}',
    extra_info = '[
      {"label": "Logo", "value": "/proposals/administracion/administracion-logo-1.jpeg"},
      {"label": "Logo variante", "value": "/proposals/administracion/administracion-logo-2.jpeg"},
      {"label": "Escudo", "value": "/proposals/administracion/administracion-logo-3.jpeg"},
      {"label": "Decoración 1", "value": "/proposals/administracion/administracion-decoracion-1.jpeg"},
      {"label": "Decoración 2", "value": "/proposals/administracion/administracion-decoracion-2.jpeg"},
      {"label": "Eslogan", "value": "/proposals/administracion/administracion-eslogan-1.jpeg"}
    ]'::jsonb,
    promotion_name = 'AUREN',
    tagline = 'Avanzando Unidos, Rompiendo límites, Enfrentando retos y Nuevos caminos'
where position = 1;

-- Logística: 1 camiseta
update public.proposals
set shirt_images = '{
  /proposals/logistica/logistica-camiseta-1.jpeg
}',
    jacket_images = '{}',
    extra_info = '[
      {"label": "Logo", "value": "/proposals/logistica/logistica-logo-1.jpeg"}
    ]'::jsonb,
    promotion_name = 'Logística',
    tagline = 'Por definir'
where position = 2;
