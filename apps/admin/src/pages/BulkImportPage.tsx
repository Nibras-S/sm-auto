import { useState, type ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { importProducts, type ImportResult } from '../lib/platform';
import { Button, Card, PageHeader } from '../components/ui';

const TEMPLATE_HEADERS = [
  'sku',
  'name',
  'brand',
  'category',
  'partNumber',
  'oemNumber',
  'productType',
  'price',
  'warranty',
  'description',
  'fitment',
];

export function BulkImportPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows, setRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const json = XLSX.utils.sheet_to_json(ws) as any[];
        setRows(json);
      } catch {
        setError('Could not read that file. Please upload a valid .xlsx or .csv.');
      }
    };
    reader.readAsBinaryString(file);
  }

  function downloadTemplate() {
    const ws = XLSX.utils.json_to_sheet([Object.fromEntries(TEMPLATE_HEADERS.map((h) => [h, '']))]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'spare-mec-product-template.xlsx');
  }

  async function runImport() {
    setImporting(true);
    setError(null);
    try {
      setResult(await importProducts(rows));
    } catch (e) {
      const ax = e as { response?: { data?: { error?: { message?: string } } } };
      setError(ax.response?.data?.error?.message ?? 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title="Bulk Product Import" />
      <Card>
        <p className="text-sm text-slate-600">
          Upload an Excel/CSV file. Products are matched by <strong>SKU</strong> — existing SKUs are updated, new
          ones are created. Fitment cells accept <code>Make&gt;Model&gt;Generation&gt;Engine&gt;YearStart-YearEnd</code>,
          separated by <code>;</code>.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={downloadTemplate}>Download template</Button>
          <label className="cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Choose file
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFile} />
          </label>
          {fileName && <span className="text-sm text-slate-500">{fileName} — {rows.length} rows</span>}
          {rows.length > 0 && (
            <Button onClick={runImport} disabled={importing}>{importing ? 'Importing…' : `Import ${rows.length} rows`}</Button>
          )}
        </div>
        {error && <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      </Card>

      {result && (
        <Card className="mt-5">
          <div className="flex gap-6 text-sm">
            <span className="font-semibold text-green-700">Created: {result.created}</span>
            <span className="font-semibold text-blue-700">Updated: {result.updated}</span>
            <span className="font-semibold text-red-700">Failed: {result.failed}</span>
            <span className="text-slate-500">Total: {result.total}</span>
          </div>
          <div className="mt-4 max-h-80 overflow-auto rounded border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500">
                <tr><th className="px-3 py-2">Row</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">SKU</th><th className="px-3 py-2">Message</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {result.results.map((r) => (
                  <tr key={r.row} className={r.status === 'error' ? 'bg-red-50/40' : ''}>
                    <td className="px-3 py-1.5">{r.row}</td>
                    <td className="px-3 py-1.5">{r.status}</td>
                    <td className="px-3 py-1.5">{r.sku ?? '—'}</td>
                    <td className="px-3 py-1.5 text-red-600">{r.message ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
