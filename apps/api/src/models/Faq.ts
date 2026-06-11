import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const faqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    category: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

faqSchema.index({ displayOrder: 1 });

export type FaqDoc = HydratedDocument<InferSchemaType<typeof faqSchema>>;
export const Faq = model('Faq', faqSchema);
