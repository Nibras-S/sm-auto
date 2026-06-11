import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import {
  CURRENCY_DEFAULT,
  PRODUCT_AVAILABILITIES,
  PRODUCT_CONDITIONS,
  PRODUCT_STATUSES,
  ProductAvailability,
  ProductStatus,
} from '@sm/shared';
import { cloudImageSchema, fitmentSchema, specSchema } from './_schemas';

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    partNumber: { type: String, trim: true },
    oemNumber: { type: String, trim: true },

    brand: { type: Schema.Types.ObjectId, ref: 'Brand' },
    brandName: { type: String, trim: true }, // denormalized for search/display
    brandSlug: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    categoryName: { type: String, trim: true },
    categorySlug: { type: String, trim: true },
    subcategory: { type: Schema.Types.ObjectId, ref: 'Subcategory' },
    subcategoryName: { type: String, trim: true },

    productType: { type: String, trim: true },
    productFamily: { type: String, trim: true },
    condition: { type: String, enum: PRODUCT_CONDITIONS },
    warranty: { type: String, trim: true },

    shortDescription: { type: String, trim: true },
    description: { type: String },
    highlights: { type: [String], default: [] },
    specs: { type: [specSchema], default: [] },
    fitments: { type: [fitmentSchema], default: [] },
    // Concatenated fitment text, kept in sync by the pre-save hook, so vehicle
    // terms (e.g. "W463", "E90") are reachable by the text index.
    fitmentText: { type: String, default: '' },

    images: { type: [cloudImageSchema], default: [] },
    imageKey: { type: String, default: null }, // legacy bundled-asset fallback

    price: { type: Number, default: null }, // integer fils; null => On Request
    costPrice: { type: Number, default: null },
    currency: { type: String, default: CURRENCY_DEFAULT },

    status: { type: String, enum: PRODUCT_STATUSES, default: ProductStatus.Draft },
    availability: {
      type: String,
      enum: PRODUCT_AVAILABILITIES,
      default: ProductAvailability.OnRequest,
    },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Full-text search across name, codes, and denormalized brand/category/fitment.
productSchema.index(
  {
    name: 'text',
    sku: 'text',
    partNumber: 'text',
    oemNumber: 'text',
    brandName: 'text',
    categoryName: 'text',
    fitmentText: 'text',
  },
  {
    name: 'product_text',
    weights: {
      name: 10,
      sku: 9,
      partNumber: 9,
      oemNumber: 9,
      brandName: 4,
      fitmentText: 3,
      categoryName: 2,
    },
  },
);
productSchema.index({ status: 1, featured: 1 });
productSchema.index({ status: 1, category: 1 });
productSchema.index({ status: 1, brand: 1 });
productSchema.index({ partNumber: 1 });
productSchema.index({ oemNumber: 1 });
productSchema.index({ 'fitments.make': 1, 'fitments.model': 1 });

type FitmentLike = {
  make?: string;
  model?: string;
  generation?: string;
  engineType?: string;
  yearStart?: number;
  yearEnd?: number;
};

export function buildFitmentText(fitments: FitmentLike[] = []): string {
  return fitments
    .map((f) =>
      [
        f.make,
        f.model,
        f.generation,
        f.engineType,
        f.yearStart && f.yearEnd ? `${f.yearStart}-${f.yearEnd}` : '',
      ]
        .filter(Boolean)
        .join(' '),
    )
    .join(' | ');
}

productSchema.pre('save', function (next) {
  // `this` is the product document; keep fitmentText in sync.
  const doc = this as unknown as { fitments?: FitmentLike[]; fitmentText?: string };
  doc.fitmentText = buildFitmentText(doc.fitments ?? []);
  next();
});

export type ProductSchemaType = InferSchemaType<typeof productSchema>;
export type ProductDoc = HydratedDocument<ProductSchemaType>;
export const Product = model('Product', productSchema);
