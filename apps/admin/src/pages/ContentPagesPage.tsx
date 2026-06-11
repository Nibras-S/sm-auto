import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as p from '../lib/platform';
import { Button, Card, Field, Input, PageHeader, Spinner, Textarea } from '../components/ui';

const PAGES = [
  { slug: 'about', name: 'About Us' },
  { slug: 'contact', name: 'Contact' },
  { slug: 'terms', name: 'Terms & Conditions' },
  { slug: 'privacy', name: 'Privacy Policy' },
  { slug: 'returns', name: 'Returns' },
];

export function ContentPagesPage() {
  const qc = useQueryClient();
  const [slug, setSlug] = useState('about');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saved, setSaved] = useState(false);

  const q = useQuery({ queryKey: ['content', slug], queryFn: () => p.getContent(slug) });
  useEffect(() => {
    if (q.data) {
      setTitle(q.data.title || '');
      setBody(q.data.body || '');
    }
  }, [q.data]);

  const save = useMutation({
    mutationFn: () => p.saveContent(slug, { title, body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content', slug] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  return (
    <div>
      <PageHeader title="Content Pages" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[200px_1fr]">
        <Card className="h-fit !p-2">
          {PAGES.map((pg) => (
            <button
              key={pg.slug}
              onClick={() => setSlug(pg.slug)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                slug === pg.slug ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pg.name}
            </button>
          ))}
        </Card>

        <Card>
          {q.isLoading ? (
            <Spinner />
          ) : (
            <div className="space-y-4">
              <Field label="Title">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Body (Markdown / HTML)">
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[320px] font-mono text-xs" />
              </Field>
              <div className="flex items-center gap-3">
                <Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button>
                {saved && <span className="text-sm text-green-600">Saved ✓</span>}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
