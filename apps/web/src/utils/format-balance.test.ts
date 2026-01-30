import { formatBalance } from "./format-balance";

describe("formatBalance", () => {
  describe("basic formatting", () => {
    it("should format a simple integer", () => {
      expect(formatBalance("100")).toBe("100.00");
    });

    it("should format a decimal number", () => {
      expect(formatBalance("123.45")).toBe("123.45");
    });

    it("should format with thousands separators", () => {
      expect(formatBalance("1234567.89")).toBe("1,234,567.89");
    });

    it("should format large numbers with multiple commas", () => {
      expect(formatBalance("1234567890.12")).toBe("1,234,567,890.12");
    });
  });

  describe("zero and empty values", () => {
    it('should display "0" for zero balance', () => {
      expect(formatBalance("0")).toBe("0");
    });

    it('should display "0" for "0.0"', () => {
      expect(formatBalance("0.0")).toBe("0");
    });

    it('should display "0" for empty string', () => {
      expect(formatBalance("")).toBe("0");
    });

    it('should display "0" for whitespace', () => {
      expect(formatBalance("   ")).toBe("0");
    });
  });

  describe("scientific notation for very small numbers", () => {
    it("should use scientific notation for numbers < 0.0000001", () => {
      const result = formatBalance("0.00000001");
      expect(result).toMatch(/^1e-8$/i);
    });

    it("should use scientific notation for very small positive numbers", () => {
      const result = formatBalance("0.00000005");
      expect(result).toMatch(/^5e-8$/i);
    });

    it("should use scientific notation for very small negative numbers", () => {
      const result = formatBalance("-0.00000001");
      expect(result).toMatch(/^-1e-8$/i);
    });

    it("should NOT use scientific notation for 0.0000001", () => {
      const result = formatBalance("0.0000001");
      expect(result).not.toMatch(/e/i);
      // 0.0000001 is at the boundary, so it should be displayed with 7 decimal places
      expect(result).toBe("0.0000001");
    });
  });

  describe("decimal precision", () => {
    it("should round to max 7 decimal places", () => {
      const result = formatBalance("1.123456789");
      expect(result).toBe("1.12");
    });

    it("should preserve up to 7 decimal places for small numbers", () => {
      const result = formatBalance("0.1234567");
      expect(result).toBe("0.1234567");
    });

    it("should round 8 decimal places to 7", () => {
      const result = formatBalance("0.12345678");
      // Should round to 7 decimal places
      expect(result).toBe("0.1234568");
    });
  });

  describe("trailing zeros", () => {
    it("should preserve trailing zeros up to 2 decimal places for integers", () => {
      expect(formatBalance("100")).toBe("100.00");
    });

    it("should preserve trailing zeros up to 2 decimal places", () => {
      expect(formatBalance("100.5")).toBe("100.50");
    });

    it("should preserve 2 decimal places", () => {
      expect(formatBalance("100.10")).toBe("100.10");
    });

    it("should remove trailing zeros beyond 2 decimal places for small numbers", () => {
      expect(formatBalance("0.1000000")).toBe("0.10");
    });

    it("should keep significant trailing zeros for small numbers", () => {
      expect(formatBalance("0.001234")).toBe("0.001234");
    });
  });

  describe("large values", () => {
    it("should handle very large values without overflow", () => {
      const result = formatBalance("999999999999999");
      expect(result).toBe("999,999,999,999,999.00");
    });

    it("should handle extremely large values", () => {
      const result = formatBalance("1000000000000000");
      expect(result).toContain(",");
      expect(result).not.toBe("0");
    });
  });

  describe("negative numbers", () => {
    it("should format negative numbers correctly", () => {
      expect(formatBalance("-123.45")).toBe("-123.45");
    });

    it("should format negative numbers with thousands separators", () => {
      expect(formatBalance("-1234567.89")).toBe("-1,234,567.89");
    });

    it("should handle negative zero", () => {
      expect(formatBalance("-0")).toBe("0");
    });
  });

  describe("edge cases", () => {
    it("should handle invalid input gracefully", () => {
      expect(formatBalance("invalid")).toBe("0");
    });

    it("should handle NaN", () => {
      expect(formatBalance("NaN")).toBe("0");
    });

    it("should handle Infinity", () => {
      expect(formatBalance("Infinity")).toBe("0");
    });

    it("should handle -Infinity", () => {
      expect(formatBalance("-Infinity")).toBe("0");
    });
  });

  describe("real-world Stellar balance examples", () => {
    it("should format typical XLM balance", () => {
      expect(formatBalance("1234.5678901")).toBe("1,234.57");
    });

    it("should format small token balance", () => {
      expect(formatBalance("0.0123456")).toBe("0.0123456");
    });

    it("should format fractional balance", () => {
      expect(formatBalance("0.5")).toBe("0.50");
    });

    it("should format whole number balance", () => {
      expect(formatBalance("1000")).toBe("1,000.00");
    });
  });
});
