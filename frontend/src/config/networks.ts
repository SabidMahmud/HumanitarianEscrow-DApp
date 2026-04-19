/**
 * Per-chain contract address configuration.
 *
 * In production, set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env.local
 * to override the default.
 */

type NetworkConfig = {
  contractAddress: string;
  name: string;
};

/** Map of chainId → contract configuration. */
export const NETWORKS: Record<number, NetworkConfig> = {
  // Ganache local development (default)
  1337: {
    contractAddress:
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "",
    name: "Ganache (Local)",
  },
  // Ganache may use a custom chain ID — add yours here
  1775745826738: {
    contractAddress:
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
      "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    name: "Ganache (Local)",
  },
};

/**
 * Get the contract address for a given chain ID.
 * Falls back to the env variable, then to the hardcoded Ganache default.
 */
export function getContractAddress(chainId: number): string | null {
  return NETWORKS[chainId]?.contractAddress ?? null;
}
