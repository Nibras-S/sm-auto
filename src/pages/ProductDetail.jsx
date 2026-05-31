import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMinus,
  FiPlus,
  FiCheck,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiChevronRight,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import useSEO from "../hooks/useSEO";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import AvailabilityBadge from "../components/ui/AvailabilityBadge";
import ProductCard from "../components/ui/ProductCard";
import SectionHeading from "../components/ui/SectionHeading";
import {
  getProductBySlug,
  getRelatedProducts,
} from "../data/products";
import { getProductImage } from "../utils/productImages";
import { productWaLink } from "../utils/whatsapp";
import { useInquiry } from "../context/InquiryContext";
import NotFound from "./NotFound";

const TABS = ["Description", "Specifications", "Fitment"];

export default function ProductDetail() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const { addItem, has, openDrawer, count } = useInquiry();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("Description");

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useSEO(
    product
      ? {
          title: product.name,
          description: product.shortDescription,
        }
      : { title: "Product" }
  );

  if (!product) return <NotFound />;

  const img = getProductImage(product.imageKey);
  const related = getRelatedProducts(product);
  const added = has(product.slug);

  const handleAdd = () => {
    addItem(product, qty);
    if (count === 0) {
      openDrawer();
    }
  };

  return (
    <>
      {/* Breadcrumbs */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="container-x py-4">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Catalogue", to: "/catalogue" },
              { label: product.categoryName, to: `/category/${product.category}` },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <section className="bg-white py-10 md:py-14">
        <div className="container-x grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="group relative aspect-square overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50">
              <div className="absolute inset-0 bg-grid-light bg-[size:26px_26px] opacity-50" />
              <img
                src={img}
                alt={product.name}
                className="relative h-full w-full object-contain p-10 transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <span className="absolute left-5 top-5 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
                {product.brand}
              </span>
              <span className="absolute right-5 top-5 rounded-full border border-neutral-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-700 backdrop-blur">
                {product.type === "OEM / Genuine" ? "Genuine OEM" : "OEM-Quality"}
              </span>
            </div>
            {/* Trust strip */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <TrustMini icon={FiShield} label="Quality assured" />
              <TrustMini icon={FiTruck} label="UAE & GCC delivery" />
              <TrustMini icon={FiRefreshCw} label="Warranty backed" />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Link
              to={`/category/${product.category}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-ink"
            >
              {product.categoryName}
              <FiChevronRight size={14} />
            </Link>

            <h1 className="mt-2 font-display text-2xl font-extrabold leading-tight text-ink md:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="text-sm text-neutral-500">
                Part No:{" "}
                <span className="font-semibold text-ink">{product.partNumber}</span>
              </span>
              <AvailabilityBadge availability={product.availability} />
            </div>

            <p className="mt-5 text-base leading-relaxed text-neutral-600">
              {product.shortDescription}
            </p>

            {/* Highlights */}
            <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-neutral-700">
                  <FiCheck className="mt-0.5 shrink-0 text-emerald-600" size={16} />
                  {h}
                </li>
              ))}
            </ul>

            {/* Price note */}
            <div className="mt-7 rounded-2xl border border-neutral-200 border-l-4 border-l-accent-500 bg-neutral-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-lg font-bold text-ink">
                    Best price on inquiry
                  </div>
                  <p className="text-xs text-neutral-500">
                    Send an inquiry and we'll confirm price, fitment & delivery.
                  </p>
                </div>
                {/* Qty */}
                <div className="flex items-center rounded-full border border-neutral-300 bg-white">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 hover:text-ink"
                  >
                    <FiMinus size={15} />
                  </button>
                  <span className="w-8 text-center font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 hover:text-ink"
                  >
                    <FiPlus size={15} />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <a
                  href={productWaLink(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-wa flex-1 py-3.5"
                >
                  <FaWhatsapp size={19} />
                  Request Best Price
                </a>
                <button
                  onClick={handleAdd}
                  className={`btn flex-1 py-3.5 ${
                    added ? "btn-outline" : "btn-primary"
                  }`}
                >
                  {added ? (
                    <>
                      <FiCheck size={18} /> Added — Add more
                    </>
                  ) : (
                    <>
                      <FiPlus size={18} /> Add to Inquiry
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick specs */}
            <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <QuickSpec label="Condition" value={product.condition} />
              <QuickSpec label="Type" value={product.type} />
              <QuickSpec label="Warranty" value={product.warranty} />
              <QuickSpec label="Brand" value={product.brand} />
            </dl>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-12 md:py-16">
        <div className="container-x max-w-4xl">
          <div className="flex gap-1 rounded-full border border-neutral-200 bg-white p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                  tab === t ? "text-white" : "text-neutral-500 hover:text-ink"
                }`}
              >
                {tab === t && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 -z-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 min-h-[180px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {tab === "Description" && (
                  <div className="prose-sm max-w-none space-y-4 text-neutral-600">
                    {product.description.split("\n\n").map((para, i) => (
                      <p key={i} className="leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                )}

                {tab === "Specifications" && (
                  <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-neutral-100">
                        {product.specs.map((s) => (
                          <tr key={s.label} className="even:bg-neutral-50/60">
                            <th className="w-1/2 px-5 py-3.5 text-left font-medium text-neutral-500">
                              {s.label}
                            </th>
                            <td className="px-5 py-3.5 font-semibold text-ink">
                              {s.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {tab === "Fitment" && (
                  <div>
                    <p className="mb-4 text-sm text-neutral-600">
                      This part is suited to the following vehicles. Always confirm
                      exact fitment with your VIN or chassis number — we verify it
                      before every order.
                    </p>
                    <ul className="space-y-2.5">
                      {product.fitment.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700"
                        >
                          <FiCheck className="mt-0.5 shrink-0 text-emerald-600" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-white py-16 md:py-20">
          <div className="container-x">
            <SectionHeading
              align="left"
              eyebrow="You may also need"
              title="Related Parts"
              className="md:mx-0"
            />
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mobile sticky bar */}
      <div className="sticky bottom-0 z-30 flex items-center gap-2 border-t border-neutral-200 bg-white/95 p-3 backdrop-blur md:hidden">
        <a
          href={productWaLink(product)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-wa flex-1 py-3"
        >
          <FaWhatsapp size={18} />
          Request Price
        </a>
        <button onClick={handleAdd} className="btn btn-primary flex-1 py-3">
          {added ? <FiCheck size={18} /> : <FiPlus size={18} />}
          {added ? "Added" : "Add to Inquiry"}
        </button>
      </div>
    </>
  );
}

function TrustMini({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-2 py-3 text-center">
      <Icon className="text-ink" size={18} />
      <span className="text-[11px] font-medium text-neutral-500">{label}</span>
    </div>
  );
}

function QuickSpec({ label, value }) {
  return (
    <div className="border-b border-neutral-100 pb-2">
      <dt className="text-xs uppercase tracking-wider text-neutral-400">{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
    </div>
  );
}
