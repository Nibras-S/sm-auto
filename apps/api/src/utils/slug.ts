import type { Model } from 'mongoose';

export function slugify(input: string): string {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

/** Produce a slug unique within `model`, appending -2, -3, … on collision. */
export async function uniqueSlug(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>,
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base) || 'item';
  let candidate = root;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (
    await model.exists({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    n += 1;
    candidate = `${root}-${n}`;
  }
  return candidate;
}
