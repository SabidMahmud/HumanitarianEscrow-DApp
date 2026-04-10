/**
 * Contract error → user-friendly message mapping.
 *
 * Maps Solidity custom error names (from HumanitarianEscrow.sol) to
 * messages suitable for display in the UI.
 *
 * See PRD Section 10.3 for the full specification.
 */

/** Known custom error names emitted by the contract. */
const ERROR_MESSAGES: Record<string, string> = {
  AlreadyRegistered:    "This wallet is already registered.",
  InvalidReputation:    "Reputation is below 40 — cannot pledge on missions.",
  BidExceedsBudget:     "Bid exceeds the mission's maximum budget.",
  InvalidMissionStatus: "This action is not allowed in the current mission status.",
  InsufficientFunds:    "Insufficient ETH sent for this transaction.",
  Unauthorized:         "You are not authorized to perform this action.",
  TransferFailed:       "On-chain transfer failed. Please try again.",
};

/** General fallback messages for non-contract errors. */
const WALLET_ERRORS: Record<string, string> = {
  ACTION_REJECTED:    "Transaction was rejected in your wallet.",
  INSUFFICIENT_FUNDS: "Your wallet does not have enough ETH.",
};

/**
 * Parse an error from ethers and return a user-friendly string.
 * @param error The error thrown by an ethers contract call or wallet interaction
 */
export function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") return "An unexpected error occurred.";

  const err = error as Record<string, unknown>;

  // ethers v6: error.reason contains the custom error name
  if (typeof err.reason === "string" && err.reason in ERROR_MESSAGES) {
    return ERROR_MESSAGES[err.reason];
  }

  // ethers v6: error.code for wallet-level rejections
  if (typeof err.code === "string" && err.code in WALLET_ERRORS) {
    return WALLET_ERRORS[err.code];
  }

  // Fallback: try to extract a message string
  if (typeof err.message === "string") {
    // Check if message contains a known error name
    for (const [key, msg] of Object.entries(ERROR_MESSAGES)) {
      if (err.message.includes(key)) return msg;
    }
    return err.message.length > 120 ? `${err.message.slice(0, 120)}…` : err.message;
  }

  return "An unexpected error occurred.";
}
