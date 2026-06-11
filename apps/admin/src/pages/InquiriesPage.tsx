import { INQUIRY_SOURCES, INQUIRY_STATUSES } from '@sm/shared';
import { CrmWorkspace } from '../components/CrmWorkspace';
import { ContactBlock, ItemsTable, VehicleBlock } from '../components/crm';
import { Card } from '../components/ui';
import * as crm from '../lib/crm';

export function InquiriesPage() {
  return (
    <CrmWorkspace
      config={{
        title: 'Inquiries',
        queryKey: 'inquiries',
        list: crm.listInquiries,
        statuses: INQUIRY_STATUSES,
        sources: INQUIRY_SOURCES,
        setStatus: crm.setInquiryStatus,
        setNotes: crm.setInquiryNotes,
        convert: crm.convertInquiry,
        columns: [
          { header: 'Number', render: (r) => r.inquiryNumber },
          { header: 'Customer', render: (r) => r.contact.name },
          { header: 'Source', render: (r) => r.source },
        ],
        numberOf: (r) => r.inquiryNumber,
        statusOf: (r) => r.status,
        notesOf: (r) => r.internalNotes,
        renderDetail: (r) => (
          <>
            <ContactBlock contact={r.contact} emirate={r.emirate} />
            <VehicleBlock vehicle={r.vehicle} />
            <Card>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Requested items
              </h3>
              <ItemsTable items={r.items} />
              {r.message && <p className="mt-3 text-sm italic text-slate-600">“{r.message}”</p>}
            </Card>
          </>
        ),
      }}
    />
  );
}
