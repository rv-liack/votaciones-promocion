-- Migración 0002: funciones RPC + vista administrativa.
-- Las 3 funciones son SECURITY DEFINER con SET search_path = public,
-- con REVOKE de PUBLIC y GRANT EXECUTE solo a anon y authenticated.

-- Constantes de limitación de intentos (fáciles de cambiar):
-- RATE_MAX_FAILED = 30 intentos fallidos, RATE_WINDOW_MIN = 10 minutos.
-- Los registros de más de 1 día se borran de vez en cuando.

-- validate_code(p_code) -> 'valid' | 'invalid' | 'used' | 'rate_limited'.
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
  v_client_key text;
  v_fails int;
  v_used boolean;
  RATE_MAX_FAILED int := 30;
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
    v_ip := 'unknown';
  end if;
  v_client_key := 'ip:' || md5(v_ip);

  -- Si el client_key acumula 30 fallos en 10 min: rate_limited SIN consultar el código.
  select count(*) into v_fails
    from access_attempts
   where client_key = v_client_key
     and success = false
     and created_at > now() - (RATE_WINDOW_MIN || ' minutes')::interval;
  if v_fails >= RATE_MAX_FAILED then
    insert into access_attempts (client_key, success) values (v_client_key, false);
    return 'rate_limited';
  end if;

  select used into v_used from voter_codes where code = v_code;
  if not found then
    insert into access_attempts (client_key, success) values (v_client_key, false);
    if random() < 0.05 then
      delete from access_attempts where created_at < now() - interval '1 day';
    end if;
    return 'invalid';
  end if;
  if v_used then
    insert into access_attempts (client_key, success) values (v_client_key, false);
    return 'used';
  end if;

  insert into access_attempts (client_key, success) values (v_client_key, true);
  if random() < 0.05 then
    delete from access_attempts where created_at < now() - interval '1 day';
  end if;
  return 'valid';
end;
$$;

revoke all on function public.validate_code(text) from public;
grant execute on function public.validate_code(text) to anon, authenticated;

-- get_proposals(p_code) -> jsonb ordenado por position.
-- Solo se entrega si el código existe y no está usado; si no, excepción.
create or replace function public.get_proposals(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_used boolean;
  v_out jsonb;
begin
  select used into v_used from voter_codes where code = v_code;
  if not found then
    raise exception 'invalid_code';
  end if;
  if v_used then
    raise exception 'already_used';
  end if;

  select coalesce(jsonb_agg(t, order by t.position), '[]'::jsonb) into v_out
    from (
      select id, position, promotion_name, tagline, description,
             shirt_images, jacket_images, extra_info
        from proposals
       where is_active
    ) t;
  return v_out;
end;
$$;

revoke all on function public.get_proposals(text) from public;
grant execute on function public.get_proposals(text) to anon, authenticated;

-- cast_vote(p_code, p_proposal_id, p_ratings) -> 'ok'.
-- p_ratings es un objeto {proposal_id: score}. Todo en UNA transacción:
-- bloquea la fila del código (SELECT ... FOR UPDATE), valida, genera
-- ballot_id, inserta voto + calificaciones y marca el código como usado.
-- Errores claros: invalid_code, already_used, invalid_proposal,
-- invalid_rating, rate_limited. Ni dos envíos simultáneos repiten el voto.
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
  v_client_key text;
  v_fails int;
  v_used boolean;
  v_ok boolean;
  v_ballot uuid;
  r record;
  v_key uuid;
  v_num numeric;
  v_score int;
  RATE_MAX_FAILED int := 30;
  RATE_WINDOW_MIN int := 10;
begin
  begin
    v_ip := split_part(coalesce((v_headers::json ->> 'x-forwarded-for'), ''), ',', 1);
  exception when others then
    v_ip := '';
  end;
  v_ip := trim(both ' ' from coalesce(v_ip, ''));
  if v_ip = '' then
    v_ip := 'unknown';
  end if;
  v_client_key := 'ip:' || md5(v_ip);

  select count(*) into v_fails
    from access_attempts
   where client_key = v_client_key
     and success = false
     and created_at > now() - (RATE_WINDOW_MIN || ' minutes')::interval;
  if v_fails >= RATE_MAX_FAILED then
    raise exception 'rate_limited';
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
  insert into access_attempts (client_key, success) values (v_client_key, true);
  return 'ok';
end;
$$;

revoke all on function public.cast_vote(text, uuid, jsonb) from public;
grant execute on function public.cast_vote(text, uuid, jsonb) to anon, authenticated;

-- Vista administrativa: propuesta, votos a favor, cantidad de
-- calificaciones y promedio. Solo se consulta desde el panel de
-- base de datos: sin acceso para anon ni authenticated.
create or replace view public.proposal_results as
select
  p.id as proposal_id,
  p.position,
  p.promotion_name,
  count(distinct v.ballot_id)::int as favor_votes,
  count(r.score)::int as ratings_count,
  round(avg(r.score), 2) as avg_score
  from proposals p
  left join votes v on v.proposal_id = p.id
  left join ratings r on r.proposal_id = p.id
 group by p.id, p.position, p.promotion_name
 order by favor_votes desc, avg_score desc nulls last, p.position;

revoke all on table public.proposal_results from public;
revoke all on table public.proposal_results from anon, authenticated;
