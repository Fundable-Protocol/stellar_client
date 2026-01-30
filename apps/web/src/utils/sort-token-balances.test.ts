/**
 * Unit tests for token balance sorting utility
 *
 * Tests the sortTokenBalances function to ensure:
 * - XLM is always sorted first
 * - Other tokens are sorted alphabetically by asset code
 * - Empty arrays are handled correctly
 * - Single token arrays are handled correctly
 *
 * @see .kiro/specs/token-balance-display/design.md
 */

import type { TokenBalanceData } from "../types/token-balance.types";
import { sortTokenBalances } from "./sort-token-balances";

describe("sortTokenBalances", () => {
  it("sorts XLM first, then alphabetically", () => {
    const balances: TokenBalanceData[] = [
      {
        assetCode: "USDC",
        assetIssuer: "issuer1",
        balance: "100",
        iconUrl: "url1",
      },
      {
        assetCode: "XLM",
        balance: "50",
        iconUrl: "url2",
      },
      {
        assetCode: "BTC",
        assetIssuer: "issuer2",
        balance: "0.5",
        iconUrl: "url3",
      },
    ];

    const sorted = sortTokenBalances(balances);

    expect(sorted[0].assetCode).toBe("XLM");
    expect(sorted[1].assetCode).toBe("BTC");
    expect(sorted[2].assetCode).toBe("USDC");
  });

  it("handles array without XLM", () => {
    const balances: TokenBalanceData[] = [
      {
        assetCode: "USDC",
        assetIssuer: "issuer1",
        balance: "100",
        iconUrl: "url1",
      },
      {
        assetCode: "BTC",
        assetIssuer: "issuer2",
        balance: "0.5",
        iconUrl: "url2",
      },
      {
        assetCode: "AQUA",
        assetIssuer: "issuer3",
        balance: "1000",
        iconUrl: "url3",
      },
    ];

    const sorted = sortTokenBalances(balances);

    expect(sorted[0].assetCode).toBe("AQUA");
    expect(sorted[1].assetCode).toBe("BTC");
    expect(sorted[2].assetCode).toBe("USDC");
  });

  it("handles empty array", () => {
    const balances: TokenBalanceData[] = [];
    const sorted = sortTokenBalances(balances);
    expect(sorted).toEqual([]);
  });

  it("handles single token array", () => {
    const balances: TokenBalanceData[] = [
      {
        assetCode: "XLM",
        balance: "100",
        iconUrl: "url",
      },
    ];

    const sorted = sortTokenBalances(balances);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].assetCode).toBe("XLM");
  });

  it("handles single non-XLM token", () => {
    const balances: TokenBalanceData[] = [
      {
        assetCode: "USDC",
        assetIssuer: "issuer",
        balance: "100",
        iconUrl: "url",
      },
    ];

    const sorted = sortTokenBalances(balances);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].assetCode).toBe("USDC");
  });

  it("does not mutate original array", () => {
    const balances: TokenBalanceData[] = [
      {
        assetCode: "USDC",
        assetIssuer: "issuer1",
        balance: "100",
        iconUrl: "url1",
      },
      {
        assetCode: "XLM",
        balance: "50",
        iconUrl: "url2",
      },
    ];

    const original = [...balances];
    sortTokenBalances(balances);

    // Original array should remain unchanged
    expect(balances).toEqual(original);
  });

  it("handles multiple tokens with same starting letter", () => {
    const balances: TokenBalanceData[] = [
      {
        assetCode: "USDT",
        assetIssuer: "issuer1",
        balance: "100",
        iconUrl: "url1",
      },
      {
        assetCode: "USDC",
        assetIssuer: "issuer2",
        balance: "200",
        iconUrl: "url2",
      },
      {
        assetCode: "USD",
        assetIssuer: "issuer3",
        balance: "300",
        iconUrl: "url3",
      },
    ];

    const sorted = sortTokenBalances(balances);

    expect(sorted[0].assetCode).toBe("USD");
    expect(sorted[1].assetCode).toBe("USDC");
    expect(sorted[2].assetCode).toBe("USDT");
  });

  it("handles case-sensitive sorting correctly", () => {
    const balances: TokenBalanceData[] = [
      {
        assetCode: "btc",
        assetIssuer: "issuer1",
        balance: "1",
        iconUrl: "url1",
      },
      {
        assetCode: "BTC",
        assetIssuer: "issuer2",
        balance: "2",
        iconUrl: "url2",
      },
      {
        assetCode: "AQUA",
        assetIssuer: "issuer3",
        balance: "3",
        iconUrl: "url3",
      },
    ];

    const sorted = sortTokenBalances(balances);

    // localeCompare should handle case-insensitive sorting
    expect(sorted[0].assetCode).toBe("AQUA");
    // BTC and btc order depends on localeCompare implementation
    expect(["BTC", "btc"]).toContain(sorted[1].assetCode);
    expect(["BTC", "btc"]).toContain(sorted[2].assetCode);
  });

  it("XLM always first even with lowercase tokens", () => {
    const balances: TokenBalanceData[] = [
      {
        assetCode: "abc",
        assetIssuer: "issuer1",
        balance: "1",
        iconUrl: "url1",
      },
      {
        assetCode: "XLM",
        balance: "2",
        iconUrl: "url2",
      },
      {
        assetCode: "AAA",
        assetIssuer: "issuer3",
        balance: "3",
        iconUrl: "url3",
      },
    ];

    const sorted = sortTokenBalances(balances);

    expect(sorted[0].assetCode).toBe("XLM");
  });
});
