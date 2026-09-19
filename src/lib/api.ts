import { getSupabase, isSupabaseConfigured } from './supabase';
import { fallbackProposals } from '../data/fallback';
import type { DraftRatings, Proposal, ValidateStatus, VoteServerError } from '../types';

// Toda la comunicación con la base de datos pasa por funciones SQL
// llamadas por RPC. El navegador NUNCA lee ni escribe tablas directamente.

function toVoteError(message: string): VoteServerError {
  if (message.includes('already_used')) return 'already_used';
  if (message.includes('invalid_code')) return 'invalid_code';
  if (message.includes('invalid_proposal')) return 'invalid_proposal';
  if (message.includes('invalid_rating')) return 'invalid_rating';
  if (message.includes('rate_limited')) return 'rate_limited';
  return 'connect';
}

export async function validateCode(code: string): Promise<ValidateStatus> {
  const sb = getSupabase();
  const { data, error } = await sb.rpc('validate_code', { p_code: code });
  if (error) throw new Error('connect');
  if (data === 'valid' || data === 'used' || data === 'rate_limited') return data;
  return 'invalid';
}

function normalizeProposal(raw: Record<string, unknown>): Proposal {
  const asStrings = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  const extra = Array.isArray(raw.extra_info)
    ? raw.extra_info
        .filter(
          (x): x is { label: string; value: string } =>
            typeof x === 'object' &&
            x !== null &&
            typeof (x as { label?: unknown }).label === 'string' &&
            typeof (x as { value?: unknown }).value === 'string',
        )
        .map((x) => ({ label: x.label, value: x.value }))
    : [];
  return {
    id: String(raw.id ?? ''),
    position: Number(raw.position ?? 0),
    promotion_name: String(raw.promotion_name ?? 'Por definir'),
    tagline: typeof raw.tagline === 'string' ? raw.tagline : null,
    description: typeof raw.description === 'string' ? raw.description : null,
    shirt_images: asStrings(raw.shirt_images),
    jacket_images: asStrings(raw.jacket_images),
    extra_info: extra,
  };
}

export async function getProposals(code: string): Promise<Proposal[]> {
  // Sin backend configurado, usa datos de respaldo para desarrollo visual.
  if (!isSupabaseConfigured) return fallbackProposals;
  const sb = getSupabase();
  const { data, error } = await sb.rpc('get_proposals', { p_code: code });
  if (error) throw new Error(toVoteError(error.message));
  if (!Array.isArray(data)) return [];
  return (data as Record<string, unknown>[]).map(normalizeProposal);
}

export async function castVote(
  code: string,
  proposalId: string,
  ratings: DraftRatings,
): Promise<'ok'> {
  const sb = getSupabase();
  const { data, error } = await sb.rpc('cast_vote', {
    p_code: code,
    p_proposal_id: proposalId,
    p_ratings: ratings,
  });
  if (error) throw new Error(toVoteError(error.message));
  if (data !== 'ok') throw new Error('connect');
  return 'ok';
}
