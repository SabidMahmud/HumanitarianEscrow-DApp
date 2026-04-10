/**
 * useTxHandler — transaction lifecycle state machine.
 *
 * States: idle → preparing → waitingForSignature → pending → confirmed → error
 *
 * Provides:
 *   - execute(fn) — wraps a contract write call with full lifecycle tracking
 *   - status — current transaction state
 *   - txHash — transaction hash once submitted
 *   - error — error message if reverted or rejected
 *   - reset() — return to idle
 *
 * TODO: Implement when wiring the first write transaction (e.g., registerUser).
 */

// import { useState, useCallback } from "react";

export type TxStatus = "idle" | "preparing" | "waitingForSignature" | "pending" | "confirmed" | "error";

export {};
