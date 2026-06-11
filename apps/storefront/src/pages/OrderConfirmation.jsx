import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import useSEO from "../hooks/useSEO";

export default function OrderConfirmation() {
  useSEO({ title: "Order Received" });
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="container-x py-20">
      <div className="mx-auto max-w-lg rounded-3xl border border-neutral-200 bg-white p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <FiCheckCircle size={34} />
        </div>
        <h1 className="mt-5 font-display text-2xl font-black tracking-tight text-ink">
          Thank you{order?.contact?.name ? `, ${order.contact.name}` : ""}!
        </h1>
        <p className="mt-2 text-neutral-600">Your order has been received.</p>

        {order?.orderNumber && (
          <div className="mt-5 inline-block rounded-xl bg-neutral-50 px-5 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Order number</div>
            <div className="text-lg font-black text-ink">{order.orderNumber}</div>
          </div>
        )}

        <p className="mt-6 text-sm text-neutral-500">
          Status: <span className="font-semibold text-ink">{order?.status || "Pending Verification"}</span>.
          Our sales team will contact you shortly to confirm pricing, availability and delivery.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/catalogue" className="btn btn-primary px-6 py-3">Continue Browsing</Link>
          <Link to="/" className="btn btn-outline px-6 py-3">Back Home</Link>
        </div>
      </div>
    </div>
  );
}
