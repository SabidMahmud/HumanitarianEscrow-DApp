import { useMemo } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI } from "@/config/contract";

/**
 * useContract — returns a signer-backed ethers Contract instance.
 *
 * Returns null if MetaMask is not available or no wallet is connected.
 * Use this for all on-chain write transactions (they require a signer).
 */
export function useContract(): Contract | null {
  return useMemo(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return null;
    if (!CONTRACT_ADDRESS) return null;

    const provider = new BrowserProvider((window as any).ethereum);
    // getSigner() is called lazily at transaction time — no async needed here
    const contract = new Contract(
      CONTRACT_ADDRESS,
      HUMANITARIAN_ESCROW_ABI,
      provider
    );

    return contract;
  }, []);
}
