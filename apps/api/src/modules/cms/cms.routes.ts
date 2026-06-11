import { Router } from 'express';
import { authenticate, requireAdmin, requirePermission } from '../../middleware/auth';
import * as c from './cms.controller';

export const cmsPublicRouter = Router();
cmsPublicRouter.get('/banners', c.publicBanners);
cmsPublicRouter.get('/faqs', c.publicFaqs);
cmsPublicRouter.get('/content/:slug', c.publicContent);

export const cmsAdminRouter = Router();
cmsAdminRouter.use(authenticate, requireAdmin);

cmsAdminRouter.get('/banners', requirePermission('banner.read'), c.adminListBanners);
cmsAdminRouter.post('/banners', requirePermission('banner.write'), c.adminCreateBanner);
cmsAdminRouter.patch('/banners/:id', requirePermission('banner.write'), c.adminUpdateBanner);
cmsAdminRouter.delete('/banners/:id', requirePermission('banner.write'), c.adminDeleteBanner);

cmsAdminRouter.get('/faqs', requirePermission('faq.read'), c.adminListFaqs);
cmsAdminRouter.post('/faqs', requirePermission('faq.write'), c.adminCreateFaq);
cmsAdminRouter.patch('/faqs/:id', requirePermission('faq.write'), c.adminUpdateFaq);
cmsAdminRouter.delete('/faqs/:id', requirePermission('faq.write'), c.adminDeleteFaq);

cmsAdminRouter.get('/content', requirePermission('content.read'), c.adminListContent);
cmsAdminRouter.get('/content/:slug', requirePermission('content.read'), c.adminGetContent);
cmsAdminRouter.put('/content/:slug', requirePermission('content.write'), c.adminUpsertContent);
