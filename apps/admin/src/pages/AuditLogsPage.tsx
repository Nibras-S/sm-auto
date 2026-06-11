import { useQuery } from '@tanstack/react-query';
import { listAuditLogs } from '../lib/platform';
import { Card, PageHeader, Spinner } from '../components/ui';

const fmt = (s?: string) => (s ? new Date(s).toLocaleString() : '');

export function AuditLogsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['audit-logs'], queryFn: listAuditLogs });
  return (
    <div>
      <PageHeader title="Audit Logs" />
      <p className="mb-4 text-sm text-slate-500">Recent admin write actions (latest 100).</p>
      {isLoading ? (
        <Spinner />
      ) : (
        <Card className="!p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 text-xs text-slate-400">{fmt(l.createdAt)}</td>
                  <td className="px-4 py-2 text-slate-700">{l.actorName}</td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-600">{l.action}</td>
                  <td className="px-4 py-2 text-slate-500">{l.status}</td>
                </tr>
              ))}
              {!data?.length && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No audit entries yet.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
