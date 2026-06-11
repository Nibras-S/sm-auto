import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO";
import { useAuth } from "../context/AuthContext";
import GoogleButton from "../components/ui/GoogleButton";

export default function Login() {
  useSEO({ title: "Sign In" });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const from = location.state?.from || "/account";

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      navigate(from);
    } catch (err) {
      setError(err?.response?.data?.error?.message || "Login failed");
      setBusy(false);
    }
  }

  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-12">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8">
        <h1 className="font-display text-2xl font-black tracking-tight text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-neutral-500">Sign in to your SpareMec account.</p>
        {error && <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <label className="mt-5 block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-accent-500" />
        </label>
        <label className="mt-3 block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">Password</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-accent-500" />
        </label>
        <div className="mt-1 text-right">
          <Link to="/forgot-password" className="text-xs text-neutral-500 hover:text-ink">Forgot password?</Link>
        </div>
        <button type="submit" disabled={busy} className="btn btn-primary mt-4 w-full py-3 font-bold disabled:opacity-60">
          {busy ? "Signing in…" : "Sign In"}
        </button>
        <div className="mt-4"><GoogleButton /></div>
        <p className="mt-5 text-center text-sm text-neutral-500">
          New here? <Link to="/register" className="font-semibold text-ink hover:underline">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
