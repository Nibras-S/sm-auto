import { formatMoney, type ContactInfo, type LineItem, type VehicleInfo } from '@sm/shared';
import { Card } from './ui';

export function ContactBlock({ contact, emirate }: { contact: ContactInfo; emirate?: string }) {
  return (
    <Card>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</h3>
      <div className="space-y-1 text-sm">
        <div className="font-medium text-slate-800">{contact.name}</div>
        {contact.phone && <div className="text-slate-600">📞 {contact.phone}</div>}
        {contact.email && <div className="text-slate-600">✉️ {contact.email}</div>}
        {emirate && <div className="text-slate-600">📍 {emirate}</div>}
      </div>
    </Card>
  );
}

export function VehicleBlock({ vehicle }: { vehicle?: VehicleInfo }) {
  if (!vehicle || !(vehicle.brand || vehicle.model || vehicle.year || vehicle.vin)) return null;
  const line = [vehicle.brand, vehicle.model, vehicle.generation, vehicle.year].filter(Boolean).join(' ');
  return (
    <Card>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Vehicle</h3>
      <div className="space-y-1 text-sm text-slate-700">
        <div className="font-medium">{line || '—'}</div>
        {vehicle.engineType && <div>Engine: {vehicle.engineType}</div>}
        {vehicle.vin && <div>VIN: {vehicle.vin}</div>}
      </div>
    </Card>
  );
}

export function ItemsTable({ items, showPrice = false }: { items: LineItem[]; showPrice?: boolean }) {
  if (!items.length) return <p className="text-sm text-slate-400">No items.</p>;
  return (
    <table className="w-full text-left text-sm">
      <thead className="text-xs uppercase text-slate-500">
        <tr>
          <th className="py-2">Item</th>
          <th className="py-2">Part #</th>
          <th className="py-2 text-center">Qty</th>
          {showPrice && <th className="py-2 text-right">Unit</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {items.map((it, i) => (
          <tr key={i}>
            <td className="py-2 text-slate-800">{it.name}</td>
            <td className="py-2 text-slate-500">{it.partNumber ?? '—'}</td>
            <td className="py-2 text-center">{it.quantity}</td>
            {showPrice && <td className="py-2 text-right">{formatMoney(it.unitPrice ?? null)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
