import React from "react";
import useSEO from "../hooks/useSEO";
import PageHero from "../components/ui/PageHero";
import CategoryCard from "../components/ui/CategoryCard";
import { categories } from "../data/categories";

export default function Categories() {
  useSEO({
    title: "Categories",
    description:
      "Browse auto spare parts by system — engine, transmission, cooling, brakes, electrical and more — for luxury European and American vehicles.",
  });

  return (
    <>
      <PageHero
        eyebrow="Browse by System"
        title="Part Categories"
        subtitle="Explore our catalogue organised by vehicle system to quickly find the components you need."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Categories" }]}
      />
      <section className="bg-white py-14 md:py-20">
        <div className="container-x grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((c, i) => (
            <CategoryCard key={c.slug} category={c} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
