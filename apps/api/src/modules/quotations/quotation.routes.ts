import { Router } from 'express';
import { authenticate, requireAdmin, requirePermission } from '../../middleware/auth';
import * as c from './quotation.controller';

export const quotationRouter = Router();
quotationRouter.use(authenticate, requireAdmin);

quotationRouter.get('/', requirePermission('quotation.read'), c.list);
quotationRouter.post('/', requirePermission('quotation.write'), c.create);
quotationRouter.post('/from-quote-request', requirePermission('quotation.write'), c.createFromQuote);
quotationRouter.get('/:id', requirePermission('quotation.read'), c.get);
quotationRouter.get('/:id/pdf', requirePermission('quotation.read'), c.pdf);
quotationRouter.patch('/:id', requirePermission('quotation.write'), c.update);
quotationRouter.patch('/:id/status', requirePermission('quotation.write'), c.setStatus);
quotationRouter.post('/:id/convert', requirePermission('order.write'), c.convert);
