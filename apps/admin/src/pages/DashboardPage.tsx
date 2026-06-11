import { useAuth } from '../auth/AuthContext';

const KPIS = [
  'Total Products',
  'Total Orders',
  'Total Customers',
  'Total Leads',
  'Quote Requests',
  'Total Revenue',
  'Pending Orders',
  'Delivered Orders',
];

export function DashboardPage() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Welcome back, {user?.name}. Live KPIs and charts are wired in Block D.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {KPIS.map((label) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
            <div className="mt-2 text-2xl font-bold text-slate-300">—</div>
          </div>
        ))}
      </div>
    </div>
  );
}
