import { counterKey, type DocKind } from '@sm/shared';
import { Counter } from '../models/Counter';

/** Atomically increments and returns the next sequence value for a kind+year. */
export async function nextSeq(kind: DocKind, year: number): Promise<number> {
  const doc = await Counter.findByIdAndUpdate(
    counterKey(kind, year),
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  );
  return doc!.seq;
}
