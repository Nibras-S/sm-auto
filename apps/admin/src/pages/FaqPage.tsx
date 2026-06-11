import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FaqDTO } from '@sm/shared';
import * as p from '../lib/platform';
import { Badge, Button, Card, Field, Input, PageHeader, Spinner, Textarea } from '../components/ui';

interface Draft {
  id?: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
}
const blank: Draft = { question: '', answer: '', category: '', displayOrder: 0, isActive: true };

export function FaqPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['faqs'], queryFn: p.listFaqs });
  const [draft, setDraft] = useState<Draft | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ['faqs'] });

  const save = useMutation({
    mutationFn: (d: Draft) => {
      const body = { question: d.question, answer: d.answer, category: d.category || undefined, displayOrder: d.displayOrder, isActive: d.isActive };
      return d.id ? p.updateFaq(d.id, body) : p.createFaq(body);
    },
    onSuccess: () => { invalidate(); setDraft(null); },
  });
  const del = useMutation({ mutationFn: p.deleteFaq, onSuccess: invalidate });

  const edit = (f: FaqDTO) =>
    setDraft({ id: f.id, question: f.question, answer: f.answer, category: f.category ?? '', displayOrder: f.displayOrder, isActive: f.isActive });

  return (
    <div className="max-w-3xl">
      <PageHeader title="FAQ" action={<Button onClick={() => setDraft({ ...blank })}>+ New FAQ</Button>} />

      {draft && (
        <Card className="mb-5">
          <div className="space-y-3">
            <Field label="Question *"><Input value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} /></Field>
            <Field label="Answer *"><Textarea value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category"><Input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} /></Field>
              <Field label="Display order"><Input type="number" value={draft.displayOrder} onChange={(e) => setDraft({ ...draft, displayOrder: Number(e.target.value) })} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} /> Active</label>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => save.mutate(draft)} disabled={!draft.question || !draft.answer || save.isPending}>Save</Button>
            <Button variant="secondary" onClick={() => setDraft(null)}>Cancel</Button>
          </div>
        </Card>
      )}

      {isLoading ? <Spinner /> : (
        <div className="space-y-2">
          {data?.map((f) => (
            <Card key={f.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{f.question}</span>
                    {!f.isActive && <Badge>Hidden</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{f.answer}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" className="!py-1 text-xs" onClick={() => edit(f)}>Edit</Button>
                  <Button variant="ghost" className="!py-1 text-xs text-red-600" onClick={() => confirm('Delete FAQ?') && del.mutate(f.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
          {!data?.length && <p className="text-sm text-slate-400">No FAQs yet.</p>}
        </div>
      )}
    </div>
  );
}
