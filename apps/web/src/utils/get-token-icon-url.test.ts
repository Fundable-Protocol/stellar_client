import { getTokenIconUrl } from "./get-token-icon-url";

describe("getTokenIconUrl", () => {
  const baseUrl = "https://stellar.expert/explorer/public/asset";

  describe("native XLM handling", () => {
    it("returns XLM URL when assetCode is XLM with no issuer", () => {
      const result = getTokenIconUrl("XLM");
      expect(result).toBe(`${baseUrl}/XLM`);
    });

    it("returns XLM URL when assetCode is XLM with issuer (special case)", () => {
      const result = getTokenIconUrl("XLM", "SOME_ISSUER");
      expect(result).toBe(`${baseUrl}/XLM`);
    });

    it("returns XLM URL when assetCode is XLM with undefined issuer", () => {
      const result = getTokenIconUrl("XLM", undefined);
      expect(result).toBe(`${baseUrl}/XLM`);
    });
  });

  describe("custom token handling", () => {
    it("constructs URL with asset code and issuer", () => {
      const assetCode = "USDC";
      const assetIssuer =
        "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
      const result = getTokenIconUrl(assetCode, assetIssuer);
      expect(result).toBe(`${baseUrl}/${assetCode}-${assetIssuer}`);
    });

    it("handles different asset codes correctly", () => {
      const assetIssuer =
        "GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX";

      expect(getTokenIconUrl("USDT", assetIssuer)).toBe(
        `${baseUrl}/USDT-${assetIssuer}`,
      );
      expect(getTokenIconUrl("BTC", assetIssuer)).toBe(
        `${baseUrl}/BTC-${assetIssuer}`,
      );
      expect(getTokenIconUrl("ETH", assetIssuer)).toBe(
        `${baseUrl}/ETH-${assetIssuer}`,
      );
    });

    it("handles short asset codes (alphanum4)", () => {
      const assetCode = "USD";
      const assetIssuer =
        "GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX";
      const result = getTokenIconUrl(assetCode, assetIssuer);
      expect(result).toBe(`${baseUrl}/${assetCode}-${assetIssuer}`);
    });

    it("handles long asset codes (alphanum12)", () => {
      const assetCode = "LONGASSETCODE";
      const assetIssuer =
        "GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX";
      const result = getTokenIconUrl(assetCode, assetIssuer);
      expect(result).toBe(`${baseUrl}/${assetCode}-${assetIssuer}`);
    });
  });

  describe("edge cases", () => {
    it("handles empty string issuer as no issuer", () => {
      const result = getTokenIconUrl("USDC", "");
      // Empty string is falsy, so should be treated as no issuer
      expect(result).toBe(`${baseUrl}/USDC`);
    });

    it("constructs valid URL format", () => {
      const result = getTokenIconUrl(
        "USDC",
        "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
      );

      // Verify URL structure
      expect(result).toMatch(/^https:\/\//);
      expect(result).toContain("stellar.expert");
      expect(result).toContain("/asset/");
      expect(result).toContain("-");
    });
  });
});
