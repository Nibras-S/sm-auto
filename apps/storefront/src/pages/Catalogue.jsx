import React, { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiSliders, FiInbox, FiChevronDown } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import useSEO from "../hooks/useSEO";
import ProductCard from "../components/ui/ProductCard";
import { useAllProducts } from "../hooks/useCatalog";
import { searchProducts } from "../lib/catalogApi";
import { categories } from "../data/categories";
import { genericWaLink } from "../utils/whatsapp";
import featuredCarImg from "../assets/sections/featured_car.png";

const AVAILABILITIES = ["Available", "On Request"];
const TYPES = ["OEM / Genuine", "OEM-Quality Aftermarket"];

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "name", label: "Name (A–Z)" },
  { value: "brand", label: "Brand (A–Z)" },
  { value: "availability", label: "Availability" },
];

const AVAIL_ORDER = { Available: 0, "On Request": 1 };

const getCategoryIcon = (slug, isSelected) => {
  const color = isSelected ? "#FBBF24" : "#111827"; // Yellow if selected, black otherwise
  switch (slug) {
    case "engine":
      return (
        <svg className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          {/* Cylinder Block outline */}
          <rect x="4" y="6" width="16" height="12" rx="2" />
          {/* Pistons */}
          <circle cx="8" cy="12" r="2" />
          <circle cx="16" cy="12" r="2" />
          {/* Spark connections */}
          <path d="M12 6V4M8 6V4M16 6V4" />
        </svg>
      );
    case "brakes-suspension":
    case "brakes":
      return (
        <svg className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          {/* Brake Rotor Disc with cooling holes */}
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
          {/* Caliper overlay */}
          <path strokeLinecap="round" d="M16.5 4.5A8 8 0 0119.5 12c0 1.25-.3 2.4-.8 3.5" strokeWidth="2.5" />
        </svg>
      );
    case "suspension":
      return (
        <svg className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          {/* Coilover Shock absorber strut coil */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4M8 6h8M12 6v2M9 8c0 1.5 6 1 6 2.5S9 12 9 13.5s6 1 6 2.5M12 16v4m-3 0h6" />
        </svg>
      );
    case "steering":
      return (
        <svg className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          {/* Steering Wheel details */}
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2.5" />
          <path strokeLinecap="round" d="M12 4v5.5M12 14.5v5.5M4 12h5.5M14.5 12h5.5" />
        </svg>
      );
    case "fuel-air":
      return (
        <svg className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          {/* Air Filter / Intake system */}
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path strokeLinecap="round" d="M8 5v14M12 5v14M16 5v14" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          {/* Gear / Transmission */}
          <circle cx="12" cy="12" r="3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      );
  }
};

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
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false); // Collapsed by default!

  // Live catalog data from the API.
  const { products, productBrands, isLoading } = useAllProducts();

  const trimmedQuery = query.trim();

  const searchQ = useQuery({
    queryKey: ["product-search", trimmedQuery],
    queryFn: () => searchProducts(trimmedQuery),
    enabled: trimmedQuery.length > 0,
    staleTime: 60_000,
  });

  const searchLoading = trimmedQuery ? searchQ.isFetching : isLoading;

  // keep URL in sync (shallow)
  useEffect(() => {
    const next = {};
    if (query) next.q = query;
    if (category !== "all") next.category = category;
    setParams(next, { replace: true });
  }, [query, category]); // eslint-disable-line react-hooks/exhaustive-deps

  // sync state with URL query parameters when it changes externally
  useEffect(() => {
    const urlQuery = params.get("q") || "";
    const urlCategory = params.get("category") || "all";
    if (query !== urlQuery) setQuery(urlQuery);
    if (category !== urlCategory) setCategory(urlCategory);
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (value, list, setList) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const filtered = useMemo(() => {
    // When a text query is active, results come from the backend (MongoDB text index).
    // Structural filters (category, brand, availability, type) are still applied client-side.
    const base = trimmedQuery ? (searchQ.data ?? []) : products;
    let result = base.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (brands.length && !brands.includes(p.brand)) return false;
      if (avails.length && !avails.includes(p.availability)) return false;
      if (types.length && !types.includes(p.type)) return false;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmedQuery, searchQ.data, products, category, brands, avails, types, sort]);

  const activeCount =
    (category !== "all" ? 1 : 0) + brands.length + avails.length + types.length;

  const clearAll = () => {
    setQuery("");
    setCategory("all");
    setBrands([]);
    setAvails([]);
    setTypes([]);
  };

  const handleFilterToggle = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen(true);
    } else {
      setDesktopFiltersOpen((o) => !o);
    }
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
      {/* Unified Premium Black Showroom Header Banner Card */}
      <div className="container-x pt-6">
        <div className="relative overflow-hidden rounded-[24px] bg-neutral-950 text-white p-6 pb-8 md:p-10 md:pb-12 min-h-[200px] md:min-h-[250px]">
          {/* Background Car Image */}
          <div className="absolute right-0 top-0 bottom-0 w-[55%] md:w-[48%] pointer-events-none select-none z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent z-10" />
            <img
              src={featuredCarImg}
              alt="Sports car headlight close-up"
              className="w-full h-full object-cover object-right opacity-70 z-0 mix-blend-screen"
            />
          </div>

          {/* Banner Contents */}
          <div className="relative z-20 flex flex-col justify-between h-full">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 tracking-wide mb-3 md:mb-5">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>&gt;</span>
              <span className="text-white">Catalogue</span>
            </div>

            {/* Heading */}
            <h1 className="text-xl sm:text-2xl md:text-[40px] font-black font-display tracking-tight leading-[1.05] max-w-[75%] md:max-w-[50%] text-white">
              Find the Right Part<br className="md:hidden" /> for Your Vehicle
            </h1>

            {/* Description paragraph (visible on desktop only) */}
            <p className="hidden md:block mt-3.5 text-xs sm:text-sm text-neutral-400 font-medium max-w-[45%] leading-[1.4]">
              Search by name or part number and filter by category, brand and availability. Every part is fitment-verified before it ships.
            </p>

            {/* White Rounded Search bar input */}
            <div className="relative mt-6 md:mt-8 w-full">
              <FiSearch className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 z-30" size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search part name or number (e.g. LR011593)"
                className="w-full rounded-full border border-neutral-100 bg-white py-3.5 md:py-4 pl-12 pr-12 text-xs md:text-sm text-neutral-850 placeholder:text-neutral-400 outline-none shadow-sm focus:shadow-md transition-shadow relative z-10"
              />
              {query ? (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 z-30"
                >
                  <FiX size={15} />
                </button>
              ) : (
                <button
                  onClick={handleFilterToggle}
                  aria-label="Toggle filter settings"
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors z-30"
                >
                  <FiSliders size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white py-8 md:py-12">
        <div className="container-x">
          
          {/* Unified Tool bar matching mockup */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
            {/* Left side parts count */}
            <p className="text-sm text-neutral-500 font-medium order-1">
              <span className="font-black text-neutral-950 text-base">{filtered.length}</span> parts found
            </p>

            {/* Right side filter and sort triggers */}
            <div className="flex items-center gap-3 order-2 md:order-3">
              {/* Pill shaped Filters button (visible on all screens to toggle) */}
              <button
                onClick={handleFilterToggle}
                className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-bold transition-all duration-300 hover:bg-neutral-50 shadow-sm ${
                  desktopFiltersOpen
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-neutral-200 bg-white text-neutral-800"
                }`}
              >
                <FiSliders size={14} />
                <span>Filters</span>
                {activeCount > 0 && (
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black shadow-sm ${
                    desktopFiltersOpen ? "bg-white text-neutral-950" : "bg-accent-500 text-white"
                  }`}>
                    {activeCount}
                  </span>
                )}
              </button>

              {/* Sort Dropdown Selector */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none rounded-full border border-neutral-200 bg-white py-2 pl-5 pr-10 text-sm font-bold text-neutral-800 outline-none transition-all duration-300 hover:border-neutral-300 focus:border-neutral-400 shadow-sm"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      Sort: {s.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              </div>
            </div>
          </div>

          {/* Horizontal Category Tab Pills below toolbar */}
          <div className="mb-8 overflow-visible">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
              {categories.map((c) => {
                const isSelected = category === c.slug;
                return (
                  <button
                    key={c.slug}
                    onClick={() => setCategory(isSelected ? "all" : c.slug)}
                    className={`group flex items-center gap-3 px-5 py-3 rounded-[16px] border text-xs sm:text-sm font-black transition-all duration-500 shrink-0 shadow-sm ${
                      isSelected
                        ? "border-neutral-950 bg-neutral-950 text-white"
                        : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300 hover:-translate-y-0.5"
                    }`}
                  >
                    {getCategoryIcon(c.slug, isSelected)}
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid stack & Main catalog content */}
          <div className={`grid grid-cols-1 gap-8 mt-6 transition-all duration-500 ${
            desktopFiltersOpen ? "lg:grid-cols-[260px_1fr]" : "grid-cols-1"
          }`}>
            {/* Sidebar (desktop - left column, animated on toggle) */}
            {desktopFiltersOpen && (
              <aside className="hidden lg:block">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="sticky top-24 border border-neutral-100 rounded-3xl p-6 bg-[#FAFAFA]"
                >
                  {Filters}
                </motion.div>
              </aside>
            )}

            {/* Results Grid - right column */}
            <div className="w-full">
              {searchLoading ? (
                <div className="py-20 text-center text-neutral-400">Loading parts…</div>
              ) : filtered.length > 0 ? (
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 ${
                  desktopFiltersOpen ? "xl:grid-cols-3" : "xl:grid-cols-4"
                }`}>
                  {filtered.map((p, i) => (
                    <ProductCard key={p.slug} product={p} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyResults onClear={clearAll} />
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Dynamic Slide-out Filter Drawer for all mobile/tablet viewports */}
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
              className="fixed left-0 top-0 z-[61] flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl border-r border-neutral-100 lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
                <h2 className="font-display text-lg font-bold text-ink">Filters</h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-600 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">{Filters}</div>
              <div className="border-t border-neutral-200 p-4 bg-neutral-50">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-primary w-full py-3 font-bold"
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
      <p className="mt-2 max-w-sm text-sm text-neutral-550">
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
