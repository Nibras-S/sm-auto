import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatMoney } from '@sm/shared';
import * as crm from '../lib/crm';
import { Badge, Card, Input, PageHeader, Spinner } from '../components/ui';

const fmtDate = (s?: string) => (s ? new Date(s).toLocaleDateString() : '');

export function CustomersPage() {
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const listQ = useQuery({
    queryKey: ['customers', { q }],
    queryFn: () => crm.listCustomers({ q: q || undefined, limit: 50 }),
  });
  const detailQ = useQuery({
    queryKey: ['customer', selectedId],
    queryFn: () => crm.getCustomer(selectedId as string),
    enabled: Boolean(selectedId),
  });

  return (
    <div>
      <PageHeader title="Customers" />
      <p className="mb-4 text-sm text-slate-500">Registered accounts. Guest inquiries/orders appear in their own lists.</p>
      <div className="mb-4">
        <Input placeholder="Search name, email, phone…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_440px]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {listQ.isLoading ? (
            <Spinner />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listQ.data?.data.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`cursor-pointer hover:bg-slate-50 ${selectedId === c.id ? 'bg-brand-50' : ''}`}
                  >
                    <td className="px-4 py-2 font-medium text-slate-800">{c.name}</td>
                    <td className="px-4 py-2 text-slate-600">{c.email}</td>
                    <td className="px-4 py-2 text-slate-600">{c.phone ?? '—'}</td>
                  </tr>
                ))}
                {!listQ.data?.data.length && (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-slate-400">
                      No registered customers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div>
          {!selectedId ? (
            <Card>
              <p className="text-sm text-slate-400">Select a customer to see their history.</p>
            </Card>
          ) : detailQ.isLoading ? (
            <Spinner />
          ) : detailQ.data ? (
            <div className="space-y-4">
              <Card>
                <div className="font-semibold text-slate-800">{detailQ.data.customer.name}</div>
                <div className="mt-1 text-sm text-slate-600">{detailQ.data.customer.email}</div>
                {detailQ.data.customer.phone && (
                  <div className="text-sm text-slate-600">{detailQ.data.customer.phone}</div>
                )}
                <div className="mt-1 text-xs text-slate-400">Joined {fmtDate(detailQ.data.customer.createdAt)}</div>
              </Card>

              <Card>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Orders ({detailQ.data.orders.length})
                </h3>
                <div className="space-y-1 text-sm">
                  {detailQ.data.orders.map((o) => (
                    <div key={o.id} className="flex justify-between">
                      <span className="text-slate-700">{o.orderNumber}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-slate-500">{formatMoney(o.subtotal ?? null)}</span>
                        <Badge>{o.status}</Badge>
                      </span>
                    </div>
                  ))}
                  {!detailQ.data.orders.length && <p className="text-slate-400">No orders.</p>}
                </div>
              </Card>

              <Card>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Inquiries ({detailQ.data.inquiries.length})
                </h3>
                <div className="space-y-1 text-sm">
                  {detailQ.data.inquiries.map((i) => (
                    <div key={i.id} className="flex justify-between">
                      <span className="text-slate-700">{i.inquiryNumber}</span>
                      <Badge>{i.status}</Badge>
                    </div>
                  ))}
                  {!detailQ.data.inquiries.length && <p className="text-slate-400">No inquiries.</p>}
                </div>
              </Card>

              <Card>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quote requests ({detailQ.data.quoteRequests.length})
                </h3>
                <div className="space-y-1 text-sm">
                  {detailQ.data.quoteRequests.map((qr) => (
                    <div key={qr.id} className="flex justify-between">
                      <span className="text-slate-700">{qr.requestNumber}</span>
                      <Badge>{qr.status}</Badge>
                    </div>
                  ))}
                  {!detailQ.data.quoteRequests.length && <p className="text-slate-400">No quote requests.</p>}
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
