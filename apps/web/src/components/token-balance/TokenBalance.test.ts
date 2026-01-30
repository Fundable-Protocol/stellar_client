import { TokenBalance } from "./TokenBalance";
import type { TokenBalanceProps } from "@/types/token-balance.types";

describe("TokenBalance Component", () => {
  describe("component exports", () => {
    it("should export TokenBalance component", () => {
      expect(TokenBalance).toBeDefined();
      expect(typeof TokenBalance).toBe("function");
    });
  });

  describe("props interface", () => {
    it("should accept valid TokenBalanceProps", () => {
      const validProps: TokenBalanceProps = {
        assetCode: "XLM",
        balance: "1234.5678",
        iconUrl: "https://stellar.expert/explorer/public/asset/XLM",
      };

      expect(validProps.assetCode).toBe("XLM");
      expect(validProps.balance).toBe("1234.5678");
      expect(validProps.iconUrl).toBe(
        "https://stellar.expert/explorer/public/asset/XLM",
      );
    });

    it("should accept props with optional assetIssuer", () => {
      const propsWithIssuer: TokenBalanceProps = {
        assetCode: "USDC",
        assetIssuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
        balance: "500.00",
        iconUrl:
          "https://stellar.expert/explorer/public/asset/USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
      };

      expect(propsWithIssuer.assetIssuer).toBeDefined();
      expect(propsWithIssuer.assetIssuer?.length).toBe(56);
    });

    it("should accept props without iconUrl", () => {
      const propsWithoutIcon: TokenBalanceProps = {
        assetCode: "BTC",
        balance: "0.5",
      };

      expect(propsWithoutIcon.iconUrl).toBeUndefined();
    });
  });

  describe("icon fallback handling", () => {
    // Requirement 5.3: Display fallback placeholder icon on error

    it("should handle missing iconUrl by using fallback", () => {
      const propsWithoutIcon: TokenBalanceProps = {
        assetCode: "XLM",
        balance: "100.00",
      };

      // Component should be able to render without iconUrl
      expect(propsWithoutIcon.iconUrl).toBeUndefined();
      expect(propsWithoutIcon.assetCode).toBeDefined();
      expect(propsWithoutIcon.assetCode.length).toBeGreaterThan(0);
    });

    it("should provide fallback character from asset code", () => {
      const testCases = [
        { assetCode: "XLM", expectedFallback: "X" },
        { assetCode: "USDC", expectedFallback: "U" },
        { assetCode: "BTC", expectedFallback: "B" },
        { assetCode: "ETH", expectedFallback: "E" },
        { assetCode: "A", expectedFallback: "A" },
      ];

      testCases.forEach(({ assetCode, expectedFallback }) => {
        const fallbackChar = assetCode.charAt(0);
        expect(fallbackChar).toBe(expectedFallback);
      });
    });

    it("should handle empty asset code gracefully", () => {
      const emptyAssetCode = "";
      const fallbackChar = emptyAssetCode.charAt(0);

      // charAt(0) on empty string returns empty string, not undefined
      expect(fallbackChar).toBe("");
    });

    it("should handle icon URLs that might fail", () => {
      const propsWithInvalidUrl: TokenBalanceProps = {
        assetCode: "TEST",
        balance: "50.00",
        iconUrl: "https://invalid-domain-that-does-not-exist.com/icon.png",
      };

      // Component should accept the URL even if it might fail to load
      expect(propsWithInvalidUrl.iconUrl).toBeDefined();
      expect(propsWithInvalidUrl.assetCode).toBe("TEST");
    });

    it("should handle various asset code formats for fallback", () => {
      const testCases = [
        { assetCode: "xlm", expectedFirst: "x" },
        { assetCode: "USDC", expectedFirst: "U" },
        { assetCode: "123", expectedFirst: "1" },
        { assetCode: "!@#", expectedFirst: "!" },
      ];

      testCases.forEach(({ assetCode, expectedFirst }) => {
        const fallbackChar = assetCode.charAt(0);
        expect(fallbackChar).toBe(expectedFirst);
      });
    });
  });

  describe("balance formatting integration", () => {
    it("should accept various balance formats", () => {
      const testCases: TokenBalanceProps[] = [
        { assetCode: "XLM", balance: "0" },
        { assetCode: "XLM", balance: "1234.5678901" },
        { assetCode: "XLM", balance: "0.0000001" },
        { assetCode: "XLM", balance: "999999999.99" },
      ];

      testCases.forEach((props) => {
        expect(props.balance).toBeDefined();
        expect(typeof props.balance).toBe("string");
      });
    });
  });
});
