import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlus, FiCheck } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { getProductImage } from "../../utils/productImages";
import { productWaLink } from "../../utils/whatsapp";
import { useInquiry } from "../../context/InquiryContext";
import AvailabilityBadge from "./AvailabilityBadge";

export default function ProductCard({ product, index = 0 }) {
  const { addItem, has, openDrawer, count } = useInquiry();
  const added = has(product.slug);
  const img = getProductImage(product.imageKey);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    if (count === 0) {
      openDrawer();
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition-all duration-500 hover:border-accent-500/25 hover:shadow-[0_16px_36px_-12px_rgba(10,10,10,0.05),0_10px_30px_-10px_rgba(220,38,38,0.03)] hover:-translate-y-1"
    >
      <Link to={`/product/${product.slug}`} className="flex flex-col flex-1">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-neutral-50/65">
          <div className="absolute inset-0 bg-grid-light bg-[size:22px_22px] opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-tr from-accent-500/0 via-transparent to-accent-500/0 opacity-0 group-hover:opacity-100 group-hover:from-accent-500/[0.02] group-hover:to-accent-500/[0.05] transition-all duration-700 ease-out" />
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="relative h-full w-full object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Chips */}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            <span className="rounded-full bg-ink/90 backdrop-blur-sm px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
              {product.brand}
            </span>
          </div>
          <span className="absolute right-3 top-3 rounded-full border border-neutral-200 bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-neutral-500 backdrop-blur-sm shadow-sm">
            {product.type === "OEM / Genuine" ? "Genuine" : "OEM-Quality"}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-4.5">
          <AvailabilityBadge availability={product.availability} />
          <h3 className="mt-2.5 line-clamp-2 text-sm font-bold leading-snug text-ink transition-colors duration-300 group-hover:text-accent-500">
            {product.name}
          </h3>
          <p className="mt-1.5 text-xs font-semibold text-neutral-400">
            Part No: <span className="text-neutral-500">{product.partNumber}</span>
          </p>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-stretch gap-2 px-3.5 pb-3.5 sm:px-4 sm:pb-4">
        <a
          href={productWaLink(product)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="btn btn-wa min-w-0 flex-1 px-2 py-2.5 text-xs font-bold"
        >
          <FaWhatsapp size={15} className="shrink-0" />
          <span className="truncate">
            <span className="sm:hidden">Get Price</span>
            <span className="hidden sm:inline">Request Price</span>
          </span>
        </a>
        <button
          onClick={handleAdd}
          aria-label={added ? "Added to inquiry" : "Add to inquiry"}
          className={`flex h-auto w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 sm:w-11 ${
            added
              ? "border-accent-500 bg-accent-500 text-white shadow-[0_4px_12px_rgba(220,38,38,0.35)]"
              : "border-neutral-200 text-ink bg-white hover:border-accent-500 hover:text-accent-500 hover:shadow-[0_4px_12px_rgba(220,38,38,0.1)]"
          }`}
        >
          {added ? <FiCheck size={17} /> : <FiPlus size={17} />}
        </button>
      </div>
    </motion.article>
  );
}
