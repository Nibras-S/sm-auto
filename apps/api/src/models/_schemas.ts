import { Schema } from 'mongoose';

/** Reusable Cloudinary image sub-schema (publicId null for legacy/external URLs). */
export const cloudImageSchema = new Schema(
  {
    publicId: { type: String, default: null },
    url: { type: String, required: true },
    alt: { type: String },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false },
);

export const specSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
);

/** Denormalized vehicle fitment row (no separate vehicle collections). */
export const fitmentSchema = new Schema(
  {
    make: { type: String, required: true, trim: true },
    model: { type: String, trim: true },
    generation: { type: String, trim: true },
    yearStart: { type: Number },
    yearEnd: { type: Number },
    engineType: { type: String, trim: true },
  },
  { _id: false },
);
