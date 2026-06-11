import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Card, Input, PageHeader, Select, Spinner, Textarea } from './ui';

export interface Column {
  header: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (r: any) => ReactNode;
}

export interface CrmWorkspaceConfig {
  title: string;
  queryKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: (p: any) => Promise<{ data: any[]; meta: { total: number } }>;
  statuses: readonly string[];
  sources?: readonly string[];
  setStatus: (id: string, status: string) => Promise<unknown>;
  setNotes: (id: string, notes: string) => Promise<unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  convert?: (id: string) => Promise<any>;
  columns: Column[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  numberOf: (r: any) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  statusOf: (r: any) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notesOf: (r: any) => string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderDetail: (r: any) => ReactNode;
}

export function CrmWorkspace({ config }: { config: CrmWorkspaceConfig }) {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selected, setSelected] = useState<any | null>(null);
  const [notes, setNotes] = useState('');

  const listQ = useQuery({
    queryKey: [config.queryKey, { q, statusFilter, sourceFilter }],
    queryFn: () =>
      config.list({
        q: q || undefined,
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
        limit: 50,
      }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: [config.queryKey] });
  const statusM = useMutation({
    mutationFn: ({ id, s }: { id: string; s: string }) => config.setStatus(id, s),
    onSuccess: (r) => {
      invalidate();
      setSelected(r);
    },
  });
  const notesM = useMutation({
    mutationFn: ({ id, n }: { id: string; n: string }) => config.setNotes(id, n),
    onSuccess: (r) => {
      invalidate();
      setSelected(r);
    },
  });
  const convertM = useMutation({
    mutationFn: (id: string) => config.convert!(id),
    onSuccess: (o) => {
      invalidate();
      // eslint-disable-next-line no-alert
      alert(`Converted to order ${o.orderNumber}`);
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function select(r: any) {
    setSelected(r);
    setNotes(config.notesOf(r) ?? '');
  }

  return (
    <div>
      <PageHeader title={config.title} />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-[170px]">
          <option value="">All statuses</option>
          {config.statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        {config.sources && (
          <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="max-w-[180px]">
            <option value="">All sources</option>
            {config.sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_400px]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {listQ.isLoading ? (
            <Spinner />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  {config.columns.map((c) => (
                    <th key={c.header} className="px-4 py-3">
                      {c.header}
                    </th>
                  ))}
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listQ.data?.data.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => select(r)}
                    className={`cursor-pointer hover:bg-slate-50 ${selected?.id === r.id ? 'bg-brand-50' : ''}`}
                  >
                    {config.columns.map((c) => (
                      <td key={c.header} className="px-4 py-2 text-slate-700">
                        {c.render(r)}
                      </td>
                    ))}
                    <td className="px-4 py-2">
                      <Badge>{config.statusOf(r)}</Badge>
                    </td>
                  </tr>
                ))}
                {!listQ.data?.data.length && (
                  <tr>
                    <td colSpan={config.columns.length + 1} className="px-4 py-10 text-center text-slate-400">
                      Nothing here yet.
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
                  <div className="font-semibold text-slate-800">{config.numberOf(selected)}</div>
                  <Badge>{config.statusOf(selected)}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Select
                    value={config.statusOf(selected)}
                    onChange={(e) => statusM.mutate({ id: selected.id, s: e.target.value })}
                    className="max-w-[170px]"
                  >
                    {config.statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                  {config.convert && (
                    <Button
                      onClick={() => {
                        // eslint-disable-next-line no-alert
                        if (confirm('Convert this into a new order?')) convertM.mutate(selected.id);
                      }}
                    >
                      Convert to order
                    </Button>
                  )}
                </div>
              </Card>

              {config.renderDetail(selected)}

              <Card>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Internal notes</h3>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                <Button className="mt-2" variant="secondary" onClick={() => notesM.mutate({ id: selected.id, n: notes })}>
                  Save notes
                </Button>
              </Card>
            </div>
          ) : (
            <Card>
              <p className="text-sm text-slate-400">Select a record to view details.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
