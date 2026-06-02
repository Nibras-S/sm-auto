import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMinus, FiPlus, FiTrash2, FiShield, FiShoppingCart } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useInquiry } from "../../context/InquiryContext";
import { getProductImage } from "../../utils/productImages";
import { inquiryListWaLink } from "../../utils/whatsapp";

const EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
  "Al Ain",
  "Other (GCC)",
];

const emptyCustomer = {
  name: "",
  phone: "",
  carMake: "",
  carModel: "",
  year: "",
  vin: "",
  emirate: "",
  notes: "",
};

export default function InquiryDrawer() {
  const { items, isOpen, closeDrawer, removeItem, setQty, clear, count } =
    useInquiry();
  const [customer, setCustomer] = useState(emptyCustomer);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const update = (key) => (e) =>
    setCustomer((c) => ({ ...c, [key]: e.target.value }));

  const waHref = inquiryListWaLink(items, customer);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            role="dialog"
            aria-label="Inquiry list"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">
                  Your Inquiry Cart
                </h2>
                <p className="text-xs text-neutral-500">
                  {count} item{count !== 1 ? "s" : ""} · No payment now
                </p>
              </div>
              <button
                onClick={closeDrawer}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <EmptyState onClose={closeDrawer} />
              ) : (
                <>
                  {/* Items */}
                  <ul className="space-y-3">
                    {items.map((item) => (
                      <li
                        key={item.slug}
                        className="flex gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/20 p-3.5 transition-all duration-300 hover:border-neutral-200 hover:shadow-soft"
                      >
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={closeDrawer}
                          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white border border-neutral-100"
                        >
                          <img
                            src={getProductImage(item.imageKey)}
                            alt={item.name}
                            className="h-full w-full object-contain p-1.5"
                          />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <Link
                            to={`/product/${item.slug}`}
                            onClick={closeDrawer}
                            className="line-clamp-2 text-xs font-bold text-ink transition-colors duration-300 hover:text-accent-500"
                          >
                            {item.name}
                          </Link>
                          <span className="mt-1 text-[10px] font-semibold text-neutral-400">
                            Part No: <span className="text-neutral-500">{item.partNumber}</span>
                          </span>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center rounded-full border border-neutral-200 bg-white">
                              <button
                                onClick={() => setQty(item.slug, item.qty - 1)}
                                aria-label="Decrease quantity"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors duration-300 hover:text-accent-500"
                              >
                                <FiMinus size={12} />
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-ink">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => setQty(item.slug, item.qty + 1)}
                                aria-label="Increase quantity"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors duration-300 hover:text-accent-500"
                              >
                                <FiPlus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.slug)}
                              aria-label="Remove"
                              className="text-neutral-300 transition-colors duration-300 hover:text-accent-500"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={clear}
                    className="mt-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-accent-500 transition-colors duration-300"
                  >
                    Clear cart
                  </button>

                  {/* Form */}
                  <div className="mt-6 border-t border-neutral-200/60 pt-5">
                    <h3 className="text-sm font-bold text-ink tracking-tight">
                      Your Details{" "}
                      <span className="font-medium text-neutral-400 text-xs">
                        (helps us quote faster)
                      </span>
                    </h3>
                    <div className="mt-3.5 grid grid-cols-2 gap-3">
                      <Field
                        label="Name"
                        value={customer.name}
                        onChange={update("name")}
                        placeholder="Your name"
                        full
                      />
                      <Field
                        label="Car Make"
                        value={customer.carMake}
                        onChange={update("carMake")}
                        placeholder="e.g. BMW"
                      />
                      <Field
                        label="Model"
                        value={customer.carModel}
                        onChange={update("carModel")}
                        placeholder="e.g. 320i"
                      />
                      <Field
                        label="Year"
                        value={customer.year}
                        onChange={update("year")}
                        placeholder="e.g. 2019"
                      />
                      <Field
                        label="VIN / Chassis"
                        value={customer.vin}
                        onChange={update("vin")}
                        placeholder="Optional"
                      />
                      <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Location
                        </label>
                        <select
                          value={customer.emirate}
                          onChange={update("emirate")}
                          className="rounded-xl border border-neutral-200/80 bg-white px-3.5 py-2.5 text-xs font-semibold text-ink outline-none transition-all duration-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/10"
                        >
                          <option value="">Select emirate / region</option>
                          {EMIRATES.map((e) => (
                            <option key={e} value={e}>
                              {e}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Notes
                        </label>
                        <textarea
                          value={customer.notes}
                          onChange={update("notes")}
                          rows={2}
                          placeholder="Anything else we should know?"
                          className="resize-none rounded-xl border border-neutral-200/80 bg-white px-3.5 py-2.5 text-xs font-semibold text-ink outline-none transition-all duration-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/10"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-neutral-200/60 bg-white px-5 py-4">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-wa w-full py-3.5 text-sm font-bold"
                >
                  <FaWhatsapp size={18} />
                  Send Inquiry on WhatsApp
                </a>
                <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[10px] font-semibold text-neutral-400">
                  <FiShield size={12} className="text-accent-500" />
                  We reply with your best price — no obligation.
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, placeholder, full }) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? "col-span-2" : ""}`}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="rounded-xl border border-neutral-200/80 bg-white px-3.5 py-2.5 text-xs font-semibold text-ink outline-none transition-all duration-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/10"
      />
    </div>
  );
}

function EmptyState({ onClose }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <FiShoppingCart size={26} />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-ink">
        Your inquiry cart is empty
      </h3>
      <p className="mt-1 max-w-xs text-sm text-neutral-500">
        Add the parts you need to your cart, then send them all in one WhatsApp message
        for your best price.
      </p>
      <Link to="/catalogue" onClick={onClose} className="btn btn-primary mt-5 px-6 py-3">
        Browse Catalogue
      </Link>
    </div>
  );
}
