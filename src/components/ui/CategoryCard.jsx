import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import { getProductsByCategory } from "../../data/products";

export default function CategoryCard({ category, index = 0 }) {
  const count = getProductsByCategory(category.slug).length;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        to={`/category/${category.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-accent-500/25 hover:shadow-[0_16px_36px_-12px_rgba(10,10,10,0.04),0_8px_24px_-8px_rgba(220,38,38,0.02)]"
      >
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-neutral-50 transition-all duration-700 ease-out group-hover:scale-150 group-hover:bg-accent-50/50" />
        <div className="relative flex items-center justify-between">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-50 border border-neutral-100 transition-all duration-500 group-hover:scale-105 group-hover:bg-white group-hover:border-accent-100 group-hover:shadow-[0_6px_16px_rgba(220,38,38,0.05)]">
            <img
              src={category.icon}
              alt={category.name}
              className="h-9 w-9 object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <FiArrowUpRight
            className="text-neutral-300 transition-all duration-300 group-hover:rotate-45 group-hover:text-accent-500"
            size={22}
          />
        </div>
        <h3 className="relative mt-5 text-base font-bold text-ink transition-colors duration-300 group-hover:text-accent-500">
          {category.name}
        </h3>
        <p className="relative mt-1 text-xs font-semibold leading-relaxed text-neutral-400">
          {category.tagline}
        </p>
        <span className="relative mt-auto pt-4 text-[10px] font-bold uppercase tracking-wider text-accent-500/70 transition-colors duration-300 group-hover:text-accent-500">
          {count > 0 ? `${count} part${count > 1 ? "s" : ""} available` : "Available on inquiry"}
        </span>
      </Link>
    </motion.div>
  );
}
