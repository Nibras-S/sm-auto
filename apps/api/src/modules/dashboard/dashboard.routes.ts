import { Router } from 'express';
import { ORDER_STATUSES, OrderStatus } from '@sm/shared';
import { authenticate, requireAdmin, requirePermission } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { Product } from '../../models/Product';
import { Category } from '../../models/Category';
import { Brand } from '../../models/Brand';
import { Customer } from '../../models/Customer';
import { Order } from '../../models/Order';
import { Inquiry } from '../../models/Inquiry';
import { Lead } from '../../models/Lead';
import { QuoteRequest } from '../../models/QuoteRequest';
import { Quotation } from '../../models/Quotation';

async function getDashboard() {
  const [products, categories, brands, customers, orders, inquiries, leads, quoteRequests, quotations] =
    await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Brand.countDocuments(),
      Customer.countDocuments(),
      Order.countDocuments(),
      Inquiry.countDocuments(),
      Lead.countDocuments(),
      QuoteRequest.countDocuments(),
      Quotation.countDocuments(),
    ]);

  const statusAgg = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const orderStatus: Record<string, number> = {};
  for (const s of ORDER_STATUSES) orderStatus[s] = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  statusAgg.forEach((r: any) => {
    orderStatus[r._id] = r.count;
  });

  const revAgg = await Order.aggregate([
    {
      $match: {
        status: {
          $in: [
            OrderStatus.Confirmed,
            OrderStatus.Processing,
            OrderStatus.Shipped,
            OrderStatus.Delivered,
          ],
        },
        subtotal: { $ne: null },
      },
    },
    { $group: { _id: null, total: { $sum: '$subtotal' } } },
  ]);
  const revenue = revAgg[0]?.total ?? 0;

  const recent = await Order.find().sort('-createdAt').limit(8);
  const recentOrders = recent.map((o) => ({
    orderNumber: o.orderNumber,
    status: o.status,
    subtotal: o.subtotal ?? null,
    contactName: o.contact?.name ?? '',
    createdAt: (o as unknown as { createdAt?: Date }).createdAt?.toISOString(),
  }));

  const since = new Date(Date.now() - 14 * 24 * 3600 * 1000);
  const byDayAgg = await Order.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ordersByDay = byDayAgg.map((r: any) => ({ date: r._id, count: r.count }));

  const topAgg = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.name', count: { $sum: '$items.quantity' } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topProducts = topAgg.map((r: any) => ({ name: r._id, count: r.count }));

  return {
    totals: { products, categories, brands, customers, orders, inquiries, leads, quoteRequests, quotations },
    orderStatus,
    revenue,
    pendingOrders: orderStatus[OrderStatus.PendingVerification] ?? 0,
    recentOrders,
    ordersByDay,
    topProducts,
  };
}

export const dashboardRouter = Router();
dashboardRouter.use(authenticate, requireAdmin);
dashboardRouter.get(
  '/',
  requirePermission('dashboard.read'),
  asyncHandler(async (_req, res) => {
    res.json(await getDashboard());
  }),
);
