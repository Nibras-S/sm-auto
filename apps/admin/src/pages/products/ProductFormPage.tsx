import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fromFils,
  toFils,
  PRODUCT_AVAILABILITIES,
  PRODUCT_CONDITIONS,
  PRODUCT_STATUSES,
  type CloudImage,
} from '@sm/shared';
import * as catalog from '../../lib/catalog';
import { Button, Card, Field, Input, PageHeader, Select, Spinner, Textarea } from '../../components/ui';
import { ImageUploader } from '../../components/ImageUploader';

interface SpecRow {
  label: string;
  value: string;
}
interface FitmentRow {
  make: string;
  model?: string;
  generation?: string;
  yearStart?: string;
  yearEnd?: string;
  engineType?: string;
}
interface FormValues {
  name: string;
  sku: string;
  partNumber?: string;
  oemNumber?: string;
  brandId?: string;
  categoryId?: string;
  subcategoryId?: string;
  productType?: string;
  productFamily?: string;
  condition?: string;
  warranty?: string;
  shortDescription?: string;
  description?: string;
  highlightsText?: string;
  priceAed?: string;
  status: string;
  availability: string;
  featured: boolean;
  trending: boolean;
  specs: SpecRow[];
  fitments: FitmentRow[];
}

const empty: FormValues = {
  name: '',
  sku: '',
  status: 'Draft',
  availability: 'On Request',
  featured: false,
  trending: false,
  specs: [],
  fitments: [],
};

export function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [images, setImages] = useState<CloudImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, control, reset } = useForm<FormValues>({ defaultValues: empty });
  const specs = useFieldArray({ control, name: 'specs' });
  const fitments = useFieldArray({ control, name: 'fitments' });

  const brands = useQuery({ queryKey: ['brands'], queryFn: catalog.listBrands });
  const categories = useQuery({ queryKey: ['categories'], queryFn: catalog.listCategories });
  const subcategories = useQuery({ queryKey: ['subcategories'], queryFn: () => catalog.listSubcategories() });
  const productQuery = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => catalog.getProduct(id as string),
    enabled: isEdit,
  });

  useEffect(() => {
    const p = productQuery.data;
    if (!p) return;
    setImages(p.images ?? []);
    reset({
      name: p.name,
      sku: p.sku,
      partNumber: p.partNumber ?? '',
      oemNumber: p.oemNumber ?? '',
      brandId: p.brandId ?? '',
      categoryId: p.categoryId ?? '',
      subcategoryId: p.subcategoryId ?? '',
      productType: p.productType ?? '',
      productFamily: p.productFamily ?? '',
      condition: p.condition ?? '',
      warranty: p.warranty ?? '',
      shortDescription: p.shortDescription ?? '',
      description: p.description ?? '',
      highlightsText: (p.highlights ?? []).join('\n'),
      priceAed: p.price != null ? String(fromFils(p.price)) : '',
      status: p.status,
      availability: p.availability,
      featured: p.featured,
      trending: p.trending,
      specs: p.specs ?? [],
      fitments: (p.fitments ?? []).map((f) => ({
        make: f.make,
        model: f.model ?? '',
        generation: f.generation ?? '',
        engineType: f.engineType ?? '',
        yearStart: f.yearStart != null ? String(f.yearStart) : '',
        yearEnd: f.yearEnd != null ? String(f.yearEnd) : '',
      })),
    });
  }, [productQuery.data, reset]);

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      isEdit ? catalog.updateProduct(id as string, body) : catalog.createProduct(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      navigate('/products');
    },
    onError: (e: unknown) => {
      const ax = e as { response?: { data?: { error?: { message?: string } } } };
      setError(ax.response?.data?.error?.message ?? 'Save failed');
    },
  });

  function onSubmit(v: FormValues) {
    setError(null);
    const priceAed = v.priceAed?.trim();
    save.mutate({
      name: v.name,
      sku: v.sku,
      partNumber: v.partNumber || undefined,
      oemNumber: v.oemNumber || undefined,
      brandId: v.brandId || null,
      categoryId: v.categoryId || null,
      subcategoryId: v.subcategoryId || null,
      productType: v.productType || undefined,
      productFamily: v.productFamily || undefined,
      condition: v.condition || undefined,
      warranty: v.warranty || undefined,
      shortDescription: v.shortDescription || undefined,
      description: v.description || undefined,
      highlights: (v.highlightsText ?? '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      specs: v.specs.filter((s) => s.label && s.value),
      fitments: v.fitments
        .filter((f) => f.make)
        .map((f) => ({
          make: f.make,
          model: f.model || undefined,
          generation: f.generation || undefined,
          engineType: f.engineType || undefined,
          yearStart: f.yearStart ? Number(f.yearStart) : undefined,
          yearEnd: f.yearEnd ? Number(f.yearEnd) : undefined,
        })),
      images,
      price: priceAed ? toFils(Number(priceAed)) : null,
      status: v.status,
      availability: v.availability,
      featured: v.featured,
      trending: v.trending,
    });
  }

  if (isEdit && productQuery.isLoading) return <Spinner />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-5">
      <PageHeader
        title={isEdit ? 'Edit product' : 'New product'}
        action={
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/products')}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        }
      />

      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Basics</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name *">
            <Input {...register('name', { required: true })} />
          </Field>
          <Field label="SKU *">
            <Input {...register('sku', { required: true })} />
          </Field>
          <Field label="Part number">
            <Input {...register('partNumber')} />
          </Field>
          <Field label="OEM number">
            <Input {...register('oemNumber')} />
          </Field>
          <Field label="Brand">
            <Select {...register('brandId')}>
              <option value="">— None —</option>
              {brands.data?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category">
            <Select {...register('categoryId')}>
              <option value="">— None —</option>
              {categories.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Subcategory">
            <Select {...register('subcategoryId')}>
              <option value="">— None —</option>
              {subcategories.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Product type">
            <Input {...register('productType')} />
          </Field>
          <Field label="Product family">
            <Input {...register('productFamily')} />
          </Field>
          <Field label="Condition">
            <Select {...register('condition')}>
              <option value="">— None —</option>
              {PRODUCT_CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Warranty">
            <Input {...register('warranty')} />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Pricing & visibility</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (AED) — leave blank for On Request">
            <Input type="number" step="0.01" {...register('priceAed')} />
          </Field>
          <Field label="Availability">
            <Select {...register('availability')}>
              {PRODUCT_AVAILABILITIES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select {...register('status')}>
              {PRODUCT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end gap-6 pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('featured')} /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('trending')} /> Trending
            </label>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Images</h2>
        <ImageUploader value={images} onChange={setImages} />
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Content</h2>
        <div className="space-y-4">
          <Field label="Short description">
            <Textarea {...register('shortDescription')} />
          </Field>
          <Field label="Description">
            <Textarea {...register('description')} className="min-h-[140px]" />
          </Field>
          <Field label="Key features (one per line)">
            <Textarea {...register('highlightsText')} />
          </Field>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Specifications</h2>
          <Button type="button" variant="secondary" onClick={() => specs.append({ label: '', value: '' })}>
            + Add spec
          </Button>
        </div>
        <div className="space-y-2">
          {specs.fields.map((f, i) => (
            <div key={f.id} className="flex gap-2">
              <Input placeholder="Label" {...register(`specs.${i}.label`)} />
              <Input placeholder="Value" {...register(`specs.${i}.value`)} />
              <Button type="button" variant="ghost" className="text-red-600" onClick={() => specs.remove(i)}>
                ✕
              </Button>
            </div>
          ))}
          {!specs.fields.length && <p className="text-sm text-slate-400">No specifications added.</p>}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Vehicle fitment</h2>
          <Button type="button" variant="secondary" onClick={() => fitments.append({ make: '' })}>
            + Add fitment
          </Button>
        </div>
        <div className="space-y-2">
          {fitments.fields.map((f, i) => (
            <div key={f.id} className="grid grid-cols-12 gap-2">
              <Input className="col-span-2" placeholder="Make" {...register(`fitments.${i}.make`)} />
              <Input className="col-span-3" placeholder="Model" {...register(`fitments.${i}.model`)} />
              <Input className="col-span-2" placeholder="Generation" {...register(`fitments.${i}.generation`)} />
              <Input className="col-span-2" placeholder="Engine" {...register(`fitments.${i}.engineType`)} />
              <Input className="col-span-1" placeholder="From" {...register(`fitments.${i}.yearStart`)} />
              <Input className="col-span-1" placeholder="To" {...register(`fitments.${i}.yearEnd`)} />
              <Button type="button" variant="ghost" className="col-span-1 text-red-600" onClick={() => fitments.remove(i)}>
                ✕
              </Button>
            </div>
          ))}
          {!fitments.fields.length && <p className="text-sm text-slate-400">No fitment rows added.</p>}
        </div>
      </Card>
    </form>
  );
}
