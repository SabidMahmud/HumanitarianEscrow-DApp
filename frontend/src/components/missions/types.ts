import { MissionStatus } from "@/types/mission";

export interface LiveMission {
  id: number;
  category: string;
  region: string;
  maxBudget: bigint;
  lockedFunds: bigint;
  fundedAmount: bigint | null;
  settledAmount: bigint | null;
  status: MissionStatus;
  donor: string;
  donorName: string;
  selectedAgency: string;
  selectedAgencyName: string | null;
}

export type StatusFilter = MissionStatus | "ALL";
