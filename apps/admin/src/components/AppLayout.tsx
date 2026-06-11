import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { NAV_ITEMS } from '../config/nav';
import { NotificationBell } from './NotificationBell';

export function AppLayout() {
  const { user, logout } = useAuth();
  const items = NAV_ITEMS.filter(
    (item) => !item.permission || (user?.permissions.includes(item.permission) ?? false),
  );

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col bg-slate-900 text-slate-300">
        <div className="px-5 py-4 text-lg font-bold tracking-tight text-white">
          Spare<span className="text-brand-600">Mec</span>
          <span className="ml-1 align-top text-[10px] font-medium uppercase text-slate-500">CRM</span>
        </div>
        <nav className="flex-1 space-y-0.5 px-2 py-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-brand-700 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="text-sm text-slate-500">Spare Mec — Admin Panel</div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="text-right text-sm">
              <div className="font-medium text-slate-800">{user?.name}</div>
              <div className="text-xs text-slate-500">{user?.role}</div>
            </div>
            <button
              onClick={() => void logout()}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
