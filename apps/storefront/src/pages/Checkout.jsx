import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMinus, FiPlus, FiTrash2, FiShield } from "react-icons/fi";
import useSEO from "../hooks/useSEO";
import { useInquiry } from "../context/InquiryContext";
import { getProductImage } from "../utils/productImages";
import { createOrder } from "../lib/crmApi";

const EMIRATES = [
  "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah",
  "Fujairah", "Umm Al Quwain", "Al Ain", "Other (GCC)",
];

const empty = {
  name: "", phone: "", email: "",
  line1: "", area: "", city: "", emirate: "",
  carMake: "", carModel: "", year: "", vin: "", notes: "",
};

export default function Checkout() {
  useSEO({ title: "Checkout", description: "Place your order — our team verifies pricing and delivery before confirmation." });
  const { items, setQty, removeItem, clear } = useInquiry();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!items.length) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">Your cart is empty</h1>
        <p className="mt-2 text-neutral-500">Add some parts before checking out.</p>
        <Link to="/catalogue" className="btn btn-primary mt-6 px-6 py-3">Browse Catalogue</Link>
      </div>
    );
  }

  async function placeOrder(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const order = await createOrder({
        contact: { name: form.name.trim(), phone: form.phone || undefined, email: form.email || undefined },
        shippingAddress: {
          line1: form.line1 || undefined,
          area: form.area || undefined,
          city: form.city || undefined,
          emirate: form.emirate || undefined,
        },
        vehicle: {
          brand: form.carMake || undefined,
          model: form.carModel || undefined,
          year: form.year ? Number(form.year) : undefined,
          vin: form.vin || undefined,
        },
        items: items.map((i) => ({ productId: i.productId || undefined, name: i.name, quantity: i.qty })),
        notes: form.notes || undefined,
      });
      clear();
      navigate("/order-confirmation", { state: { order } });
    } catch (err) {
      setError(err?.response?.data?.error?.message || "Could not place your order. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-2xl font-black tracking-tight text-ink md:text-3xl">Checkout</h1>
      <p className="mt-1 text-sm text-neutral-500">
        No payment now — we verify pricing, availability and delivery, then confirm your order.
      </p>

      <form onSubmit={placeOrder} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* Details */}
        <div className="space-y-6">
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <Section title="Your details">
            <Input label="Full name *" value={form.name} onChange={update("name")} />
            <Input label="Phone" value={form.phone} onChange={update("phone")} placeholder="WhatsApp number" />
            <Input label="Email" value={form.email} onChange={update("email")} full />
          </Section>

          <Section title="Delivery address (optional)">
            <Input label="Address" value={form.line1} onChange={update("line1")} full />
            <Input label="Area" value={form.area} onChange={update("area")} />
            <Input label="City" value={form.city} onChange={update("city")} />
            <Select label="Emirate" value={form.emirate} onChange={update("emirate")} options={EMIRATES} />
          </Section>

          <Section title="Vehicle (optional)">
            <Input label="Make" value={form.carMake} onChange={update("carMake")} placeholder="e.g. BMW" />
            <Input label="Model" value={form.carModel} onChange={update("carModel")} placeholder="e.g. 320i" />
            <Input label="Year" value={form.year} onChange={update("year")} />
            <Input label="VIN / Chassis" value={form.vin} onChange={update("vin")} />
            <div className="col-span-2">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Notes</label>
              <textarea
                value={form.notes}
                onChange={update("notes")}
                rows={2}
                className="w-full resize-none rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-accent-500"
              />
            </div>
          </Section>
        </div>

        {/* Summary */}
        <div>
          <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-bold text-ink">Order summary</h2>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.slug} className="flex gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50">
                    <img
                      src={item.images?.[0]?.url || getProductImage(item.imageKey)}
                      alt={item.name}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-xs font-bold text-ink">{item.name}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-neutral-200">
                        <button type="button" onClick={() => setQty(item.slug, item.qty - 1)} className="flex h-6 w-6 items-center justify-center text-neutral-400">
                          <FiMinus size={11} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.qty}</span>
                        <button type="button" onClick={() => setQty(item.slug, item.qty + 1)} className="flex h-6 w-6 items-center justify-center text-neutral-400">
                          <FiPlus size={11} />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeItem(item.slug)} className="text-neutral-300 hover:text-accent-500">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t border-neutral-100 pt-4 text-xs text-neutral-500">
              Prices are confirmed by our team after you place the order.
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary mt-4 w-full py-3.5 text-sm font-bold disabled:opacity-60">
              {submitting ? "Placing order…" : "Place Order"}
            </button>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[10px] font-semibold text-neutral-400">
              <FiShield size={12} className="text-accent-500" />
              Order enters “Pending Verification” — no payment required now.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-bold text-ink">{title}</h2>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, full }) {
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

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</label>
      <select value={value} onChange={onChange} className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent-500">
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
