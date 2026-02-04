/**
 * Phone Formatting Utilities
 * Centralized phone number formatting for consistent display across the application
 */

/**
 * Format a phone number to (XXX) XXX-XXXX format
 * @param {string} phone - Raw phone number (digits only or with formatting)
 * @param {string|null} extension - Optional extension
 * @returns {string} - Formatted phone number
 *
 * @example
 * formatPhoneNumber("4165551234") // "(416) 555-1234"
 * formatPhoneNumber("4165551234", "123") // "(416) 555-1234 ext. 123"
 * formatPhoneNumber("123") // "123" (fallback for non-10-digit)
 */
export function formatPhoneNumber(phone, extension = null) {
  if (!phone) return "-";

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Handle 11-digit numbers starting with 1 (e.g., +15192252631 -> 15192252631)
  // Strip the leading 1 for North American numbers
  let digits = cleaned;
  if (cleaned.length === 11 && cleaned[0] === "1") {
    digits = cleaned.slice(1);
  }

  // Format 10-digit North American numbers
  if (digits.length === 10) {
    const formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    return extension ? `${formatted} ext. ${extension}` : formatted;
  }

  // Return original if not 10 digits (graceful fallback)
  return phone;
}

/**
 * Format phone number for tel: link (digits only)
 * @param {string} phone - Phone number
 * @returns {string} - Clean digits for tel: link
 *
 * @example
 * formatPhoneForTel("(416) 555-1234") // "4165551234"
 * formatPhoneForTel("416-555-1234") // "4165551234"
 */
export function formatPhoneForTel(phone) {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

/**
 * Normalize phone number for search by stripping all non-digit characters
 * This ensures search queries match database records regardless of format
 * @param {string} phone - Phone number in any format
 * @returns {string} - Digits-only phone number for search
 *
 * @example
 * normalizePhoneForSearch("(519) 225-2631") // "5192252631"
 * normalizePhoneForSearch("519-225-2631") // "5192252631"
 * normalizePhoneForSearch("+1 519 225 2631") // "15192252631"
 */
export function normalizePhoneForSearch(phone) {
  // Handle null, undefined, or empty string
  if (!phone) return "";

  // Strip all non-digit characters
  return phone.replace(/\D/g, "");
}
