import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';
import * as svc from './cms.service';
import {
  bannerCreateSchema,
  bannerUpdateSchema,
  contentUpsertSchema,
  faqCreateSchema,
  faqUpdateSchema,
} from './cms.validation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toBanner = (b: any) => ({
  id: b.id,
  title: b.title ?? undefined,
  subtitle: b.subtitle ?? undefined,
  image: b.image ? { publicId: b.image.publicId ?? null, url: b.image.url } : null,
  link: b.link ?? undefined,
  placement: b.placement,
  displayOrder: b.displayOrder,
  isActive: b.isActive,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toFaq = (f: any) => ({
  id: f.id,
  question: f.question,
  answer: f.answer,
  category: f.category ?? undefined,
  displayOrder: f.displayOrder,
  isActive: f.isActive,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toContent = (c: any) => ({
  slug: c.slug,
  title: c.title,
  body: c.body ?? '',
  updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : undefined,
});

// ── public ───────────────────────────────────────────────────────────────────
export const publicBanners = asyncHandler(async (_req, res) => {
  res.json({ banners: (await svc.listBanners(true)).map(toBanner) });
});
export const publicFaqs = asyncHandler(async (_req, res) => {
  res.json({ faqs: (await svc.listFaqs(true)).map(toFaq) });
});
export const publicContent = asyncHandler(async (req, res) => {
  const c = await svc.getContent(req.params.slug);
  if (!c) throw AppError.notFound('Page not found');
  res.json({ page: toContent(c) });
});

// ── admin: banners ───────────────────────────────────────────────────────────
export const adminListBanners = asyncHandler(async (_req, res) => {
  res.json({ banners: (await svc.listBanners(false)).map(toBanner) });
});
export const adminCreateBanner = asyncHandler(async (req, res) => {
  const b = bannerCreateSchema.parse(req.body);
  res.status(201).json({ banner: toBanner(await svc.createBanner(b)) });
});
export const adminUpdateBanner = asyncHandler(async (req, res) => {
  const b = bannerUpdateSchema.parse(req.body);
  res.json({ banner: toBanner(await svc.updateBanner(req.params.id, b)) });
});
export const adminDeleteBanner = asyncHandler(async (req, res) => {
  await svc.deleteBanner(req.params.id);
  res.status(204).send();
});

// ── admin: faqs ──────────────────────────────────────────────────────────────
export const adminListFaqs = asyncHandler(async (_req, res) => {
  res.json({ faqs: (await svc.listFaqs(false)).map(toFaq) });
});
export const adminCreateFaq = asyncHandler(async (req, res) => {
  const f = faqCreateSchema.parse(req.body);
  res.status(201).json({ faq: toFaq(await svc.createFaq(f)) });
});
export const adminUpdateFaq = asyncHandler(async (req, res) => {
  const f = faqUpdateSchema.parse(req.body);
  res.json({ faq: toFaq(await svc.updateFaq(req.params.id, f)) });
});
export const adminDeleteFaq = asyncHandler(async (req, res) => {
  await svc.deleteFaq(req.params.id);
  res.status(204).send();
});

// ── admin: content pages ─────────────────────────────────────────────────────
export const adminListContent = asyncHandler(async (_req, res) => {
  res.json({ pages: (await svc.listContent()).map(toContent) });
});
export const adminGetContent = asyncHandler(async (req, res) => {
  const c = await svc.getContent(req.params.slug);
  res.json({ page: c ? toContent(c) : { slug: req.params.slug, title: '', body: '' } });
});
export const adminUpsertContent = asyncHandler(async (req, res) => {
  const d = contentUpsertSchema.parse(req.body);
  res.json({ page: toContent(await svc.upsertContent(req.params.slug, d)) });
});
