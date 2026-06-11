import { INQUIRY_STATUSES } from '@sm/shared';
import { CrmWorkspace } from '../components/CrmWorkspace';
import { ContactBlock, ItemsTable, VehicleBlock } from '../components/crm';
import { Card } from '../components/ui';
import * as crm from '../lib/crm';

export function QuoteRequestsPage() {
  return (
    <CrmWorkspace
      config={{
        title: 'Quote Requests',
        queryKey: 'quote-requests',
        list: crm.listQuoteRequests,
        statuses: INQUIRY_STATUSES,
        setStatus: crm.setQuoteStatus,
        setNotes: crm.setQuoteNotes,
        convert: crm.convertQuote,
        columns: [
          { header: 'Number', render: (r) => r.requestNumber },
          { header: 'Customer', render: (r) => r.contact.name },
          { header: 'Phone', render: (r) => r.contact.phone ?? '—' },
        ],
        numberOf: (r) => r.requestNumber,
        statusOf: (r) => r.status,
        notesOf: (r) => r.internalNotes,
        renderDetail: (r) => (
          <>
            <ContactBlock contact={r.contact} />
            <VehicleBlock vehicle={r.vehicle} />
            <Card>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Items</h3>
              <ItemsTable items={r.items} />
              {r.notes && <p className="mt-3 text-sm italic text-slate-600">“{r.notes}”</p>}
              {r.convertedOrderId && (
                <p className="mt-3 text-xs text-green-700">✓ Converted to an order</p>
              )}
            </Card>
          </>
        ),
      }}
    />
  );
}
