import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { cloudImageSchema } from './_schemas';

const bannerSchema = new Schema(
  {
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    image: { type: cloudImageSchema, default: null },
    link: { type: String, trim: true },
    placement: { type: String, default: 'home-hero' },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

bannerSchema.index({ placement: 1, displayOrder: 1 });

export type BannerDoc = HydratedDocument<InferSchemaType<typeof bannerSchema>>;
export const Banner = model('Banner', bannerSchema);
