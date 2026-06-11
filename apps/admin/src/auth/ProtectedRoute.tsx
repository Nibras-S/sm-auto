import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { PermissionKey } from '@sm/shared';
import { useAuth } from './AuthContext';

/** Guards a route subtree: requires authentication, optionally a permission. */
export function ProtectedRoute({ permission }: { permission?: PermissionKey }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="grid h-screen place-items-center text-slate-400">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (permission && !user.permissions.includes(permission)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
