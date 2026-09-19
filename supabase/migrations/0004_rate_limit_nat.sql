-- Migración 0004: limitación de intentos apta para redes móviles con NAT.
-- Problema: en datos móviles muchos usuarios comparten una misma IP pública,
-- y si el IP no se puede leer todos caían en una llave 'unknown' global que
-- bloqueaba a todo el mundo con 30 fallos. Cambios:
--   1. Nueva columna reason ('invalid' | 'used' | 'valid' | 'rate_limited')
--      para distinguir ataques (códigos inexistentes) de confusiones legítimas.
--   2. El límite solo cuenta intentos 'invalid' (código inexistente).
--      Los códigos ya usados NO suman al bloqueo.
--   3. Si el IP es desconocido, NO se aplica el bloqueo (fail-open solo del
--      limitador; la validación del código sigue aplicándose igual).
--   4. Umbral subido a 60 fallos / 10 min (constantes fáciles de cambiar).

alter table public.access_attempts
  add column if not exists reason text;

-- validate_code v2 (misma firma y mismos valores de retorno).
create or replace function public.validate_code(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_headers text := current_setting('request.headers', true);
  v_ip text := '';
  v_ip_known boolean := true;
  v_client_key text;
  v_fails int;
  v_used boolean;
  RATE_MAX_FAILED int := 60;
  RATE_WINDOW_MIN int := 10;
begin
  -- client_key = hash del primer IP de x-forwarded-for.
  begin
    v_ip := split_part(coalesce((v_headers::json ->> 'x-forwarded-for'), ''), ',', 1);
  exception when others then
    v_ip := '';
  end;
  v_ip := trim(both ' ' from coalesce(v_ip, ''));
  if v_ip = '' then
    -- Sin IP identificable no se puede limitar por cliente: no bloquear.
    v_ip_known := false;
    v_client_key := 'ip:unknown';
  else
    v_client_key := 'ip:' || md5(v_ip);
  end if;

  -- Solo cuenta códigos inexistentes ('invalid'), no los ya usados.
  if v_ip_known then
    select count(*) into v_fails
      from access_attempts
     where client_key = v_client_key
       and success = false
       and reason = 'invalid'
       and created_at > now() - (RATE_WINDOW_MIN || ' minutes')::interval;
    if v_fails >= RATE_MAX_FAILED then
      insert into access_attempts (client_key, success, reason)
      values (v_client_key, false, 'rate_limited');
      return 'rate_limited';
    end if;
  end if;

  select used into v_used from voter_codes where code = v_code;
  if not found then
    insert into access_attempts (client_key, success, reason)
    values (v_client_key, false, 'invalid');
    if random() < 0.05 then
      delete from access_attempts where created_at < now() - interval '1 day';
    end if;
    return 'invalid';
  end if;
  if v_used then
    insert into access_attempts (client_key, success, reason)
    values (v_client_key, false, 'used');
    return 'used';
  end if;

  insert into access_attempts (client_key, success, reason)
  values (v_client_key, true, 'valid');
  if random() < 0.05 then
    delete from access_attempts where created_at < now() - interval '1 day';
  end if;
  return 'valid';
end;
$$;

revoke all on function public.validate_code(text) from public;
grant execute on function public.validate_code(text) to anon, authenticated;

-- cast_vote: mismo criterio en su puerta de rate limit (solo 'invalid',
-- sin bloqueo si el IP es desconocido). El resto de la función no cambia.
create or replace function public.cast_vote(p_code text, p_proposal_id uuid, p_ratings jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_headers text := current_setting('request.headers', true);
  v_ip text := '';
  v_ip_known boolean := true;
  v_client_key text;
  v_fails int;
  v_used boolean;
  v_ok boolean;
  v_ballot uuid;
  r record;
  v_key uuid;
  v_num numeric;
  v_score int;
  RATE_MAX_FAILED int := 60;
  RATE_WINDOW_MIN int := 10;
begin
  begin
    v_ip := split_part(coalesce((v_headers::json ->> 'x-forwarded-for'), ''), ',', 1);
  exception when others then
    v_ip := '';
  end;
  v_ip := trim(both ' ' from coalesce(v_ip, ''));
  if v_ip = '' then
    v_ip_known := false;
    v_client_key := 'ip:unknown';
  else
    v_client_key := 'ip:' || md5(v_ip);
  end if;

  if v_ip_known then
    select count(*) into v_fails
      from access_attempts
     where client_key = v_client_key
       and success = false
       and reason = 'invalid'
       and created_at > now() - (RATE_WINDOW_MIN || ' minutes')::interval;
    if v_fails >= RATE_MAX_FAILED then
      raise exception 'rate_limited';
    end if;
  end if;

  select used into v_used from voter_codes where code = v_code for update;
  if not found then
    raise exception 'invalid_code';
  end if;
  if v_used then
    raise exception 'already_used';
  end if;

  select true into v_ok from proposals where id = p_proposal_id and is_active;
  if v_ok is null then
    raise exception 'invalid_proposal';
  end if;

  v_ballot := gen_random_uuid();
  insert into votes (ballot_id, proposal_id) values (v_ballot, p_proposal_id);

  if p_ratings is not null and p_ratings <> 'null'::jsonb then
    if jsonb_typeof(p_ratings) <> 'object' then
      raise exception 'invalid_rating';
    end if;
    for r in select key as k, value as v from jsonb_each(p_ratings) loop
      begin
        v_key := r.k::uuid;
      exception when others then
        raise exception 'invalid_rating';
      end;
      begin
        v_num := (r.v::text)::numeric;
      exception when others then
        raise exception 'invalid_rating';
      end;
      if v_num <> floor(v_num) or v_num < 1 or v_num > 10 then
        raise exception 'invalid_rating';
      end if;
      v_score := v_num::int;
      select true into v_ok from proposals where id = v_key and is_active;
      if v_ok is null then
        raise exception 'invalid_rating';
      end if;
      insert into ratings (ballot_id, proposal_id, score)
      values (v_ballot, v_key, v_score);
    end loop;
  end if;

  update voter_codes set used = true, used_at = now() where code = v_code;
  insert into access_attempts (client_key, success, reason)
  values (v_client_key, true, 'valid');
  return 'ok';
end;
$$;

revoke all on function public.cast_vote(text, uuid, jsonb) from public;
grant execute on function public.cast_vote(text, uuid, jsonb) to anon, authenticated;
