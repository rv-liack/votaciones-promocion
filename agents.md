# agents.md — Reglas permanentes del proyecto

## Stack

- Vite + React + TypeScript + Tailwind CSS + lucide-react.
- Sin react-router: una sola URL con estado de vista (`enter | vote | done`).
- Sin servidor propio ni módulos nativos de Node. Backend solo en Bolt Database
  con funciones SQL llamadas por RPC. Migraciones versionadas en `supabase/migrations/`.
- Variables de entorno solo con prefijo `VITE_`.
- Iconos sociales como SVG inline propios; sin librerías de carrusel
  (CSS scroll-snap + estado propio). Código modular: ningún archivo de más de ~300 líneas.

## Tokens de diseño

- Variables CSS en canales RGB mapeadas en `tailwind.config.js`
  (surface, surface-raised, surface-card, surface-hover, edge, edge-subtle,
  primary, secondary, muted). Tema oscuro por defecto; tema claro con clase `light`.
- Tipografías Geist (Sans general, Mono para navegación/botones/etiquetas/códigos,
  Pixel Square para logotipo y títulos con fallback a Geist Mono).
- Transiciones de 160 ms, `active:scale-[0.97]`, respeto a `prefers-reduced-motion`.

## Paleta: solo blanco y negro

- Únicamente grises neutros. PROHIBIDO verde, rojo o cualquier color de acento.
- Los estados (error, éxito, advertencia) se comunican con icono + texto +
  grosor/contraste del borde, nunca con color.

## Base de datos y votación

- El navegador NUNCA lee ni escribe tablas directamente: RLS en todas las tablas
  sin políticas para anon/authenticated; todo pasa por `validate_code`,
  `get_proposals` y `cast_vote` (SECURITY DEFINER, `SET search_path = public`,
  REVOKE de PUBLIC, GRANT EXECUTE solo a anon y authenticated).
- Votación única y anónima: cada código emite EXACTAMENTE UN voto a favor más
  calificaciones opcionales en una sola operación atómica; `votes` y `ratings`
  NO guardan referencia al código (solo `ballot_id` aleatorio).
- PROHIBIDO usar o exponer la service_role key en el frontend.
