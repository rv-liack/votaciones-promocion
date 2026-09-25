/*
# Results access codes and results data function

1. New Tables
- `result_access_codes` — reusable codes to unlock the results section.
  - `id` (uuid, primary key)
  - `code` (text, unique, not null) — format XXXX-XXXX, same alphabet as voter codes
  - `label` (text) — optional label to identify the code
  - `created_at` (timestamptz)
  Unlike voter_codes, these are reusable: multiple people can enter the same code to view results.

2. New Functions
- `validate_results_code(p_code)` — returns 'valid' or 'invalid'. Checks the result_access_codes table.
- `get_results_data()` — returns a JSONB object with all voting statistics:
  - proposals: array of {id, position, promotion_name, favor_votes, ratings_count, avg_score, max_score, min_score}
  - total_votes: total number of votes cast
  - rating_distribution: array of {proposal_id, promotion_name, score, count} for every score 1-10
  - code_stats: {total, used, unused, by_batch: [{batch, total, used}]}

3. Security
- RLS enabled on result_access_codes, no direct access policies (all through SECURITY DEFINER functions).
- Functions granted to anon, authenticated.
*/

create table if not exists public.result_access_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  label text,
  created_at timestamptz not null default now()
);

alter table public.result_access_codes enable row level security;
revoke all on table public.result_access_codes from anon, authenticated;

create or replace function public.validate_results_code(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_found boolean;
begin
  select true into v_found from result_access_codes where code = v_code;
  if v_found then
    return 'valid';
  end if;
  return 'invalid';
end;
$$;

revoke all on function public.validate_results_code(text) from public;
grant execute on function public.validate_results_code(text) to anon, authenticated;

create or replace function public.get_results_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proposals jsonb;
  v_total_votes int;
  v_distribution jsonb;
  v_code_stats jsonb;
  v_batch_stats jsonb;
begin
  select coalesce(jsonb_agg(t), '[]'::jsonb) into v_proposals
    from (
      select
        p.id,
        p.position,
        p.promotion_name,
        count(distinct v.ballot_id)::int as favor_votes,
        count(r.score)::int as ratings_count,
        round(avg(r.score), 2) as avg_score,
        coalesce(max(r.score), 0)::int as max_score,
        coalesce(min(r.score), 0)::int as min_score
      from proposals p
      left join votes v on v.proposal_id = p.id
      left join ratings r on r.proposal_id = p.id
      group by p.id, p.position, p.promotion_name
      order by favor_votes desc, avg_score desc nulls last, p.position
    ) t;

  select count(*) into v_total_votes from votes;

  select coalesce(jsonb_agg(t), '[]'::jsonb) into v_distribution
    from (
      select
        r.proposal_id,
        p.promotion_name,
        r.score,
        count(*)::int as count
      from ratings r
      join proposals p on p.id = r.proposal_id
      group by r.proposal_id, p.promotion_name, r.score
      order by r.proposal_id, r.score
    ) t;

  select coalesce(jsonb_agg(t), '[]'::jsonb) into v_batch_stats
    from (
      select
        batch,
        count(*)::int as total,
        count(*) filter (where used = true)::int as used
      from voter_codes
      group by batch
      order by batch
    ) t;

  v_code_stats := jsonb_build_object(
    'total', (select count(*) from voter_codes),
    'used', (select count(*) from voter_codes where used = true),
    'unused', (select count(*) from voter_codes where used = false),
    'by_batch', v_batch_stats
  );

  return jsonb_build_object(
    'proposals', v_proposals,
    'total_votes', v_total_votes,
    'rating_distribution', v_distribution,
    'code_stats', v_code_stats
  );
end;
$$;

revoke all on function public.get_results_data() from public;
grant execute on function public.get_results_data() to anon, authenticated;
