import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SubcategoryDTO } from '@sm/shared';
import * as catalog from '../lib/catalog';
import { Badge, Button, Card, Field, Input, PageHeader, Select, Spinner } from '../components/ui';

interface Draft {
  id?: string;
  name: string;
  categoryId: string;
  displayOrder: number;
  isActive: boolean;
}
const blank: Draft = { name: '', categoryId: '', displayOrder: 0, isActive: true };

export function SubcategoriesPage() {
  const qc = useQueryClient();
  const categories = useQuery({ queryKey: ['categories'], queryFn: catalog.listCategories });
  const { data, isLoading } = useQuery({ queryKey: ['subcategories'], queryFn: () => catalog.listSubcategories() });
  const [draft, setDraft] = useState<Draft | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ['subcategories'] });

  const save = useMutation({
    mutationFn: (d: Draft) => {
      const body = { name: d.name, categoryId: d.categoryId, displayOrder: d.displayOrder, isActive: d.isActive };
      return d.id ? catalog.updateSubcategory(d.id, body) : catalog.createSubcategory(body);
    },
    onSuccess: () => {
      invalidate();
      setDraft(null);
    },
  });
  const del = useMutation({ mutationFn: catalog.deleteSubcategory, onSuccess: invalidate });

  const edit = (s: SubcategoryDTO) =>
    setDraft({ id: s.id, name: s.name, categoryId: s.categoryId, displayOrder: s.displayOrder, isActive: s.isActive });

  return (
    <div className="max-w-3xl">
      <PageHeader title="Subcategories" action={<Button onClick={() => setDraft({ ...blank })}>+ New subcategory</Button>} />

      {draft && (
        <Card className="mb-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name *">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Category *">
              <Select value={draft.categoryId} onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}>
                <option value="">— Select —</option>
                {categories.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Display order">
              <Input
                type="number"
                value={draft.displayOrder}
                onChange={(e) => setDraft({ ...draft, displayOrder: Number(e.target.value) })}
              />
            </Field>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} /> Active
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => save.mutate(draft)} disabled={!draft.name || !draft.categoryId || save.isPending}>
              Save
            </Button>
            <Button variant="secondary" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-800">{s.name}</td>
                  <td className="px-4 py-2 text-slate-500">{s.categoryName ?? '—'}</td>
                  <td className="px-4 py-2">{s.isActive ? <Badge>Active</Badge> : <Badge>Hidden</Badge>}</td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="secondary" className="!py-1 text-xs" onClick={() => edit(s)}>
                      Edit
                    </Button>{' '}
                    <Button
                      variant="ghost"
                      className="!py-1 text-xs text-red-600"
                      onClick={() => confirm(`Delete "${s.name}"?`) && del.mutate(s.id)}
                    >
                      Delete
                    </Button>
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
