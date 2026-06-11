import React, { useState } from "react";
import { FiX, FiCheckCircle } from "react-icons/fi";
import { submitQuoteRequest } from "../../lib/crmApi";

const blank = { name: "", phone: "", email: "", carMake: "", carModel: "", year: "", qty: "1", notes: "" };

export default function QuoteModal({ product, open, onClose }) {
  const [form, setForm] = useState(blank);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitQuoteRequest({
        contact: { name: form.name.trim(), phone: form.phone || undefined, email: form.email || undefined },
        vehicle: {
          brand: form.carMake || product?.brand || undefined,
          model: form.carModel || undefined,
          year: form.year ? Number(form.year) : undefined,
        },
        items: [
          {
            productId: product?.id || product?.productId || undefined,
            slug: product?.slug,
            name: product?.name || "Quote item",
            partNumber: product?.partNumber || undefined,
            quantity: Number(form.qty) || 1,
          },
        ],
        notes: form.notes || undefined,
      });
      setDone(true);
    } catch {
      setError("Could not submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 text-neutral-400 hover:text-ink">
          <FiX size={20} />
        </button>

        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
              <FiCheckCircle size={30} />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-ink">Quote requested</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Thank you. Our sales team will get back to you with your best price shortly.
            </p>
            <button onClick={onClose} className="btn btn-primary mt-5 px-6 py-2.5">Done</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h3 className="font-display text-lg font-bold text-ink">Request a Quote</h3>
            {product?.name && <p className="mt-1 text-xs text-neutral-500">For: {product.name}</p>}
            {error && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <QField label="Name *" value={form.name} onChange={update("name")} full />
              <QField label="Phone" value={form.phone} onChange={update("phone")} />
              <QField label="Email" value={form.email} onChange={update("email")} />
              <QField label="Car Make" value={form.carMake} onChange={update("carMake")} placeholder={product?.brand} />
              <QField label="Model" value={form.carModel} onChange={update("carModel")} />
              <QField label="Year" value={form.year} onChange={update("year")} />
              <QField label="Quantity" value={form.qty} onChange={update("qty")} />
              <div className="col-span-2">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={update("notes")}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-accent-500"
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary mt-5 w-full py-3 text-sm font-bold disabled:opacity-60">
              {submitting ? "Submitting…" : "Submit Quote Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function QField({ label, value, onChange, placeholder, full }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-accent-500"
      />
    </div>
  );
}
