import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO";
import { useAuth } from "../context/AuthContext";
import GoogleButton from "../components/ui/GoogleButton";

export default function Register() {
  useSEO({ title: "Create Account" });
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(form.name, form.email, form.password);
      navigate("/account");
    } catch (err) {
      setError(err?.response?.data?.error?.message || "Could not create account");
      setBusy(false);
    }
  }

  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-12">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8">
        <h1 className="font-display text-2xl font-black tracking-tight text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-neutral-500">Faster checkout, saved vehicles & order history.</p>
        {error && <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        {[
          { k: "name", label: "Full name", type: "text" },
          { k: "email", label: "Email", type: "email" },
          { k: "password", label: "Password (min 8 chars)", type: "password" },
        ].map((f) => (
          <label key={f.k} className="mt-3 block text-sm">
            <span className="mb-1 block font-medium text-neutral-700">{f.label}</span>
            <input type={f.type} required value={form[f.k]} onChange={update(f.k)} className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-accent-500" />
          </label>
        ))}
        <button type="submit" disabled={busy} className="btn btn-primary mt-4 w-full py-3 font-bold disabled:opacity-60">
          {busy ? "Creating…" : "Create Account"}
        </button>
        <div className="mt-4"><GoogleButton /></div>
        <p className="mt-5 text-center text-sm text-neutral-500">
          Already have an account? <Link to="/login" className="font-semibold text-ink hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
