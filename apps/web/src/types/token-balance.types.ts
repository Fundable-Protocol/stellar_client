/**
 * Type definitions for Token Balance Display feature
 *
 * This module contains TypeScript interfaces for:
 * - Token balance data structures
 * - Component props
 * - Horizon API response types
 * - Component state management
 *
 * @see .kiro/specs/token-balance-display/design.md
 */

/**
 * Horizon API balance structure
 * Represents a single balance entry from the Stellar Horizon API account response
 */
export interface HorizonBalance {
  /** Balance amount as a string */
  balance: string;
  /** Asset type: "native" for XLM, "credit_alphanum4" or "credit_alphanum12" for custom tokens */
  asset_type: "native" | "credit_alphanum4" | "credit_alphanum12";
  /** Asset code (e.g., "USDC", "BTC") - undefined for native XLM */
  asset_code?: string;
  /** Public key of the asset issuer - undefined for native XLM */
  asset_issuer?: string;
  /** Credit limit for the asset - optional */
  limit?: string;
}

/**
 * Internal token balance data model
 * Transformed from Horizon API response for component consumption
 */
export interface TokenBalanceData {
  /** Asset code (e.g., "XLM", "USDC") */
  assetCode: string;
  /** Public key of the asset issuer (undefined for native XLM) */
  assetIssuer?: string;
  /** Raw balance amount as string */
  balance: string;
  /** Full URL to token icon from Stellar Expert */
  iconUrl: string;
}

/**
 * Component state for TokenBalanceList
 * Manages loading, error, and data states
 */
export interface TokenBalanceState {
  /** Array of token balances, null if not yet loaded, empty array if no balances */
  balances: TokenBalanceData[] | null;
  /** Loading state - true during fetch */
  loading: boolean;
  /** Error object if fetch failed, null otherwise */
  error: Error | null;
}

/**
 * Props for TokenBalance presentational component
 * Displays a single token's balance information
 */
export interface TokenBalanceProps {
  /** Asset code to display (e.g., "XLM", "USDC") */
  assetCode: string;
  /** Asset issuer public key (optional, undefined for native XLM) */
  assetIssuer?: string;
  /** Balance amount as string */
  balance: string;
  /** URL to token icon (optional) */
  iconUrl?: string;
}

/**
 * Props for TokenBalanceList container component
 * Fetches and displays all token balances for connected account
 */
export interface TokenBalanceListProps {
  /** Optional CSS class name for styling */
  className?: string;
}
