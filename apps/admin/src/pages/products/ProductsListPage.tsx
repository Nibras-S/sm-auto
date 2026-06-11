import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatMoney, PRODUCT_STATUSES, type ProductStatus } from '@sm/shared';
import * as catalog from '../../lib/catalog';
import { Badge, Button, Input, PageHeader, Select, Spinner } from '../../components/ui';

export function ProductsListPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', { q, status, page }],
    queryFn: () => catalog.listProducts({ q: q || undefined, status: status || undefined, page, limit: 20 }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-products'] });
  const del = useMutation({ mutationFn: catalog.deleteProduct, onSuccess: invalidate });
  const changeStatus = useMutation({
    mutationFn: ({ id, s }: { id: string; s: ProductStatus }) => catalog.setProductStatus(id, s),
    onSuccess: invalidate,
  });

  return (
    <div>
      <PageHeader
        title="Products"
        action={
          <Link to="/products/new">
            <Button>+ New product</Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search name, SKU, part #, OEM…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="max-w-[180px]"
        >
          <option value="">All statuses</option>
          {PRODUCT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.data.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-slate-100">
                        {p.images[0]?.url && (
                          <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div>
                        <Link to={`/products/${p.id}`} className="font-medium text-slate-800 hover:text-brand-700">
                          {p.name}
                        </Link>
                        <div className="text-xs text-slate-400">{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{p.brandName ?? '—'}</td>
                  <td className="px-4 py-2 text-slate-600">{p.categoryName ?? '—'}</td>
                  <td className="px-4 py-2 text-slate-600">{formatMoney(p.price ?? null)}</td>
                  <td className="px-4 py-2">
                    <Badge>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-2">
                    <Badge>{p.availability}</Badge>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <Select
                        value={p.status}
                        onChange={(e) => changeStatus.mutate({ id: p.id, s: e.target.value as ProductStatus })}
                        className="!w-auto !py-1 text-xs"
                      >
                        {PRODUCT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                      <Link to={`/products/${p.id}`}>
                        <Button variant="secondary" className="!py-1 text-xs">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="!py-1 text-xs text-red-600"
                        onClick={() => {
                          if (confirm(`Delete "${p.name}"?`)) del.mutate(p.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!data?.data.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span className="text-slate-500">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
