import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { cloudImageSchema } from './_schemas';

const brandSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // A brand can be a part brand and/or a vehicle make.
    kind: { type: [String], enum: ['part', 'vehicle'], default: ['vehicle'] },
    logo: { type: cloudImageSchema, default: null },
    country: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

brandSchema.index({ name: 1 });

export type BrandSchemaType = InferSchemaType<typeof brandSchema>;
export type BrandDoc = HydratedDocument<BrandSchemaType>;
export const Brand = model('Brand', brandSchema);
