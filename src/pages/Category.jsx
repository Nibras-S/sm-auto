import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowRight, FiInbox } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import useSEO from "../hooks/useSEO";
import PageHero from "../components/ui/PageHero";
import ProductCard from "../components/ui/ProductCard";
import { getCategory, categories } from "../data/categories";
import { getProductsByCategory } from "../data/products";
import { genericWaLink } from "../utils/whatsapp";
import NotFound from "./NotFound";

export default function Category() {
  const { slug } = useParams();
  const category = getCategory(slug);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useSEO(
    category
      ? {
          title: `${category.name} Parts`,
          description: `${category.description} Genuine and OEM-quality ${category.name} parts for luxury vehicles, delivered across the UAE & GCC.`,
        }
      : { title: "Category" }
  );

  const all = useMemo(
    () => (category ? getProductsByCategory(category.slug) : []),
    [category]
  );
  const brandOptions = useMemo(
    () => [...new Set(all.map((p) => p.brand))].sort(),
    [all]
  );
  const [brand, setBrand] = useState("all");

  if (!category) return <NotFound />;

  const list = brand === "all" ? all : all.filter((p) => p.brand === brand);
  const others = categories.filter((c) => c.slug !== category.slug).slice(0, 5);

  return (
    <>
      <PageHero
        eyebrow={category.tagline}
        title={`${category.name} Parts`}
        subtitle={category.description}
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Categories", to: "/categories" },
          { label: category.name },
        ]}
      />

      <section className="bg-white py-12 md:py-16">
        <div className="container-x">
          {/* Brand chips */}
          {brandOptions.length > 1 && (
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <Chip active={brand === "all"} onClick={() => setBrand("all")}>
                All brands
              </Chip>
              {brandOptions.map((b) => (
                <Chip key={b} active={brand === b} onClick={() => setBrand(b)}>
                  {b}
                </Chip>
              ))}
            </div>
          )}

          {list.length > 0 ? (
            <>
              <p className="mb-6 text-sm text-neutral-500">
                <span className="font-semibold text-ink">{list.length}</span>{" "}
                part{list.length !== 1 ? "s" : ""} available
              </p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {list.map((p, i) => (
                  <ProductCard key={p.slug} product={p} index={i} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <FiInbox size={28} />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-ink">
                Parts available on inquiry
              </h3>
              <p className="mt-2 max-w-sm text-sm text-neutral-500">
                We can source {category.name.toLowerCase()} parts for most
                vehicles. Send us your part number or vehicle details.
              </p>
              <a
                href={genericWaLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-wa mt-6 px-6 py-3"
              >
                <FaWhatsapp size={18} />
                Ask on WhatsApp
              </a>
            </div>
          )}

          {/* Other categories */}
          <div className="mt-16 border-t border-neutral-200 pt-10">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-400">
              Other Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {others.map((c) => (
                <Link
                  key={c.slug}
                  to={`/category/${c.slug}`}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-600 transition-colors hover:border-ink hover:text-ink"
                >
                  {c.name}
                  <FiArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-ink bg-ink text-white"
          : "border-neutral-200 text-neutral-600 hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
