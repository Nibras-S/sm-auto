import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listNotifications, markAllNotifRead, markNotifRead } from '../lib/platform';

export function NotificationBell() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
    refetchInterval: 30_000,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['notifications'] });
  const readOne = useMutation({ mutationFn: markNotifRead, onSuccess: invalidate });
  const readAll = useMutation({ mutationFn: markAllNotifRead, onSuccess: invalidate });

  const unread = data?.unread ?? 0;
  const items = data?.notifications ?? [];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
              <span className="text-sm font-semibold text-slate-700">Notifications</span>
              {unread > 0 && (
                <button onClick={() => readAll.mutate()} className="text-xs text-brand-700 hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-auto">
              {items.length ? (
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (!n.read) readOne.mutate(n.id);
                      setOpen(false);
                      if (n.link) navigate(n.link);
                    }}
                    className={`block w-full border-b border-slate-50 px-4 py-2.5 text-left hover:bg-slate-50 ${
                      n.read ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-slate-800">{n.title}</div>
                    {n.message && <div className="text-xs text-slate-500">{n.message}</div>}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-slate-400">No notifications.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
