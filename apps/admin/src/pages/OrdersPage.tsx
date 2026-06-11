import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatMoney, ORDER_STATUSES, type OrderDTO } from '@sm/shared';
import * as crm from '../lib/crm';
import { Badge, Button, Card, Input, PageHeader, Select, Spinner, Textarea } from '../components/ui';
import { ContactBlock, ItemsTable, VehicleBlock } from '../components/crm';

const fmtDate = (s?: string) => (s ? new Date(s).toLocaleString() : '');

export function OrdersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<OrderDTO | null>(null);
  const [statusDraft, setStatusDraft] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [notes, setNotes] = useState('');

  const listQ = useQuery({
    queryKey: ['orders', { q, statusFilter }],
    queryFn: () => crm.listOrders({ q: q || undefined, status: statusFilter || undefined, limit: 50 }),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['orders'] });

  function select(o: OrderDTO) {
    setSelected(o);
    setStatusDraft(o.status);
    setNotes(o.internalNotes ?? '');
    setStatusNote('');
  }

  const statusM = useMutation({
    mutationFn: () => crm.setOrderStatus(selected!.id, statusDraft, statusNote || undefined),
    onSuccess: (o) => {
      invalidate();
      select(o);
    },
  });
  const notesM = useMutation({
    mutationFn: () => crm.updateOrder(selected!.id, { internalNotes: notes }),
    onSuccess: (o) => {
      invalidate();
      select(o);
    },
  });

  return (
    <div>
      <PageHeader title="Orders" />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Search order #, customer…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-[190px]">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_420px]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {listQ.isLoading ? (
            <Spinner />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listQ.data?.data.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => select(o)}
                    className={`cursor-pointer hover:bg-slate-50 ${selected?.id === o.id ? 'bg-brand-50' : ''}`}
                  >
                    <td className="px-4 py-2 font-medium text-slate-800">{o.orderNumber}</td>
                    <td className="px-4 py-2 text-slate-700">{o.contact.name}</td>
                    <td className="px-4 py-2 text-slate-700">{formatMoney(o.subtotal ?? null)}</td>
                    <td className="px-4 py-2">
                      <Badge>{o.status}</Badge>
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-400">{fmtDate(o.createdAt)}</td>
                  </tr>
                ))}
                {!listQ.data?.data.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div>
          {selected ? (
            <div className="space-y-4">
              <Card>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-800">{selected.orderNumber}</div>
                  <Badge>{selected.status}</Badge>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <Select value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)}>
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                    <Button onClick={() => statusM.mutate()} disabled={statusM.isPending}>
                      Update
                    </Button>
                  </div>
                  <Input
                    placeholder="Status note (optional)"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>
              </Card>

              <ContactBlock contact={selected.contact} />
              {selected.shippingAddress && (selected.shippingAddress.line1 || selected.shippingAddress.city) && (
                <Card>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Shipping</h3>
                  <div className="text-sm text-slate-700">
                    {[
                      selected.shippingAddress.line1,
                      selected.shippingAddress.line2,
                      selected.shippingAddress.area,
                      selected.shippingAddress.city,
                      selected.shippingAddress.emirate,
                      selected.shippingAddress.country,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                </Card>
              )}
              <VehicleBlock vehicle={selected.vehicle} />

              <Card>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Items</h3>
                <ItemsTable items={selected.items} showPrice />
                <div className="mt-3 flex justify-between border-t border-slate-100 pt-2 text-sm font-semibold">
                  <span>Subtotal</span>
                  <span>{formatMoney(selected.subtotal ?? null)}</span>
                </div>
                {selected.customerNotes && (
                  <p className="mt-3 text-sm italic text-slate-600">Customer note: “{selected.customerNotes}”</p>
                )}
              </Card>

              <Card>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Internal notes</h3>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                <Button className="mt-2" variant="secondary" onClick={() => notesM.mutate()}>
                  Save notes
                </Button>
              </Card>

              <Card>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">History</h3>
                <ol className="space-y-1 text-sm">
                  {selected.statusHistory.map((e, i) => (
                    <li key={i} className="flex justify-between gap-3">
                      <span className="text-slate-700">
                        {e.status}
                        {e.note ? ` — ${e.note}` : ''}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">{fmtDate(e.at)}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
          ) : (
            <Card>
              <p className="text-sm text-slate-400">Select an order to manage it.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
