import type { ProductStatus } from '@sm/shared';
import { asyncHandler } from '../../utils/asyncHandler';
import { boolParam, numParam, pageMeta } from '../../utils/pagination';
import * as svc from './product.service';
import { toProductDTO } from './serializers';
import {
  imageAddSchema,
  imageReorderSchema,
  productCreateSchema,
  productUpdateSchema,
  statusSchema,
} from './catalog.validation';

const str = (v: unknown) => (typeof v === 'string' && v.length ? v : undefined);

// ── public ───────────────────────────────────────────────────────────────────
export const publicList = asyncHandler(async (req, res) => {
  const r = await svc.listPublic({
    categorySlug: str(req.query.category),
    brandSlug: str(req.query.brand),
    subcategory: str(req.query.subcategory),
    make: str(req.query.make),
    model: str(req.query.model),
    availability: str(req.query.availability),
    featured: boolParam(req.query.featured),
    page: numParam(req.query.page),
    limit: numParam(req.query.limit),
    sort: str(req.query.sort),
  });
  res.json({ data: r.data.map(toProductDTO), meta: pageMeta(r.total, r.page, r.limit) });
});

export const publicDetail = asyncHandler(async (req, res) => {
  const p = await svc.getBySlugPublic(req.params.slug);
  res.json({ product: toProductDTO(p) });
});

export const publicRelated = asyncHandler(async (req, res) => {
  const items = await svc.relatedPublic(req.params.slug);
  res.json({ related: items.map(toProductDTO) });
});

export const publicSearch = asyncHandler(async (req, res) => {
  const q = str(req.query.q)?.trim();
  if (!q) {
    res.json({ data: [], meta: { count: 0, query: '' } });
    return;
  }
  const items = await svc.searchPublic(q, numParam(req.query.page) ?? 1, numParam(req.query.limit) ?? 24);
  res.json({ data: items.map(toProductDTO), meta: { count: items.length, query: q } });
});

// ── admin ────────────────────────────────────────────────────────────────────
export const adminList = asyncHandler(async (req, res) => {
  const r = await svc.listAdmin({
    q: str(req.query.q),
    status: str(req.query.status),
    category: str(req.query.category),
    brand: str(req.query.brand),
    page: numParam(req.query.page),
    limit: numParam(req.query.limit),
    sort: str(req.query.sort),
  });
  res.json({ data: r.data.map(toProductDTO), meta: pageMeta(r.total, r.page, r.limit) });
});

export const adminGet = asyncHandler(async (req, res) => {
  res.json({ product: toProductDTO(await svc.getById(req.params.id)) });
});

export const adminCreate = asyncHandler(async (req, res) => {
  const input = productCreateSchema.parse(req.body);
  const p = await svc.createProduct(input);
  res.status(201).json({ product: toProductDTO(p) });
});

export const adminUpdate = asyncHandler(async (req, res) => {
  const input = productUpdateSchema.parse(req.body);
  const p = await svc.updateProduct(req.params.id, input);
  res.json({ product: toProductDTO(p) });
});

export const adminSetStatus = asyncHandler(async (req, res) => {
  const { status } = statusSchema.parse(req.body);
  const p = await svc.setStatus(req.params.id, status as ProductStatus);
  res.json({ product: toProductDTO(p) });
});

export const adminDelete = asyncHandler(async (req, res) => {
  await svc.deleteProduct(req.params.id);
  res.status(204).send();
});

export const adminAddImage = asyncHandler(async (req, res) => {
  const img = imageAddSchema.parse(req.body);
  const p = await svc.addImage(req.params.id, img);
  res.status(201).json({ product: toProductDTO(p) });
});

export const adminRemoveImage = asyncHandler(async (req, res) => {
  const key = str(req.query.key);
  if (!key) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'key query param is required' } });
    return;
  }
  const p = await svc.removeImage(req.params.id, key);
  res.json({ product: toProductDTO(p) });
});

export const adminReorderImages = asyncHandler(async (req, res) => {
  const { order } = imageReorderSchema.parse(req.body);
  const p = await svc.reorderImages(req.params.id, order);
  res.json({ product: toProductDTO(p) });
});
