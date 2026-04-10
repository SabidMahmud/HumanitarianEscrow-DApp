/**
 * Formatting utilities for addresses and ETH values.
 */

/**
 * Shorten an Ethereum address to `0x1234…abcd` format.
 * @param address Full 42-character hex address
 * @param prefixLen Characters to show after "0x" (default 4)
 * @param suffixLen Characters to show at the end (default 4)
 */
export function shortenAddress(address: string, prefixLen = 4, suffixLen = 4): string {
  if (!address || address.length < 10) return address ?? "";
  return `${address.slice(0, prefixLen + 2)}…${address.slice(-suffixLen)}`;
}

/**
 * Format a wei BigInt to a human-readable ETH string.
 * @param wei Amount in wei (bigint or string)
 * @param decimals Decimal places to show (default 4)
 */
export function formatEth(wei: bigint | string, decimals = 4): string {
  const value = typeof wei === "string" ? BigInt(wei) : wei;
  const eth = Number(value) / 1e18;
  return eth.toFixed(decimals);
}
