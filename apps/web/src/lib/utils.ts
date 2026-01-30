import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Capitalize the first letter of a word
 */
export function capitalizeWord(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Slice a Stellar address for display (e.g., GCKF...2BVN7)
 */
export function sliceAddress(address: string, startChars = 4, endChars = 5): string {
    if (!address) return "";
    if (address.length <= startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
