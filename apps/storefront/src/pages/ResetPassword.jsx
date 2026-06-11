import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useSEO from "../hooks/useSEO";
import { resetPassword } from "../lib/accountApi";

export default function ResetPassword() {
  useSEO({ title: "Reset Password" });
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err?.response?.data?.error?.message || "Invalid or expired reset link");
      setBusy(false);
    }
  }

  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-12">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8">
        <h1 className="font-display text-2xl font-black tracking-tight text-ink">Set a new password</h1>
        {!token ? (
          <p className="mt-3 text-sm text-red-600">Missing reset token. Please use the link from your email.</p>
        ) : done ? (
          <p className="mt-3 text-sm text-green-600">Password updated. Redirecting to sign in…</p>
        ) : (
          <form onSubmit={submit}>
            {error && <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (min 8 chars)" className="mt-4 w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-accent-500" />
            <button type="submit" disabled={busy} className="btn btn-primary mt-4 w-full py-3 font-bold disabled:opacity-60">
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
        <p className="mt-5 text-center text-sm text-neutral-500">
          <Link to="/login" className="font-semibold text-ink hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
