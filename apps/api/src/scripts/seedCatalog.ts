import path from 'node:path';
import { ProductAvailability, ProductStatus } from '@sm/shared';
import { connectDb, disconnectDb } from '../config/db';
import { Brand } from '../models/Brand';
import { Category } from '../models/Category';
import { Subcategory } from '../models/Subcategory';
import { Product } from '../models/Product';
import { slugify } from '../utils/slug';

const CATEGORIES = [
  { slug: 'engine', name: 'Engine', tagline: 'The heart of every drive' },
  { slug: 'electrical-lighting', name: 'Electrical & Lighting', tagline: 'Power, sensors & visibility' },
  { slug: 'steering', name: 'Steering', tagline: 'Precision & control' },
  { slug: 'transmission', name: 'Transmission', tagline: 'Smooth power delivery' },
  { slug: 'cooling-heating', name: 'Cooling & Heating', tagline: 'Optimal temperature, always' },
  { slug: 'oils-lubricants', name: 'Engine Oils & Lubricants', tagline: 'Protection that lasts' },
  { slug: 'brakes-suspension', name: 'Brakes & Suspension', tagline: 'Stop & ride with confidence' },
  { slug: 'fuel-air', name: 'Fuel & Air Control', tagline: 'Breathe & burn efficiently' },
];

const BRAND_NAMES = [
  'Aston Martin', 'Audi', 'Mercedes-Benz', 'BMW', 'Bentley', 'Chevrolet', 'Dodge', 'Ferrari',
  'Ford', 'GMC', 'Jaguar', 'Jeep', 'Lamborghini', 'Lexus', 'Land Rover', 'Maserati', 'McLaren',
  'Nissan', 'Porsche', 'Volkswagen',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadStaticProducts(): Promise<any[]> {
  const file = path.resolve(__dirname, '../../../storefront/src/data/products.js');
  const mod = await import(file);
  return (mod.products ?? mod.default?.products ?? []) as any[];
}

async function main() {
  await connectDb();

  // Dev seed: clear and re-create the catalog collections.
  await Promise.all([
    Product.deleteMany({}),
    Subcategory.deleteMany({}),
    Category.deleteMany({}),
    Brand.deleteMany({}),
  ]);

  const cats = await Category.create(
    CATEGORIES.map((c, i) => ({
      slug: c.slug,
      name: c.name,
      description: c.tagline,
      displayOrder: i,
      isActive: true,
    })),
  );
  const catBySlug = new Map(cats.map((c) => [c.slug, c]));

  const brands = await Brand.create(
    BRAND_NAMES.map((name, i) => ({
      name,
      slug: slugify(name),
      kind: ['vehicle', 'part'],
      displayOrder: i,
      isActive: true,
    })),
  );
  const brandByName = new Map(brands.map((b) => [b.name, b]));

  const staticProducts = await loadStaticProducts();
  const usedSku = new Set<string>();
  const mkSku = (base: string) => {
    let sku = base;
    let n = 1;
    while (usedSku.has(sku)) {
      n += 1;
      sku = `${base}-${n}`;
    }
    usedSku.add(sku);
    return sku;
  };

  let created = 0;
  for (const p of staticProducts) {
    const brand = brandByName.get(p.brand);
    const cat = catBySlug.get(p.category);
    // eslint-disable-next-line no-await-in-loop
    await Product.create({
      name: p.name,
      slug: p.slug,
      sku: mkSku(p.partNumber || slugify(p.slug).toUpperCase()),
      partNumber: p.partNumber,
      brand: brand?._id,
      brandName: brand?.name ?? p.brand,
      brandSlug: brand?.slug,
      category: cat?._id,
      categoryName: cat?.name ?? p.categoryName,
      categorySlug: cat?.slug,
      productType: p.type,
      condition: p.condition,
      warranty: p.warranty,
      shortDescription: p.shortDescription,
      description: p.description,
      highlights: p.highlights ?? [],
      specs: p.specs ?? [],
      fitments: (p.fitment ?? []).map((s: string) => ({ make: p.brand, model: s })),
      imageKey: p.imageKey,
      images: [],
      price: null,
      currency: 'AED',
      availability: ProductAvailability.OnRequest,
      status: ProductStatus.Active,
      featured: Boolean(p.featured),
      trending: Boolean(p.trending),
    });
    created += 1;
  }

  // eslint-disable-next-line no-console
  console.log(`✅ Seeded catalog: ${cats.length} categories, ${brands.length} brands, ${created} products`);
  await disconnectDb();
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('❌ Catalog seed failed:', err);
  await disconnectDb();
  process.exit(1);
});
