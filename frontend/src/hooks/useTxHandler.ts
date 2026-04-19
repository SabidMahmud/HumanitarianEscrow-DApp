import { useState, useCallback } from "react";

export type TxStatus =
  | "idle"
  | "preparing"
  | "waitingForSignature"
  | "pending"
  | "confirmed"
  | "error";

interface TxState {
  status: TxStatus;
  txHash: string | null;
  error: string | null;
}

/**
 * useTxHandler — transaction lifecycle state machine.
 *
 * States: idle → preparing → waitingForSignature → pending → confirmed → error
 *
 * Usage:
 *   const { execute, status, txHash, error, reset } = useTxHandler();
 *   await execute(() => contract.connect(signer).registerUser(name, role));
 */
export function useTxHandler() {
  const [state, setState] = useState<TxState>({
    status: "idle",
    txHash: null,
    error: null,
  });

  const execute = useCallback(async (fn: () => Promise<any>) => {
    setState({ status: "preparing", txHash: null, error: null });

    try {
      setState((s) => ({ ...s, status: "waitingForSignature" }));
      const tx = await fn(); // MetaMask popup appears here

      setState((s) => ({ ...s, status: "pending", txHash: tx.hash }));
      await tx.wait(); // wait for block confirmation

      setState((s) => ({ ...s, status: "confirmed" }));
    } catch (err: any) {
      // User rejected the tx in MetaMask → code 4001
      const message =
        err?.code === 4001
          ? "Transaction rejected in MetaMask."
          : err?.reason ?? err?.message ?? "Transaction failed.";
      setState({ status: "error", txHash: null, error: message });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle", txHash: null, error: null });
  }, []);

  return { ...state, execute, reset };
}
