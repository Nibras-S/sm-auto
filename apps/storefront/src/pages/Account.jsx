import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useSEO from "../hooks/useSEO";
import { useAuth } from "../context/AuthContext";
import * as account from "../lib/accountApi";

const TABS = ["Overview", "Profile", "Addresses", "Vehicles", "Orders", "Inquiries", "Quotes"];

export default function Account() {
  useSEO({ title: "My Account" });
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState("Overview");

  if (loading) return <div className="container-x py-20 text-center text-neutral-400">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: "/account" }} />;

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-2xl font-black tracking-tight text-ink">My Account</h1>
      <p className="mt-1 text-sm text-neutral-500">Hello, {user.name}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
        <aside className="rounded-2xl border border-neutral-200 bg-white p-2">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${tab === t ? "bg-ink text-white" : "text-neutral-600 hover:bg-neutral-50"}`}>
              {t}
            </button>
          ))}
          <Link to="/wishlist" className="block rounded-lg px-3 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-50">Wishlist</Link>
          <button onClick={logout} className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">Sign out</button>
        </aside>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
          {tab === "Overview" && <Overview />}
          {tab === "Profile" && <Profile />}
          {tab === "Addresses" && <Addresses />}
          {tab === "Vehicles" && <Vehicles />}
          {tab === "Orders" && <HistoryList queryKey="my-orders" fetcher={account.myOrders} render={(o) => `${o.orderNumber} — ${o.status}`} empty="No orders yet." />}
          {tab === "Inquiries" && <HistoryList queryKey="my-inquiries" fetcher={account.myInquiries} render={(i) => `${i.inquiryNumber} — ${i.source} — ${i.status}`} empty="No inquiries yet." />}
          {tab === "Quotes" && <HistoryList queryKey="my-quotes" fetcher={account.myQuoteRequests} render={(q) => `${q.requestNumber} — ${q.status}`} empty="No quote requests yet." />}
        </section>
      </div>
    </div>
  );
}

function Overview() {
  const orders = useQuery({ queryKey: ["my-orders"], queryFn: account.myOrders });
  const inquiries = useQuery({ queryKey: ["my-inquiries"], queryFn: account.myInquiries });
  const quotes = useQuery({ queryKey: ["my-quotes"], queryFn: account.myQuoteRequests });
  const Card = ({ label, value }) => (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50/40 p-4">
      <div className="text-xs uppercase text-neutral-400">{label}</div>
      <div className="mt-1 text-2xl font-black text-ink">{value}</div>
    </div>
  );
  return (
    <div>
      <h2 className="font-display text-lg font-bold text-ink">Overview</h2>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <Card label="Orders" value={orders.data?.length ?? 0} />
        <Card label="Inquiries" value={inquiries.data?.length ?? 0} />
        <Card label="Quote Requests" value={quotes.data?.length ?? 0} />
      </div>
    </div>
  );
}

function Profile() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["profile"], queryFn: account.getProfile });
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (data) setForm({ name: data.name || "", phone: data.phone || "" });
  }, [data]);
  const save = useMutation({
    mutationFn: () => account.updateProfile(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    },
  });
  return (
    <div>
      <h2 className="font-display text-lg font-bold text-ink">Profile</h2>
      <div className="mt-4 max-w-sm space-y-3">
        <label className="block text-sm"><span className="mb-1 block font-medium text-neutral-700">Name</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-accent-500" />
        </label>
        <label className="block text-sm"><span className="mb-1 block font-medium text-neutral-700">Phone</span>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-accent-500" />
        </label>
        <div className="text-sm text-neutral-500">Email: {data?.email}</div>
        <div className="flex items-center gap-3">
          <button onClick={() => save.mutate()} className="btn btn-primary px-5 py-2.5">Save</button>
          {saved && <span className="text-sm text-green-600">Saved ✓</span>}
        </div>
      </div>
    </div>
  );
}

function Addresses() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["addresses"], queryFn: account.listAddresses });
  const [form, setForm] = useState({ line1: "", area: "", city: "", emirate: "" });
  const add = useMutation({ mutationFn: () => account.addAddress(form), onSuccess: () => { qc.invalidateQueries({ queryKey: ["addresses"] }); setForm({ line1: "", area: "", city: "", emirate: "" }); } });
  const remove = useMutation({ mutationFn: account.removeAddress, onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }) });
  return (
    <div>
      <h2 className="font-display text-lg font-bold text-ink">Saved Addresses</h2>
      <div className="mt-4 space-y-2">
        {(data ?? []).map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3 text-sm">
            <span>{[a.line1, a.area, a.city, a.emirate].filter(Boolean).join(", ")}</span>
            <button onClick={() => remove.mutate(a.id)} className="text-red-600">Remove</button>
          </div>
        ))}
        {!data?.length && <p className="text-sm text-neutral-400">No saved addresses.</p>}
      </div>
      <div className="mt-4 grid max-w-lg grid-cols-2 gap-3">
        <input placeholder="Address" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="col-span-2 rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm" />
        <input placeholder="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm" />
        <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm" />
        <input placeholder="Emirate" value={form.emirate} onChange={(e) => setForm({ ...form, emirate: e.target.value })} className="rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm" />
        <button onClick={() => add.mutate()} disabled={!form.line1} className="btn btn-primary col-span-2 py-2.5">Add address</button>
      </div>
    </div>
  );
}

function Vehicles() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["vehicles"], queryFn: account.listVehicles });
  const [form, setForm] = useState({ brand: "", model: "", year: "" });
  const add = useMutation({ mutationFn: () => account.addVehicle({ brand: form.brand, model: form.model || undefined, year: form.year ? Number(form.year) : undefined }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["vehicles"] }); setForm({ brand: "", model: "", year: "" }); } });
  const remove = useMutation({ mutationFn: account.removeVehicle, onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }) });
  return (
    <div>
      <h2 className="font-display text-lg font-bold text-ink">Saved Vehicles</h2>
      <div className="mt-4 space-y-2">
        {(data ?? []).map((v) => (
          <div key={v.id} className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3 text-sm">
            <span>{[v.brand, v.model, v.year].filter(Boolean).join(" ")}</span>
            <button onClick={() => remove.mutate(v.id)} className="text-red-600">Remove</button>
          </div>
        ))}
        {!data?.length && <p className="text-sm text-neutral-400">No saved vehicles. Add yours for faster inquiries.</p>}
      </div>
      <div className="mt-4 grid max-w-lg grid-cols-3 gap-3">
        <input placeholder="Make" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm" />
        <input placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm" />
        <input placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm" />
        <button onClick={() => add.mutate()} disabled={!form.brand} className="btn btn-primary col-span-3 py-2.5">Add vehicle</button>
      </div>
    </div>
  );
}

function HistoryList({ queryKey, fetcher, render, empty }) {
  const { data, isLoading } = useQuery({ queryKey: [queryKey], queryFn: fetcher });
  if (isLoading) return <p className="text-sm text-neutral-400">Loading…</p>;
  return (
    <div>
      <h2 className="font-display text-lg font-bold text-ink">{queryKey.replace("my-", "").replace(/^\w/, (c) => c.toUpperCase())}</h2>
      <div className="mt-4 space-y-2">
        {(data ?? []).map((row) => (
          <div key={row.id} className="rounded-xl border border-neutral-100 px-4 py-3 text-sm text-neutral-700">{render(row)}</div>
        ))}
        {!data?.length && <p className="text-sm text-neutral-400">{empty}</p>}
      </div>
    </div>
  );
}
