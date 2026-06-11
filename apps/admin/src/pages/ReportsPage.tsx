import { useState } from 'react';
import { fromFils } from '@sm/shared';
import * as crm from '../lib/crm';
import { Button, Card, PageHeader } from '../components/ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCSV(rows: any[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
}
function download(name: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const [busy, setBusy] = useState('');

  async function run(kind: 'orders' | 'inquiries' | 'customers') {
    setBusy(kind);
    try {
      if (kind === 'orders') {
        const r = await crm.listOrders({ limit: 1000 });
        download(
          'orders.csv',
          toCSV(
            r.data.map((o) => ({
              orderNumber: o.orderNumber,
              status: o.status,
              customer: o.contact.name,
              phone: o.contact.phone ?? '',
              email: o.contact.email ?? '',
              items: o.items.length,
              subtotalAED: o.subtotal != null ? fromFils(o.subtotal) : '',
              createdAt: o.createdAt ?? '',
            })),
          ),
        );
      } else if (kind === 'inquiries') {
        const r = await crm.listInquiries({ limit: 1000 });
        download(
          'inquiries.csv',
          toCSV(
            r.data.map((i) => ({
              inquiryNumber: i.inquiryNumber,
              source: i.source,
              status: i.status,
              customer: i.contact.name,
              phone: i.contact.phone ?? '',
              items: i.items.length,
              createdAt: i.createdAt ?? '',
            })),
          ),
        );
      } else {
        const r = await crm.listCustomers({ limit: 1000 });
        download('customers.csv', toCSV(r.data.map((c) => ({ name: c.name, email: c.email, phone: c.phone ?? '', createdAt: c.createdAt ?? '' }))));
      }
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Reports" />
      <Card>
        <p className="text-sm text-slate-600">Export CRM data as CSV.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => run('orders')} disabled={busy === 'orders'}>Export Orders</Button>
          <Button onClick={() => run('inquiries')} disabled={busy === 'inquiries'}>Export Inquiries</Button>
          <Button onClick={() => run('customers')} disabled={busy === 'customers'}>Export Customers</Button>
        </div>
      </Card>
    </div>
  );
}
