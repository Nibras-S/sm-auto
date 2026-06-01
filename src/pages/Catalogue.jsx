import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiSliders, FiInbox } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import useSEO from "../hooks/useSEO";
import PageHero from "../components/ui/PageHero";
import ProductCard from "../components/ui/ProductCard";
import { products, productBrands } from "../data/products";
import { categories } from "../data/categories";
import { genericWaLink } from "../utils/whatsapp";

const AVAILABILITIES = ["In Stock", "Limited Stock", "Made to Order"];
const TYPES = ["OEM / Genuine", "OEM-Quality Aftermarket"];

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "name", label: "Name (A–Z)" },
  { value: "brand", label: "Brand (A–Z)" },
  { value: "availability", label: "Availability" },
];

const AVAIL_ORDER = { "In Stock": 0, "Limited Stock": 1, "Made to Order": 2 };

export default function Catalogue() {
  useSEO({
    title: "Parts Catalogue",
    description:
      "Browse genuine and OEM-quality auto spare parts for BMW, Mercedes-Benz, Porsche and Land Rover. Filter by category, brand and availability, then request your best price on WhatsApp.",
  });

  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [brands, setBrands] = useState([]);
  const [avails, setAvails] = useState([]);
  const [types, setTypes] = useState([]);
  const [sort, setSort] = useState("featured");
  const [mobileOpen, setMobileOpen] = useState(false);

  // keep URL in sync (shallow)
  useEffect(() => {
    const next = {};
    if (query) next.q = query;
    if (category !== "all") next.category = category;
    setParams(next, { replace: true });
  }, [query, category]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (value, list, setList) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (brands.length && !brands.includes(p.brand)) return false;
      if (avails.length && !avails.includes(p.availability)) return false;
      if (types.length && !types.includes(p.type)) return false;
      if (q) {
        const hay = `${p.name} ${p.partNumber} ${p.brand} ${p.categoryName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "brand":
          return a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name);
        case "availability":
          return AVAIL_ORDER[a.availability] - AVAIL_ORDER[b.availability];
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
    return result;
  }, [query, category, brands, avails, types, sort]);

  const activeCount =
    (category !== "all" ? 1 : 0) + brands.length + avails.length + types.length;

  const clearAll = () => {
    setQuery("");
    setCategory("all");
    setBrands([]);
    setAvails([]);
    setTypes([]);
  };

  const Filters = (
    <div className="space-y-7">
      {/* Category */}
      <FilterGroup title="Category">
        <RadioRow
          label="All categories"
          checked={category === "all"}
          onChange={() => setCategory("all")}
          count={products.length}
        />
        {categories.map((c) => {
          const count = products.filter((p) => p.category === c.slug).length;
          return (
            <RadioRow
              key={c.slug}
              label={c.name}
              checked={category === c.slug}
              onChange={() => setCategory(c.slug)}
              count={count}
            />
          );
        })}
      </FilterGroup>

      <FilterGroup title="Brand">
        {productBrands.map((b) => (
          <CheckRow
            key={b}
            label={b}
            checked={brands.includes(b)}
            onChange={() => toggle(b, brands, setBrands)}
            count={products.filter((p) => p.brand === b).length}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Availability">
        {AVAILABILITIES.map((a) => (
          <CheckRow
            key={a}
            label={a}
            checked={avails.includes(a)}
            onChange={() => toggle(a, avails, setAvails)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Type">
        {TYPES.map((t) => (
          <CheckRow
            key={t}
            label={t === "OEM / Genuine" ? "Genuine (OEM)" : "OEM-Quality"}
            checked={types.includes(t)}
            onChange={() => toggle(t, types, setTypes)}
          />
        ))}
      </FilterGroup>

      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="text-sm font-medium text-neutral-500 underline-offset-4 hover:text-ink hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <PageHero
        eyebrow="Catalogue"
        title="Find the Right Part for Your Vehicle"
        subtitle="Search by name or part number and filter by category, brand and availability. Every part is fitment-verified before it ships."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Catalogue" }]}
      >
        <div className="relative max-w-xl">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search part name or number (e.g. 11427953129)"
            className="w-full rounded-full border border-white/15 bg-white/10 py-3.5 pl-11 pr-11 text-white placeholder:text-neutral-400 outline-none backdrop-blur focus:border-white/40"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-white"
            >
              <FiX />
            </button>
          )}
        </div>
      </PageHero>

      <section className="bg-white py-10 md:py-14">
        <div className="container-x grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">{Filters}</div>
          </aside>

          {/* Results */}
          <div>
            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between gap-3">
              <p className="text-sm text-neutral-500">
                <span className="font-semibold text-ink">{filtered.length}</span>{" "}
                part{filtered.length !== 1 ? "s" : ""} found
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="btn btn-outline px-4 py-2.5 text-sm lg:hidden"
                >
                  <FiSliders size={16} />
                  Filters
                  {activeCount > 0 && (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-white">
                      {activeCount}
                    </span>
                  )}
                </button>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-full border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-ink"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      Sort: {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {filtered.map((p, i) => (
                  <ProductCard key={p.slug} product={p} index={i} />
                ))}
              </div>
            ) : (
              <EmptyResults onClear={clearAll} />
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 36 }}
              className="fixed left-0 top-0 z-[61] flex h-full w-[85%] max-w-sm flex-col bg-white lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
                <h2 className="font-display text-lg font-bold">Filters</h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">{Filters}</div>
              <div className="border-t border-neutral-200 p-4">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-primary w-full py-3"
                >
                  Show {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function RadioRow({ label, checked, onChange, count }) {
  return (
    <button
      onClick={onChange}
      className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
        checked ? "bg-neutral-100 font-semibold text-ink" : "text-neutral-600 hover:bg-neutral-50"
      }`}
    >
      <span className="flex items-center gap-2">
        <span
          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
            checked ? "border-ink" : "border-neutral-300"
          }`}
        >
          {checked && <span className="h-2 w-2 rounded-full bg-ink" />}
        </span>
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-neutral-400">{count}</span>
      )}
    </button>
  );
}

function CheckRow({ label, checked, onChange, count }) {
  return (
    <button
      onClick={onChange}
      className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
        checked ? "font-semibold text-ink" : "text-neutral-600 hover:bg-neutral-50"
      }`}
    >
      <span className="flex items-center gap-2">
        <span
          className={`flex h-4 w-4 items-center justify-center rounded border ${
            checked ? "border-ink bg-ink text-white" : "border-neutral-300"
          }`}
        >
          {checked && (
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
              <path
                d="M2.5 6.5l2.5 2.5 4.5-5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-neutral-400">{count}</span>
      )}
    </button>
  );
}

function EmptyResults({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <FiInbox size={28} />
      </div>
      <h3 className="mt-4 font-display text-xl font-bold text-ink">
        No parts match your search
      </h3>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        We supply far more than what's listed here. Tell us the part you need and
        we'll source it for you.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={onClear} className="btn btn-outline px-6 py-3">
          Clear filters
        </button>
        <a
          href={genericWaLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-wa px-6 py-3"
        >
          <FaWhatsapp size={18} />
          Ask on WhatsApp
        </a>
      </div>
    </div>
  );
}
