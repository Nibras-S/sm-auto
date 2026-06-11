import type { PageMeta } from '@sm/shared';

export function numParam(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function boolParam(v: unknown): boolean | undefined {
  if (v === undefined) return undefined;
  return v === 'true' || v === true;
}

export function pageMeta(total: number, page: number, limit: number): PageMeta {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
