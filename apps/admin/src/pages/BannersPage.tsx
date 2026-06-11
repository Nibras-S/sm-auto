import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BannerDTO } from '@sm/shared';
import * as p from '../lib/platform';
import { Badge, Button, Card, Field, Input, PageHeader, Select, Spinner } from '../components/ui';

interface Draft {
  id?: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  placement: string;
  displayOrder: number;
  isActive: boolean;
}
const blank: Draft = { title: '', subtitle: '', imageUrl: '', link: '', placement: 'home-hero', displayOrder: 0, isActive: true };
const PLACEMENTS = ['home-hero', 'home-promo', 'category-top'];

export function BannersPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['banners'], queryFn: p.listBanners });
  const [draft, setDraft] = useState<Draft | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ['banners'] });

  const save = useMutation({
    mutationFn: (d: Draft) => {
      const body = {
        title: d.title || undefined,
        subtitle: d.subtitle || undefined,
        image: d.imageUrl ? { url: d.imageUrl } : null,
        link: d.link || undefined,
        placement: d.placement,
        displayOrder: d.displayOrder,
        isActive: d.isActive,
      };
      return d.id ? p.updateBanner(d.id, body) : p.createBanner(body);
    },
    onSuccess: () => {
      invalidate();
      setDraft(null);
    },
  });
  const del = useMutation({ mutationFn: p.deleteBanner, onSuccess: invalidate });

  const edit = (b: BannerDTO) =>
    setDraft({
      id: b.id,
      title: b.title ?? '',
      subtitle: b.subtitle ?? '',
      imageUrl: b.image?.url ?? '',
      link: b.link ?? '',
      placement: String(b.placement),
      displayOrder: b.displayOrder,
      isActive: b.isActive,
    });

  return (
    <div className="max-w-4xl">
      <PageHeader title="Banners" action={<Button onClick={() => setDraft({ ...blank })}>+ New banner</Button>} />

      {draft && (
        <Card className="mb-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title"><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
            <Field label="Subtitle"><Input value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} /></Field>
            <Field label="Image URL"><Input value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} placeholder="https://…" /></Field>
            <Field label="Link"><Input value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="/catalogue" /></Field>
            <Field label="Placement">
              <Select value={draft.placement} onChange={(e) => setDraft({ ...draft, placement: e.target.value })}>
                {PLACEMENTS.map((pl) => <option key={pl} value={pl}>{pl}</option>)}
              </Select>
            </Field>
            <Field label="Display order"><Input type="number" value={draft.displayOrder} onChange={(e) => setDraft({ ...draft, displayOrder: Number(e.target.value) })} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} /> Active</label>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => save.mutate(draft)} disabled={save.isPending}>Save</Button>
            <Button variant="secondary" onClick={() => setDraft(null)}>Cancel</Button>
          </div>
        </Card>
      )}

      {isLoading ? <Spinner /> : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {data?.map((b) => (
            <Card key={b.id} className="flex gap-3">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded bg-slate-100">
                {b.image?.url && <img src={b.image.url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-slate-800">{b.title || '(untitled)'}</span>
                  {b.isActive ? <Badge>Active</Badge> : <Badge>Hidden</Badge>}
                </div>
                <div className="text-xs text-slate-500">{b.placement} · order {b.displayOrder}</div>
                <div className="mt-2 flex gap-2">
                  <Button variant="secondary" className="!py-1 text-xs" onClick={() => edit(b)}>Edit</Button>
                  <Button variant="ghost" className="!py-1 text-xs text-red-600" onClick={() => confirm('Delete banner?') && del.mutate(b.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
          {!data?.length && <p className="text-sm text-slate-400">No banners yet.</p>}
        </div>
      )}
    </div>
  );
}
