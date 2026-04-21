export interface DisputedMission {
  id: number;
  category: string;
  region: string;
  donor: string;
  donorName: string;
  selectedAgency: string;
  agencyName: string | null;
  lockedFunds: bigint;
}

export type ArbiterProcessingId = number | "fees" | null;
