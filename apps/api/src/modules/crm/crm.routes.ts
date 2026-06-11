import { Router } from 'express';
import {
  authenticate,
  optionalAuth,
  requireAdmin,
  requireCustomer,
  requirePermission,
} from '../../middleware/auth';
import * as pub from './crm.public.controller';
import * as adm from './crm.admin.controller';

// ── public (storefront; optionalAuth links a logged-in customer) ──────────────
export const crmPublicRouter = Router();
crmPublicRouter.post('/inquiries/whatsapp', optionalAuth, pub.createWhatsappInquiry);
crmPublicRouter.post('/inquiries/contact', optionalAuth, pub.createContactInquiry);
crmPublicRouter.post('/leads', optionalAuth, pub.createLead);
crmPublicRouter.post('/quote-requests', optionalAuth, pub.createQuoteRequest);
crmPublicRouter.post('/orders', optionalAuth, pub.createOrder);
crmPublicRouter.get('/orders/:number', pub.lookupOrder);

const meRouter = Router();
meRouter.use(authenticate, requireCustomer);
meRouter.get('/orders', pub.myOrders);
meRouter.get('/inquiries', pub.myInquiries);
meRouter.get('/quote-requests', pub.myQuoteRequests);
crmPublicRouter.use('/me', meRouter);

// ── admin (CRM) ──────────────────────────────────────────────────────────────
export const crmAdminRouter = Router();
crmAdminRouter.use(authenticate, requireAdmin);

// Inquiries
crmAdminRouter.get('/inquiries', requirePermission('inquiry.read'), adm.listInquiries);
crmAdminRouter.get('/inquiries/:id', requirePermission('inquiry.read'), adm.getInquiry);
crmAdminRouter.patch('/inquiries/:id/status', requirePermission('inquiry.write'), adm.setInquiryStatus);
crmAdminRouter.patch('/inquiries/:id/notes', requirePermission('inquiry.write'), adm.setInquiryNotes);
crmAdminRouter.post('/inquiries/:id/convert', requirePermission('order.write'), adm.convertInquiry);

// Leads
crmAdminRouter.get('/leads', requirePermission('lead.read'), adm.listLeads);
crmAdminRouter.get('/leads/:id', requirePermission('lead.read'), adm.getLead);
crmAdminRouter.patch('/leads/:id/status', requirePermission('lead.write'), adm.setLeadStatus);
crmAdminRouter.patch('/leads/:id/notes', requirePermission('lead.write'), adm.setLeadNotes);
crmAdminRouter.post('/leads/:id/convert', requirePermission('order.write'), adm.convertLead);

// Quote requests
crmAdminRouter.get('/quote-requests', requirePermission('quote.read'), adm.listQuoteRequests);
crmAdminRouter.get('/quote-requests/:id', requirePermission('quote.read'), adm.getQuoteRequest);
crmAdminRouter.patch('/quote-requests/:id/status', requirePermission('quote.write'), adm.setQuoteStatus);
crmAdminRouter.patch('/quote-requests/:id/notes', requirePermission('quote.write'), adm.setQuoteNotes);
crmAdminRouter.post('/quote-requests/:id/convert', requirePermission('order.write'), adm.convertQuote);

// Orders
crmAdminRouter.get('/orders', requirePermission('order.read'), adm.listOrders);
crmAdminRouter.get('/orders/:id', requirePermission('order.read'), adm.getOrder);
crmAdminRouter.patch('/orders/:id/status', requirePermission('order.write'), adm.setOrderStatus);
crmAdminRouter.patch('/orders/:id', requirePermission('order.write'), adm.updateOrder);

// Customers
crmAdminRouter.get('/customers', requirePermission('customer.read'), adm.listCustomers);
crmAdminRouter.get('/customers/:id', requirePermission('customer.read'), adm.getCustomer);
