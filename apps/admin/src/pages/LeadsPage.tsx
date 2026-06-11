import { LEAD_STATUSES } from '@sm/shared';
import { CrmWorkspace } from '../components/CrmWorkspace';
import { Card } from '../components/ui';
import * as crm from '../lib/crm';

export function LeadsPage() {
  return (
    <CrmWorkspace
      config={{
        title: 'Leads',
        queryKey: 'leads',
        list: crm.listLeads,
        statuses: LEAD_STATUSES,
        setStatus: crm.setLeadStatus,
        setNotes: crm.setLeadNotes,
        convert: crm.convertLead,
        columns: [
          { header: 'Number', render: (r) => r.leadNumber },
          { header: 'Name', render: (r) => r.name },
          { header: 'Phone', render: (r) => r.phone ?? '—' },
        ],
        numberOf: (r) => r.leadNumber,
        statusOf: (r) => r.status,
        notesOf: (r) => r.internalNotes,
        renderDetail: (r) => (
          <Card>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Lead details</h3>
            <div className="space-y-1 text-sm text-slate-700">
              <div className="font-medium text-slate-800">{r.name}</div>
              {r.phone && <div>📞 {r.phone}</div>}
              <div>
                Vehicle: {[r.vehicleBrand, r.vehicleModel, r.vehicleYear].filter(Boolean).join(' ') || '—'}
              </div>
              <div>Required part: {r.requiredPart ?? '—'}</div>
              {r.notes && <p className="mt-2 italic text-slate-600">“{r.notes}”</p>}
              <div className="pt-1 text-xs text-slate-400">Source: {r.source}</div>
            </div>
          </Card>
        ),
      }}
    />
  );
}
