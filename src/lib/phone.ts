/**
 * ============================================================
 * PHONE NUMBER HELPERS
 * ============================================================
 * Members type their phone as 07XXXXXXXX on the Register screen,
 * but Daraja C2B confirmations arrive with the number in
 * 254XXXXXXXXX format. If these two formats don't match exactly,
 * the "who paid?" lookup in mpesa-confirmation will silently fail
 * to find the member — this is a REAL, common bug in M-Pesa
 * integrations, so we normalize at input time and store ONE
 * canonical format (254XXXXXXXXX) everywhere in the database.
 * ============================================================
 */

/**
 * Converts any of these inputs -> "254712345678":
 *   "0712345678"
 *   "712345678"
 *   "+254712345678"
 *   "254712345678"
 */
export function normalizePhone(raw: string): string {
  // Strip everything except digits.
  const digits = raw.replace(/\D/g, '');

  if (digits.startsWith('254') && digits.length === 12) {
    return digits;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return '254' + digits.slice(1);
  }
  if (digits.length === 9) {
    // e.g. "712345678" with no leading 0 or 254
    return '254' + digits;
  }
  // Doesn't match a known Kenyan mobile pattern — return as-is so
  // validatePhone() below can reject it with a clear error instead
  // of us guessing wrong and corrupting the number.
  return digits;
}

/** Returns true only for a normalized, 12-digit 254XXXXXXXXX number. */
export function isValidKenyanPhone(raw: string): boolean {
  const normalized = normalizePhone(raw);
  // 254 + 7 or 1 (Safaricom/other mobile prefixes) + 8 more digits.
  return /^254(7|1)\d{8}$/.test(normalized);
}

/** Formats a canonical 254XXXXXXXXX number back to 0XXXXXXXXX for display. */
export function displayPhone(canonical: string): string {
  if (canonical.startsWith('254') && canonical.length === 12) {
    return '0' + canonical.slice(3);
  }
  return canonical;
}
