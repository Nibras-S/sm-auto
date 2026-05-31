import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import SectionHeading from "../ui/SectionHeading";
import ProductCard from "../ui/ProductCard";
import { featuredProducts, products } from "../../data/products";

export default function FeaturedProducts() {
  const list = (featuredProducts.length ? featuredProducts : products).slice(0, 8);
  return (
    <section id="products" className="bg-white py-20 md:py-28">
      <div className="container-x">
        <div className="flex flex-col items-end justify-between gap-6 md:flex-row">
          <SectionHeading
            align="left"
            eyebrow="Best Sellers"
            title="Featured Parts"
            subtitle="Hand-picked, in-demand components — request your best price in a tap."
            className="md:mx-0"
          />
          <Link
            to="/catalogue"
            className="group hidden items-center gap-1 text-sm font-semibold text-ink md:inline-flex"
          >
            View full catalogue
            <FiArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link to="/catalogue" className="btn btn-outline px-6 py-3">
            View Full Catalogue
            <FiArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
