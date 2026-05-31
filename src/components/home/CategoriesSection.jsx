import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import SectionHeading from "../ui/SectionHeading";
import CategoryCard from "../ui/CategoryCard";
import { categories } from "../../data/categories";

export default function CategoriesSection() {
  return (
    <section id="categories" className="bg-neutral-50 py-20 md:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Shop by System"
          title="Parts for Every Part of Your Car"
          subtitle="From engine internals to cooling, braking and electronics — find the right component for your vehicle, organised by system."
        />
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((c, i) => (
            <CategoryCard key={c.slug} category={c} index={i} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/categories" className="btn btn-outline px-6 py-3">
            View All Categories
            <FiArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
