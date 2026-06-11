import { Banner } from '../../models/Banner';
import { Faq } from '../../models/Faq';
import { ContentPage } from '../../models/ContentPage';
import { AppError } from '../../utils/AppError';

// ── Banners ──────────────────────────────────────────────────────────────────
export const listBanners = (activeOnly = false) =>
  Banner.find(activeOnly ? { isActive: true } : {}).sort('placement displayOrder');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createBanner = (b: any) => Banner.create(b);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateBanner(id: string, b: any) {
  const d = await Banner.findById(id);
  if (!d) throw AppError.notFound('Banner not found');
  d.set(b);
  await d.save();
  return d;
}
export async function deleteBanner(id: string) {
  const d = await Banner.findByIdAndDelete(id);
  if (!d) throw AppError.notFound('Banner not found');
}

// ── FAQs ─────────────────────────────────────────────────────────────────────
export const listFaqs = (activeOnly = false) =>
  Faq.find(activeOnly ? { isActive: true } : {}).sort('displayOrder');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createFaq = (f: any) => Faq.create(f);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateFaq(id: string, f: any) {
  const d = await Faq.findById(id);
  if (!d) throw AppError.notFound('FAQ not found');
  d.set(f);
  await d.save();
  return d;
}
export async function deleteFaq(id: string) {
  const d = await Faq.findByIdAndDelete(id);
  if (!d) throw AppError.notFound('FAQ not found');
}

// ── Content pages ────────────────────────────────────────────────────────────
export const listContent = () => ContentPage.find().sort('slug');
export const getContent = (slug: string) => ContentPage.findOne({ slug: slug.toLowerCase() });
export async function upsertContent(slug: string, data: { title: string; body: string }) {
  return ContentPage.findOneAndUpdate(
    { slug: slug.toLowerCase() },
    { slug: slug.toLowerCase(), title: data.title, body: data.body },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
