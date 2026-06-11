import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatMoney, fromFils, toFils, QUOTATION_STATUSES, type QuotationDTO } from '@sm/shared';
import * as p from '../lib/platform';
import { Badge, Button, Card, Field, Input, PageHeader, Pager, Select, Spinner } from '../components/ui';

interface ItemDraft {
  name: string;
  partNumber: string;
  quantity: string;
  priceAed: string;
}
interface Draft {
  id?: string;
  contactName: string;
  contactPhone: string;
  validUntil: string;
  notes: string;
  items: ItemDraft[];
}
const emptyItem: ItemDraft = { name: '', partNumber: '', quantity: '1', priceAed: '' };
const blank: Draft = { contactName: '', contactPhone: '', validUntil: '', notes: '', items: [{ ...emptyItem }] };

export function QuotationsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<Draft | null>(null);
  const LIMIT = 20;
  const { data, isLoading } = useQuery({
    queryKey: ['quotations', { status, page }],
    queryFn: () => p.listQuotations({ status: status || undefined, page, limit: LIMIT }),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['quotations'] });

  const save = useMutation({
    mutationFn: (d: Draft) => {
      const body = {
        contact: { name: d.contactName, phone: d.contactPhone || undefined },
        items: d.items
          .filter((i) => i.name)
          .map((i) => ({
            name: i.name,
            partNumber: i.partNumber || undefined,
            quantity: Number(i.quantity) || 1,
            unitPrice: toFils(Number(i.priceAed) || 0),
          })),
        notes: d.notes || undefined,
        validUntil: d.validUntil || undefined,
      };
      return d.id ? p.updateQuotation(d.id, body) : p.createQuotation(body);
    },
    onSuccess: () => { invalidate(); setDraft(null); },
  });
  const changeStatus = useMutation({ mutationFn: ({ id, s }: { id: string; s: string }) => p.setQuotationStatus(id, s), onSuccess: invalidate });
  const convert = useMutation({
    mutationFn: p.convertQuotation,
    onSuccess: (o) => { invalidate(); alert(`Converted to order ${o.orderNumber}`); },
  });

  const edit = (q: QuotationDTO) =>
    setDraft({
      id: q.id,
      contactName: q.contact.name,
      contactPhone: q.contact.phone ?? '',
      validUntil: q.validUntil ? q.validUntil.slice(0, 10) : '',
      notes: q.notes ?? '',
      items: q.items.length
        ? q.items.map((i) => ({ name: i.name, partNumber: i.partNumber ?? '', quantity: String(i.quantity), priceAed: String(fromFils(i.unitPrice)) }))
        : [{ ...emptyItem }],
    });

  const setItem = (idx: number, key: keyof ItemDraft, val: string) =>
    setDraft((d) => (d ? { ...d, items: d.items.map((it, i) => (i === idx ? { ...it, [key]: val } : it)) } : d));

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Quotations"
        action={<Button onClick={() => setDraft({ ...blank, items: [{ ...emptyItem }] })}>+ New quotation</Button>}
      />

      {draft && (
        <Card className="mb-5">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Customer name *"><Input value={draft.contactName} onChange={(e) => setDraft({ ...draft, contactName: e.target.value })} /></Field>
            <Field label="Phone"><Input value={draft.contactPhone} onChange={(e) => setDraft({ ...draft, contactPhone: e.target.value })} /></Field>
            <Field label="Valid until"><Input type="date" value={draft.validUntil} onChange={(e) => setDraft({ ...draft, validUntil: e.target.value })} /></Field>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Items</span>
              <Button variant="secondary" onClick={() => setDraft({ ...draft, items: [...draft.items, { ...emptyItem }] })}>+ Add item</Button>
            </div>
            {draft.items.map((it, i) => (
              <div key={i} className="mb-2 grid grid-cols-12 gap-2">
                <Input className="col-span-5" placeholder="Item name" value={it.name} onChange={(e) => setItem(i, 'name', e.target.value)} />
                <Input className="col-span-3" placeholder="Part #" value={it.partNumber} onChange={(e) => setItem(i, 'partNumber', e.target.value)} />
                <Input className="col-span-1" placeholder="Qty" value={it.quantity} onChange={(e) => setItem(i, 'quantity', e.target.value)} />
                <Input className="col-span-2" placeholder="Unit (AED)" value={it.priceAed} onChange={(e) => setItem(i, 'priceAed', e.target.value)} />
                <button className="col-span-1 text-red-600" onClick={() => setDraft({ ...draft, items: draft.items.filter((_, idx) => idx !== i) })}>✕</button>
              </div>
            ))}
          </div>
          <Field label="Notes"><Input value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></Field>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => save.mutate(draft)} disabled={!draft.contactName || save.isPending}>Save</Button>
            <Button variant="secondary" onClick={() => setDraft(null)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="mb-4">
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="max-w-[180px]">
          <option value="">All statuses</option>
          {QUOTATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Number</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.data.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-800">{q.quotationNumber}</td>
                  <td className="px-4 py-2 text-slate-700">{q.contact.name}</td>
                  <td className="px-4 py-2 text-slate-700">{formatMoney(q.subtotal)}</td>
                  <td className="px-4 py-2">
                    <Select value={q.status} onChange={(e) => changeStatus.mutate({ id: q.id, s: e.target.value })} className="!w-auto !py-1 text-xs">
                      {QUOTATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" className="!py-1 text-xs" onClick={() => edit(q)}>Edit</Button>
                      <Button variant="secondary" className="!py-1 text-xs" onClick={() => p.openQuotationPdf(q.id)}>PDF</Button>
                      <Button className="!py-1 text-xs" onClick={() => confirm('Convert to order?') && convert.mutate(q.id)}>Convert</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!data?.data.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No quotations yet.</td></tr>}
            </tbody>
          </table>
          {data && (
            <div className="px-4 pb-3">
              <Pager page={page} total={data.meta.total} limit={LIMIT} onChange={setPage} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
