-- Migracion 0008: limpieza definitiva + codigos de votacion.
-- Ejecuta esta migracion UNA SOLA VEZ para preparar la base de datos.

-- 1. Borrar propuestas sin definir (placeholder)
DELETE FROM public.proposals WHERE promotion_name LIKE 'Por definir%';

-- 2. Borrar votos y calificaciones existentes
DELETE FROM public.ratings;
DELETE FROM public.votes;

-- 3. Borrar codigos anteriores no usados
DELETE FROM public.voter_codes WHERE used = false;

-- 4. Crear 200 codigos de votacion (batch 'main')
-- Alfabeto sin ambiguos: 23456789ABCDEFGHJKMNPQRSTUVWXYZ (32 chars)
INSERT INTO public.voter_codes (code, batch)
SELECT
  substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1)
  || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1)
  || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1)
  || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1)
  || '-'
  || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1)
  || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1)
  || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1)
  || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1)
  AS code,
  'main' AS batch
FROM generate_series(1, 200);

-- 5. Crear 10 codigos de prueba (batch 'test')
INSERT INTO public.voter_codes (code, batch)
SELECT
  substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1)
  || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1)
  || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1)
  || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1)
  || '-'
  || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1)
  || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1)
  || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1)
  || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1)
  AS code,
  'test' AS batch
FROM generate_series(1, 10);

-- 6. Verificar resultados
SELECT batch, count(*) AS total FROM public.voter_codes GROUP BY batch ORDER BY batch;
SELECT position, promotion_name FROM public.proposals ORDER BY position;
