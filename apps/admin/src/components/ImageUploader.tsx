import { useState, type ChangeEvent } from 'react';
import type { CloudImage } from '@sm/shared';
import { uploadImage } from '../lib/catalog';

export function ImageUploader({
  value,
  onChange,
}: {
  value: CloudImage[];
  onChange: (images: CloudImage[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const next = [...value];
      for (const file of Array.from(files)) {
        // eslint-disable-next-line no-await-in-loop
        const r = await uploadImage(file);
        next.push({ publicId: r.publicId, url: r.url, sortOrder: next.length });
      }
      onChange(next.map((im, i) => ({ ...im, sortOrder: i })));
    } catch {
      setError('Upload failed — check that Cloudinary is configured in the API .env.');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i).map((im, idx) => ({ ...im, sortOrder: idx })));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next.map((im, idx) => ({ ...im, sortOrder: idx })));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((img, i) => (
          <div key={img.publicId ?? img.url} className="relative h-24 w-24 overflow-hidden rounded-md border border-slate-200">
            <img src={img.url} alt={img.alt ?? ''} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 px-1 text-white">
              <button type="button" onClick={() => move(i, -1)} className="text-xs" title="Move left">
                ‹
              </button>
              <button type="button" onClick={() => remove(i)} className="text-xs" title="Remove">
                ✕
              </button>
              <button type="button" onClick={() => move(i, 1)} className="text-xs" title="Move right">
                ›
              </button>
            </div>
          </div>
        ))}
        <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-md border border-dashed border-slate-300 text-center text-xs text-slate-500 hover:bg-slate-50">
          {busy ? 'Uploading…' : '+ Add image'}
          <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} disabled={busy} />
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
