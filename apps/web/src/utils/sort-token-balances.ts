/**
 * Token balance sorting utility
 *
 * Sorts token balances with native XLM first, followed by other tokens
 * alphabetically by asset code.
 *
 * @see .kiro/specs/token-balance-display/design.md
 * @see Requirements 3.3
 */

import type { TokenBalanceData } from "../types/token-balance.types";

/**
 * Sorts token balances with XLM first, then alphabetically by asset code
 *
 * @param balances - Array of token balance data to sort
 * @returns Sorted array with XLM first (if present), followed by other tokens alphabetically
 *
 * @example
 * ```typescript
 * const balances = [
 *   { assetCode: "USDC", balance: "100", iconUrl: "..." },
 *   { assetCode: "XLM", balance: "50", iconUrl: "..." },
 *   { assetCode: "BTC", balance: "0.5", iconUrl: "..." }
 * ];
 * const sorted = sortTokenBalances(balances);
 * // Result: [XLM, BTC, USDC]
 * ```
 */
export function sortTokenBalances(
  balances: TokenBalanceData[],
): TokenBalanceData[] {
  // Create a shallow copy to avoid mutating the original array
  return [...balances].sort((a, b) => {
    // XLM (native token) always comes first
    if (a.assetCode === "XLM") return -1;
    if (b.assetCode === "XLM") return 1;

    // Sort all other tokens alphabetically by asset code
    return a.assetCode.localeCompare(b.assetCode);
  });
}
