import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminRole, type AdminUserDTO } from '@sm/shared';
import * as p from '../lib/platform';
import { Badge, Button, Card, Field, Input, PageHeader, Select, Spinner } from '../components/ui';

interface Draft {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  isActive: boolean;
  perms: Set<string>;
}

export function UsersPage() {
  const qc = useQueryClient();
  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: p.listUsers });
  const { data: meta } = useQuery({ queryKey: ['perm-meta'], queryFn: p.getPermissionsMeta });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ['users'] });

  const roleDefaults = (role: string) => new Set(meta?.rolePermissions?.[role] ?? []);

  function overrides(d: Draft) {
    if (d.role === AdminRole.SuperAdmin) return [];
    const def = roleDefaults(d.role);
    const ov: string[] = [];
    for (const perm of meta?.permissions ?? []) {
      const has = d.perms.has(perm);
      const inDef = def.has(perm);
      if (has && !inDef) ov.push(`+${perm}`);
      if (!has && inDef) ov.push(`-${perm}`);
    }
    return ov;
  }

  const save = useMutation({
    mutationFn: (d: Draft) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any = { name: d.name, role: d.role, phone: d.phone || undefined, isActive: d.isActive, permissionOverrides: overrides(d) };
      if (d.password) body.password = d.password;
      if (d.id) return p.updateUser(d.id, body);
      return p.createUser({ ...body, email: d.email, password: d.password });
    },
    onSuccess: () => { invalidate(); setDraft(null); },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (e: any) => setError(e?.response?.data?.error?.message ?? 'Save failed'),
  });
  const del = useMutation({
    mutationFn: p.deleteUser,
    onSuccess: invalidate,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (e: any) => alert(e?.response?.data?.error?.message ?? 'Delete failed'),
  });

  const newUser = () => {
    setError(null);
    setDraft({ name: '', email: '', password: '', role: AdminRole.Viewer, phone: '', isActive: true, perms: roleDefaults(AdminRole.Viewer) });
  };
  const edit = (u: AdminUserDTO) => {
    setError(null);
    setDraft({ id: u.id, name: u.name, email: u.email, password: '', role: u.role, phone: u.phone ?? '', isActive: u.isActive, perms: new Set(u.permissions) });
  };
  const onRole = (role: string) => draft && setDraft({ ...draft, role, perms: roleDefaults(role) });
  const togglePerm = (perm: string) => {
    if (!draft) return;
    const s = new Set(draft.perms);
    if (s.has(perm)) s.delete(perm);
    else s.add(perm);
    setDraft({ ...draft, perms: s });
  };

  const isSuper = draft?.role === AdminRole.SuperAdmin;

  return (
    <div className="max-w-4xl">
      <PageHeader title="Users & Roles" action={<Button onClick={newUser}>+ New user</Button>} />

      {draft && (
        <Card className="mb-5">
          {error && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name *"><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
            <Field label="Email *"><Input value={draft.email} disabled={!!draft.id} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></Field>
            <Field label={draft.id ? 'New password (optional)' : 'Password *'}><Input type="password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} /></Field>
            <Field label="Phone"><Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></Field>
            <Field label="Role">
              <Select value={draft.role} onChange={(e) => onRole(e.target.value)}>
                {meta?.roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            </Field>
            <label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} /> Active</label>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-sm font-semibold text-slate-700">
              Permissions {isSuper && <span className="text-xs font-normal text-slate-400">(Super Admin has all permissions)</span>}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 md:grid-cols-3">
              {meta?.permissions.map((perm) => (
                <label key={perm} className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    disabled={isSuper}
                    checked={isSuper || draft.perms.has(perm)}
                    onChange={() => togglePerm(perm)}
                  />
                  {perm}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={() => save.mutate(draft)} disabled={!draft.name || (!draft.id && (!draft.email || !draft.password)) || save.isPending}>Save</Button>
            <Button variant="secondary" onClick={() => setDraft(null)}>Cancel</Button>
          </div>
        </Card>
      )}

      {isLoading ? <Spinner /> : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Active</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users?.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-800">{u.name}</td>
                  <td className="px-4 py-2 text-slate-600">{u.email}</td>
                  <td className="px-4 py-2"><Badge>{u.role}</Badge></td>
                  <td className="px-4 py-2">{u.isActive ? '✓' : '—'}</td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="secondary" className="!py-1 text-xs" onClick={() => edit(u)}>Edit</Button>{' '}
                    <Button variant="ghost" className="!py-1 text-xs text-red-600" onClick={() => confirm(`Delete ${u.name}?`) && del.mutate(u.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
