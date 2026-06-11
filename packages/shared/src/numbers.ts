// Human-friendly document numbers (Appendix A, fix #14 — one convention, uniform
// zero-padding width of 5). Sequence values come from the `Counter` collection.
//
//   Order         SM-O-2026-00042
//   Quotation     SM-Q-2026-00042
//   Quote request SM-QR-2026-00042
//   Inquiry       SM-INQ-2026-00042

export const DOC_PREFIX = {
  order: 'SM-O',
  quotation: 'SM-Q',
  quoteRequest: 'SM-QR',
  inquiry: 'SM-INQ',
  lead: 'SM-L',
} as const;

export type DocKind = keyof typeof DOC_PREFIX;

export const DOC_NUMBER_PAD = 5;

export function formatDocNumber(prefix: string, year: number, seq: number, pad = DOC_NUMBER_PAD): string {
  return `${prefix}-${year}-${String(seq).padStart(pad, '0')}`;
}

export const orderNumber = (year: number, seq: number) =>
  formatDocNumber(DOC_PREFIX.order, year, seq);
export const quotationNumber = (year: number, seq: number) =>
  formatDocNumber(DOC_PREFIX.quotation, year, seq);
export const quoteRequestNumber = (year: number, seq: number) =>
  formatDocNumber(DOC_PREFIX.quoteRequest, year, seq);
export const inquiryNumber = (year: number, seq: number) =>
  formatDocNumber(DOC_PREFIX.inquiry, year, seq);
export const leadNumber = (year: number, seq: number) =>
  formatDocNumber(DOC_PREFIX.lead, year, seq);

/** The Counter collection key for a given doc kind + year, e.g. "order:2026". */
export const counterKey = (kind: DocKind, year: number) => `${kind}:${year}`;
