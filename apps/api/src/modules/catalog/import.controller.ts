import { z } from 'zod';
import { ProductAvailability, ProductStatus, toFils } from '@sm/shared';
import { asyncHandler } from '../../utils/asyncHandler';
import { Product } from '../../models/Product';
import { Brand } from '../../models/Brand';
import { Category } from '../../models/Category';
import { slugify, uniqueSlug } from '../../utils/slug';

const importSchema = z.object({
  rows: z.array(z.record(z.string(), z.any())).min(1).max(5000),
});

const pick = (row: Record<string, unknown>, ...keys: string[]) => {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') return String(row[k]).trim();
  }
  return '';
};

// Parse "Make>Model>Generation>Engine>YearStart-YearEnd; …" or free text into fitments.
function parseFitment(raw: string) {
  if (!raw) return [];
  return raw
    .split(/[;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const parts = entry.split('>').map((p) => p.trim());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fit: any = { make: parts[0] || entry };
      if (parts[1]) fit.model = parts[1];
      if (parts[2]) fit.generation = parts[2];
      if (parts[3]) fit.engineType = parts[3];
      if (parts[4]) {
        const [ys, ye] = parts[4].split('-');
        if (ys) fit.yearStart = Number(ys);
        if (ye) fit.yearEnd = Number(ye);
      }
      return fit;
    });
}

export const importProducts = asyncHandler(async (req, res) => {
  const { rows } = importSchema.parse(req.body);

  const [brands, categories] = await Promise.all([Brand.find(), Category.find()]);
  const brandByName = new Map(brands.map((b) => [b.name.toLowerCase(), b]));
  const catByKey = new Map<string, (typeof categories)[number]>();
  categories.forEach((c) => {
    catByKey.set(c.name.toLowerCase(), c);
    catByKey.set(c.slug.toLowerCase(), c);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = [];
  let created = 0;
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const line = i + 1;
    try {
      const sku = pick(row, 'sku', 'SKU');
      const name = pick(row, 'name', 'Product Name', 'productName');
      if (!sku || !name) {
        failed += 1;
        results.push({ row: line, status: 'error', message: 'SKU and Product Name are required' });
        continue;
      }
      const brand = brandByName.get(pick(row, 'brand', 'Brand').toLowerCase());
      const cat = catByKey.get(pick(row, 'category', 'Category').toLowerCase());
      const priceRaw = pick(row, 'price', 'Price');
      const priceNum = priceRaw ? Number(priceRaw) : null;
      const price = priceNum != null && !Number.isNaN(priceNum) ? toFils(priceNum) : null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = {
        name,
        partNumber: pick(row, 'partNumber', 'Part Number') || undefined,
        oemNumber: pick(row, 'oemNumber', 'OEM Number') || undefined,
        productType: pick(row, 'productType', 'Product Type') || undefined,
        warranty: pick(row, 'warranty', 'Warranty') || undefined,
        description: pick(row, 'description', 'Description') || undefined,
        fitments: parseFitment(pick(row, 'fitment', 'Vehicle Fitment')),
        price,
        availability: price != null ? ProductAvailability.Available : ProductAvailability.OnRequest,
      };
      if (brand) {
        data.brand = brand._id;
        data.brandName = brand.name;
        data.brandSlug = brand.slug;
      }
      if (cat) {
        data.category = cat._id;
        data.categoryName = cat.name;
        data.categorySlug = cat.slug;
      }

      // eslint-disable-next-line no-await-in-loop
      const existing = await Product.findOne({ sku });
      if (existing) {
        existing.set(data);
        // eslint-disable-next-line no-await-in-loop
        await existing.save();
        updated += 1;
        results.push({ row: line, status: 'updated', sku });
      } else {
        // eslint-disable-next-line no-await-in-loop
        const slug = await uniqueSlug(Product, name);
        // eslint-disable-next-line no-await-in-loop
        await Product.create({ sku, slug, status: ProductStatus.Active, ...data });
        created += 1;
        results.push({ row: line, status: 'created', sku });
      }
    } catch (err) {
      failed += 1;
      results.push({ row: line, status: 'error', message: (err as Error).message });
    }
  }

  res.json({ total: rows.length, created, updated, failed, results });
});
