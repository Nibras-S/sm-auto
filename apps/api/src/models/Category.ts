import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { cloudImageSchema } from './_schemas';

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    icon: { type: cloudImageSchema, default: null },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

categorySchema.index({ displayOrder: 1 });

export type CategorySchemaType = InferSchemaType<typeof categorySchema>;
export type CategoryDoc = HydratedDocument<CategorySchemaType>;
export const Category = model('Category', categorySchema);
