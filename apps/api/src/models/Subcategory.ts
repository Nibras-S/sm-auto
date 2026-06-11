import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const subcategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    categoryName: { type: String, trim: true }, // denormalized for display
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// slug is unique within a category, not globally
subcategorySchema.index({ category: 1, slug: 1 }, { unique: true });

export type SubcategorySchemaType = InferSchemaType<typeof subcategorySchema>;
export type SubcategoryDoc = HydratedDocument<SubcategorySchemaType>;
export const Subcategory = model('Subcategory', subcategorySchema);
