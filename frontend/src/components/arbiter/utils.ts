export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function truncateAddress(
  addr: string,
  prefixLength = 8,
  suffixLength = 6,
) {
  return `${addr.slice(0, prefixLength)}…${addr.slice(-suffixLength)}`;
}
