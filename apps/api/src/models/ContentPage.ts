import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const contentPageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: '' }, // markdown / HTML
  },
  { timestamps: true },
);

export type ContentPageDoc = HydratedDocument<InferSchemaType<typeof contentPageSchema>>;
export const ContentPage = model('ContentPage', contentPageSchema);
