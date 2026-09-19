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
