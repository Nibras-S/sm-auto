import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMoney } from '@sm/shared';
import { getDashboard } from '../lib/platform';
import { useAuth } from '../auth/AuthContext';
import { Badge, Card, Spinner } from '../components/ui';

const STATUS_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#06b6d4', '#16a34a', '#ef4444', '#f59e0b'];

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

  if (isLoading || !data) return <Spinner />;
  const t = data.totals;
  const statusData = Object.entries(data.orderStatus)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Welcome back, {user?.name}.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Revenue" value={formatMoney(data.revenue)} />
        <Kpi label="Total Orders" value={t.orders} />
        <Kpi label="Pending Orders" value={data.pendingOrders} />
        <Kpi label="Customers" value={t.customers} />
        <Kpi label="Products" value={t.products} />
        <Kpi label="Inquiries" value={t.inquiries} />
        <Kpi label="Leads" value={t.leads} />
        <Kpi label="Quote Requests" value={t.quoteRequests} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Orders — last 14 days</h2>
          {data.ordersByDay.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.ordersByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => String(d).slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#b91c1c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">No order data yet.</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Orders by status</h2>
          {statusData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">No orders yet.</p>
          )}
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Top products</h2>
          <div className="space-y-2 text-sm">
            {data.topProducts.map((p) => (
              <div key={p.name} className="flex justify-between">
                <span className="truncate text-slate-700">{p.name}</span>
                <span className="font-medium text-slate-500">×{p.count}</span>
              </div>
            ))}
            {!data.topProducts.length && <p className="text-slate-400">No sales yet.</p>}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Recent orders</h2>
          <div className="space-y-2 text-sm">
            {data.recentOrders.map((o) => (
              <div key={o.orderNumber} className="flex items-center justify-between">
                <span className="text-slate-700">{o.orderNumber}</span>
                <span className="flex items-center gap-2">
                  <span className="text-slate-500">{formatMoney(o.subtotal ?? null)}</span>
                  <Badge>{o.status}</Badge>
                </span>
              </div>
            ))}
            {!data.recentOrders.length && <p className="text-slate-400">No orders yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
