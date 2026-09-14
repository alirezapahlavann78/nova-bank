const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/**
 * Normalises user-typed phone numbers:
 *  - converts Persian (۰-۹) and Arabic (٠-٩) digits to ASCII
 *  - strips spaces, dashes, dots and parentheses
 * so the value matches the API's `/^\+?[0-9]{10,15}$/` rule.
 */
export function normalizePhone(raw: string): string {
  let value = (raw ?? '').trim().replace(/[\s\-.()]/g, '');
  value = value.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));
  value = value.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
  return value;
}

export function isValidPhone(value: string): boolean {
  return /^\+?[0-9]{10,15}$/.test(value);
}
