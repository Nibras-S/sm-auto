// Money is stored as integer minor units (fils = AED × 100) everywhere to avoid
// floating-point rounding errors. Convert at the boundaries only.

export const CURRENCY_DEFAULT = 'AED';

/** Convert a major-unit amount (e.g. 49.95 AED) to integer fils (4995). */
export function toFils(amount: number): number {
  return Math.round(amount * 100);
}

/** Convert integer fils (4995) back to a major-unit number (49.95). */
export function fromFils(fils: number): number {
  return fils / 100;
}

/** Format integer fils as a localized currency string, e.g. "AED 49.95". */
export function formatMoney(
  fils: number | null | undefined,
  currency: string = CURRENCY_DEFAULT,
  locale = 'en-AE',
): string {
  if (fils == null) return 'On Request';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(fromFils(fils));
}
