/**
 * Formats a balance amount string into a human-readable format.
 *
 * Requirements:
 * - 6.1: Format with thousands separators (commas)
 * - 6.2: Display scientific notation for amounts < 0.0000001
 * - 6.3: Display "0" for zero balance
 * - 6.4: Preserve trailing zeros up to 2 decimal places
 * - 6.5: Handle very large values without overflow
 * - 2.2: Max 7 decimal places precision
 * - 2.4: Round to 7 decimal places when needed
 *
 * @param amount - Raw balance string from Horizon API
 * @returns Formatted balance string
 *
 * @example
 * formatBalance("1234567.89") // "1,234,567.89"
 * formatBalance("0.00000001") // "1e-8"
 * formatBalance("0") // "0"
 * formatBalance("100.5") // "100.50"
 */
export function formatBalance(amount: string): string {
  // Handle empty or invalid input
  if (!amount || amount.trim() === "") {
    return "0";
  }

  // Parse the amount as a number
  const numericAmount = parseFloat(amount);

  // Handle NaN, Infinity, or invalid numbers
  if (!isFinite(numericAmount)) {
    return "0";
  }

  // Requirement 6.3: Display "0" for zero balance
  if (numericAmount === 0) {
    return "0";
  }

  // Requirement 6.2: Use scientific notation for very small numbers (< 0.0000001)
  if (Math.abs(numericAmount) < 0.0000001) {
    return numericAmount.toExponential();
  }

  // Requirement 2.4: Round to max 7 decimal places
  // Use a more precise rounding approach to avoid floating point errors
  const roundedAmount = Math.round(numericAmount * 1e7) / 1e7;

  // Convert to string with appropriate decimal places
  let formattedAmount: string;

  // Determine the number of decimal places to show
  const absAmount = Math.abs(roundedAmount);

  if (absAmount >= 1) {
    // For amounts >= 1, show up to 2 decimal places (Requirement 6.4)
    // But remove unnecessary trailing zeros beyond 2 decimal places
    formattedAmount = roundedAmount.toFixed(2);
  } else {
    // For amounts < 1, show up to 7 decimal places but remove unnecessary trailing zeros
    formattedAmount = roundedAmount.toFixed(7);
    // Remove trailing zeros beyond 2 decimal places
    const parts = formattedAmount.split(".");
    if (parts[1]) {
      // Keep at least 2 decimal places, remove trailing zeros beyond that
      let decimals = parts[1];
      // Find the last non-zero digit
      let lastNonZero = decimals.length - 1;
      while (lastNonZero > 1 && decimals[lastNonZero] === "0") {
        lastNonZero--;
      }
      decimals = decimals.substring(0, lastNonZero + 1);
      // Ensure at least 2 decimal places
      if (decimals.length < 2) {
        decimals = decimals.padEnd(2, "0");
      }
      formattedAmount = parts[0] + "." + decimals;
    }
  }

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = formattedAmount.split(".");

  // Requirement 6.1: Add thousands separators (commas)
  // Handle negative numbers
  const isNegative = integerPart.startsWith("-");
  const absoluteInteger = isNegative ? integerPart.substring(1) : integerPart;

  // Add commas for thousands separators
  const formattedInteger = absoluteInteger.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ",",
  );

  // Reconstruct the number
  const finalInteger = isNegative ? "-" + formattedInteger : formattedInteger;

  // Combine integer and decimal parts
  if (decimalPart) {
    return finalInteger + "." + decimalPart;
  }

  return finalInteger;
}
