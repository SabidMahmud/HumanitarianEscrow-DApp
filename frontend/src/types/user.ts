/**
 * User types and enums — mapped from HumanitarianEscrow.sol
 *
 * Contract enum values:
 *   Role { UN_Arbiter=0, Donor=1, Relief_Agency=2 }
 */

export enum ContractRole {
  UN_Arbiter = 0,
  Donor = 1,
  Relief_Agency = 2,
}

/** Application-level role strings used throughout the frontend. */
export type AppRole = "UN_ARBITER" | "DONOR" | "RELIEF_AGENCY" | "UNREGISTERED" | null;

/** Human-readable labels for each contract role. */
export const ROLE_LABELS: Record<ContractRole, string> = {
  [ContractRole.UN_Arbiter]: "UN Arbiter",
  [ContractRole.Donor]: "Donor",
  [ContractRole.Relief_Agency]: "Relief Agency",
};

/** Parsed user data from the contract's `users(address)` mapping. */
export interface UserProfile {
  name: string;
  role: ContractRole;
  wallet: string;          // address
  reputationScore: number;
  isRegistered: boolean;
}
