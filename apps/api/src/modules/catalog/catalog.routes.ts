import { Router } from 'express';
import { authenticate, requireAdmin, requirePermission } from '../../middleware/auth';
import * as product from './product.controller';
import * as tax from './taxonomy.controller';

// ── public (storefront) ──────────────────────────────────────────────────────
export const catalogPublicRouter = Router();
catalogPublicRouter.get('/products', product.publicList);
catalogPublicRouter.get('/products/:slug', product.publicDetail);
catalogPublicRouter.get('/products/:slug/related', product.publicRelated);
catalogPublicRouter.get('/search', product.publicSearch);
catalogPublicRouter.get('/categories', tax.publicCategories);
catalogPublicRouter.get('/categories/:slug', tax.publicCategoryDetail);
catalogPublicRouter.get('/brands', tax.publicBrands);
catalogPublicRouter.get('/subcategories', tax.publicSubcategories);
catalogPublicRouter.get('/filters', tax.publicFilters);

// ── admin ────────────────────────────────────────────────────────────────────
export const catalogAdminRouter = Router();
catalogAdminRouter.use(authenticate, requireAdmin);

// Products
catalogAdminRouter.get('/products', requirePermission('product.read'), product.adminList);
catalogAdminRouter.post('/products', requirePermission('product.write'), product.adminCreate);
catalogAdminRouter.get('/products/:id', requirePermission('product.read'), product.adminGet);
catalogAdminRouter.patch('/products/:id', requirePermission('product.write'), product.adminUpdate);
catalogAdminRouter.patch(
  '/products/:id/status',
  requirePermission('product.write'),
  product.adminSetStatus,
);
catalogAdminRouter.delete('/products/:id', requirePermission('product.delete'), product.adminDelete);
catalogAdminRouter.post(
  '/products/:id/images',
  requirePermission('product.write'),
  product.adminAddImage,
);
catalogAdminRouter.delete(
  '/products/:id/images',
  requirePermission('product.write'),
  product.adminRemoveImage,
);
catalogAdminRouter.patch(
  '/products/:id/images/reorder',
  requirePermission('product.write'),
  product.adminReorderImages,
);

// Categories
catalogAdminRouter.get('/categories', requirePermission('category.read'), tax.adminListCategories);
catalogAdminRouter.post('/categories', requirePermission('category.write'), tax.adminCreateCategory);
catalogAdminRouter.patch(
  '/categories/:id',
  requirePermission('category.write'),
  tax.adminUpdateCategory,
);
catalogAdminRouter.delete(
  '/categories/:id',
  requirePermission('category.write'),
  tax.adminDeleteCategory,
);

// Subcategories
catalogAdminRouter.get(
  '/subcategories',
  requirePermission('subcategory.read'),
  tax.adminListSubcategories,
);
catalogAdminRouter.post(
  '/subcategories',
  requirePermission('subcategory.write'),
  tax.adminCreateSubcategory,
);
catalogAdminRouter.patch(
  '/subcategories/:id',
  requirePermission('subcategory.write'),
  tax.adminUpdateSubcategory,
);
catalogAdminRouter.delete(
  '/subcategories/:id',
  requirePermission('subcategory.write'),
  tax.adminDeleteSubcategory,
);

// Brands
catalogAdminRouter.get('/brands', requirePermission('brand.read'), tax.adminListBrands);
catalogAdminRouter.post('/brands', requirePermission('brand.write'), tax.adminCreateBrand);
catalogAdminRouter.patch('/brands/:id', requirePermission('brand.write'), tax.adminUpdateBrand);
catalogAdminRouter.delete('/brands/:id', requirePermission('brand.write'), tax.adminDeleteBrand);
