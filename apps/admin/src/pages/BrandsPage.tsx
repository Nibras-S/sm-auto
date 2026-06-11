import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BrandDTO } from '@sm/shared';
import * as catalog from '../lib/catalog';
import { Badge, Button, Card, Field, Input, PageHeader, Spinner } from '../components/ui';

interface Draft {
  id?: string;
  name: string;
  country: string;
  displayOrder: number;
  isActive: boolean;
  kindPart: boolean;
  kindVehicle: boolean;
}
const blank: Draft = { name: '', country: '', displayOrder: 0, isActive: true, kindPart: true, kindVehicle: true };

export function BrandsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['brands'], queryFn: catalog.listBrands });
  const [draft, setDraft] = useState<Draft | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ['brands'] });

  const save = useMutation({
    mutationFn: (d: Draft) => {
      const kind = [d.kindPart ? 'part' : null, d.kindVehicle ? 'vehicle' : null].filter(Boolean);
      const body = { name: d.name, country: d.country || undefined, displayOrder: d.displayOrder, isActive: d.isActive, kind };
      return d.id ? catalog.updateBrand(d.id, body) : catalog.createBrand(body);
    },
    onSuccess: () => {
      invalidate();
      setDraft(null);
    },
  });
  const del = useMutation({ mutationFn: catalog.deleteBrand, onSuccess: invalidate });

  const edit = (b: BrandDTO) =>
    setDraft({
      id: b.id,
      name: b.name,
      country: b.country ?? '',
      displayOrder: b.displayOrder,
      isActive: b.isActive,
      kindPart: b.kind.includes('part'),
      kindVehicle: b.kind.includes('vehicle'),
    });

  return (
    <div className="max-w-3xl">
      <PageHeader title="Brands" action={<Button onClick={() => setDraft({ ...blank })}>+ New brand</Button>} />

      {draft && (
        <Card className="mb-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name *">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Country">
              <Input value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })} />
            </Field>
            <Field label="Display order">
              <Input
                type="number"
                value={draft.displayOrder}
                onChange={(e) => setDraft({ ...draft, displayOrder: Number(e.target.value) })}
              />
            </Field>
            <div className="flex items-end gap-4 pb-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={draft.kindPart} onChange={(e) => setDraft({ ...draft, kindPart: e.target.checked })} /> Part
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={draft.kindVehicle} onChange={(e) => setDraft({ ...draft, kindVehicle: e.target.checked })} /> Vehicle
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} /> Active
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => save.mutate(draft)} disabled={!draft.name || save.isPending}>
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
                <th className="px-4 py-3">Kind</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-800">{b.name}</td>
                  <td className="px-4 py-2 text-slate-500">{b.kind.join(', ')}</td>
                  <td className="px-4 py-2 text-slate-500">{b.country ?? '—'}</td>
                  <td className="px-4 py-2">{b.isActive ? <Badge>Active</Badge> : <Badge>Hidden</Badge>}</td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="secondary" className="!py-1 text-xs" onClick={() => edit(b)}>
                      Edit
                    </Button>{' '}
                    <Button
                      variant="ghost"
                      className="!py-1 text-xs text-red-600"
                      onClick={() => confirm(`Delete "${b.name}"?`) && del.mutate(b.id)}
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
