export const PAYMENT_STREAM_CONTRACT_ID = process.env.NEXT_PUBLIC_PAYMENT_STREAM_CONTRACT_ID || "CB...";
export const DISTRIBUTOR_CONTRACT_ID = process.env.NEXT_PUBLIC_DISTRIBUTOR_CONTRACT_ID || "CB...";
export const SOROBAN_RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";

// Distribution
export const distributionType = ["equal", "weighted"] as const;
export const supportedNetwork = ["mainnet", "testnet"] as const;
export const distributionStatus = ["completed", "failed", "pending"] as const;
export const distributionState = [
    "process-started",
    "initiate-distribution",
    "process-completed",
    "request-confirmed",
    "request-confirmation",
] as const;

// Payment Stream
export const paymentStreamStatus = ["active", "paused", "canceled", "completed"] as const;
export const validPageLimits = [10, 20, 50, 100] as const;

// Stellar Explorer
export const STELLAR_EXPERT_URL = "https://stellar.expert/explorer/testnet";
