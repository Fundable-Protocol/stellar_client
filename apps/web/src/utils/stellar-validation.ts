/**
 * Stellar address validation utilities
 */

/**
 * Validates if a string is a valid Stellar address format
 * Stellar addresses are 56 characters starting with G (for public keys) or C (for contract addresses)
 * @param address - The address string to validate
 * @returns true if the address is valid, false otherwise
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Stellar addresses are exactly 56 characters
  if (address.length !== 56) {
    return false;
  }

  // Must start with G (public key) or C (contract address)
  if (!address.startsWith('G') && !address.startsWith('C')) {
    return false;
  }

  // Must contain only valid base32 characters (A-Z, 2-7)
  const base32Regex = /^[GC][A-Z2-7]{55}$/;
  return base32Regex.test(address);
}

/**
 * Validates a Stellar address and returns a detailed error message if invalid
 * @param address - The address string to validate
 * @returns null if valid, error message if invalid
 */
export function validateStellarAddress(address: string): string | null {
  if (!address || typeof address !== 'string') {
    return 'Address is required';
  }

  if (address.trim() !== address) {
    return 'Address cannot have leading or trailing whitespace';
  }

  if (address.length === 0) {
    return 'Address cannot be empty';
  }

  if (address.length < 56) {
    return `Address is too short (${address.length} characters, expected 56)`;
  }

  if (address.length > 56) {
    return `Address is too long (${address.length} characters, expected 56)`;
  }

  if (!address.startsWith('G') && !address.startsWith('C')) {
    return 'Address must start with G (public key) or C (contract address)';
  }

  const base32Regex = /^[GC][A-Z2-7]{55}$/;
  if (!base32Regex.test(address)) {
    return 'Address contains invalid characters (must be A-Z, 2-7)';
  }

  return null;
}

/**
 * Checks if two Stellar addresses are the same
 * @param address1 - First address
 * @param address2 - Second address
 * @returns true if addresses are identical
 */
export function isSameAddress(address1: string, address2: string): boolean {
  return address1 === address2;
}

/**
 * Finds duplicate addresses in a list
 * @param addresses - Array of addresses to check
 * @returns Array of duplicate addresses
 */
export function findDuplicateAddresses(addresses: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const address of addresses) {
    if (seen.has(address)) {
      duplicates.add(address);
    } else {
      seen.add(address);
    }
  }

  return Array.from(duplicates);
}

/**
 * Validates a list of addresses and returns validation results
 * @param addresses - Array of addresses to validate
 * @returns Object with validation results
 */
export function validateAddressList(addresses: string[]): {
  validAddresses: string[];
  invalidAddresses: { address: string; error: string }[];
  duplicateAddresses: string[];
} {
  const validAddresses: string[] = [];
  const invalidAddresses: { address: string; error: string }[] = [];

  for (const address of addresses) {
    const error = validateStellarAddress(address);
    if (error) {
      invalidAddresses.push({ address, error });
    } else {
      validAddresses.push(address);
    }
  }

  const duplicateAddresses = findDuplicateAddresses(validAddresses);

  return {
    validAddresses,
    invalidAddresses,
    duplicateAddresses,
  };
}