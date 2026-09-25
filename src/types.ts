// Tipos compartidos de la plataforma de votación.

export type ViewState = 'enter' | 'vote' | 'done';

export interface ExtraInfoItem {
  label: string;
  value: string;
}

export interface Proposal {
  id: string;
  position: number;
  promotion_name: string;
  tagline: string | null;
  description: string | null;
  shirt_images: string[];
  jacket_images: string[];
  extra_info: ExtraInfoItem[];
}

/** Calificaciones borrador: proposalId -> score (1-10). */
export type DraftRatings = Record<string, number>;

export interface RatedSummaryItem {
  id: string;
  name: string;
  score: number | null;
}

export interface DoneSummary {
  proposalId: string;
  proposalName: string;
  ratings: RatedSummaryItem[];
}

export type ValidateStatus = 'valid' | 'invalid' | 'used' | 'rate_limited';

export type VoteServerError =
  | 'invalid_code'
  | 'already_used'
  | 'invalid_proposal'
  | 'invalid_rating'
  | 'rate_limited'
  | 'connect';

// ─── Resultados ───

export interface ProposalResult {
  id: string;
  position: number;
  promotion_name: string;
  favor_votes: number;
  ratings_count: number;
  avg_score: number | null;
  max_score: number;
  min_score: number;
}

export interface RatingDistributionItem {
  proposal_id: string;
  promotion_name: string;
  score: number;
  count: number;
}

export interface BatchStat {
  batch: string;
  total: number;
  used: number;
}

export interface CodeStats {
  total: number;
  used: number;
  unused: number;
  by_batch: BatchStat[];
}

export interface ResultsData {
  proposals: ProposalResult[];
  total_votes: number;
  rating_distribution: RatingDistributionItem[];
  code_stats: CodeStats;
}
