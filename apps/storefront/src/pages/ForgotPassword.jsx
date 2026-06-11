import React, { useState } from "react";
import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO";
import { forgotPassword } from "../lib/accountApi";

export default function ForgotPassword() {
  useSEO({ title: "Forgot Password" });
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await forgotPassword(email);
    } catch {
      /* ignore */
    }
    setSent(true);
    setBusy(false);
  }

  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-12">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8">
        <h1 className="font-display text-2xl font-black tracking-tight text-ink">Reset password</h1>
        {sent ? (
          <p className="mt-3 text-sm text-neutral-600">
            If an account exists for <strong>{email}</strong>, we've sent a reset link. Please check your email.
          </p>
        ) : (
          <form onSubmit={submit}>
            <p className="mt-1 text-sm text-neutral-500">Enter your email and we'll send a reset link.</p>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="mt-4 w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-accent-500" />
            <button type="submit" disabled={busy} className="btn btn-primary mt-4 w-full py-3 font-bold disabled:opacity-60">
              {busy ? "Sending…" : "Send reset link"}
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
