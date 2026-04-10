/**
 * Mission types and enums — mapped from HumanitarianEscrow.sol
 *
 * Contract enum values:
 *   MissionStatus { Pending=0, In_Transit=1, AwaitingApproval=2, Delivered=3, Disputed=4, Resolved=5 }
 */

export enum MissionStatus {
  Pending = 0,
  InTransit = 1,
  AwaitingApproval = 2,
  Delivered = 3,
  Disputed = 4,
  Resolved = 5,
}

/** Human-readable labels for each mission status. */
export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  [MissionStatus.Pending]: "Pending",
  [MissionStatus.InTransit]: "In Transit",
  [MissionStatus.AwaitingApproval]: "Awaiting Approval",
  [MissionStatus.Delivered]: "Delivered",
  [MissionStatus.Disputed]: "Disputed",
  [MissionStatus.Resolved]: "Resolved",
};

/** Parsed mission data from the contract's `missions(uint256)` mapping. */
export interface Mission {
  id: number;
  category: string;
  maxBudget: bigint;       // wei
  region: string;
  status: MissionStatus;
  donor: string;           // address
  selectedAgency: string;  // address (0x0 if none)
  lockedFunds: bigint;     // wei
}
