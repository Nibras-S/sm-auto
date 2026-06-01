import React from "react";
import useSEO from "../hooks/useSEO";
import PageHero from "../components/ui/PageHero";
import CategoryCard from "../components/ui/CategoryCard";
import { categories } from "../data/categories";

// High-fidelity 3D spare parts render assets
import engineImg from "../assets/sections/category/Engine&powertrain.png";
import brakesImg from "../assets/sections/category/Brakesystems.png";
import steeringImg from "../assets/sections/category/Suspension&steering.png";
import fuelImg from "../assets/sections/category/Fuel&Aircontrol.png";
import electricalImg from "../assets/sections/category/Battery.png";
import coolingImg from "../assets/sections/category/Cooling & Heating.png";
import oilImg from "../assets/sections/category/Engineoil&L.png";
import transmissionImg from "../assets/sections/category/Transmission.png";

// Flat outline icons for top-left badges
import engineIcon from "../assets/engine.png";
import electricalIcon from "../assets/electrical.png";
import steeringIcon from "../assets/steering.png";
import transmissionIcon from "../assets/transmission.png";
import coolingIcon from "../assets/coolingandheating.png";
import oilIcon from "../assets/lubri.png";
import brakesIcon from "../assets/brasus.png";
import airIcon from "../assets/airintake.png";

// Mapping layout types and custom 3D asset/icon styles to categories
const categoryStyles = {
  engine: {
    type: "tall-white",
    image: engineImg,
    icon: engineIcon,
    tagline: "Peak engine performance & components",
    imageClass: "absolute right-[-4%] bottom-[8%] w-[68%] sm:w-[54%] lg:w-[68%] object-contain transition-all duration-700 ease-out group-hover:scale-105 z-10 pointer-events-none",
  },
  "brakes-suspension": {
    type: "tall-black",
    image: brakesImg,
    icon: brakesIcon,
    tagline: "Superior stopping & ride control",
    imageClass: "absolute right-[-4%] bottom-[8%] w-[68%] sm:w-[54%] lg:w-[68%] object-contain transition-all duration-700 ease-out group-hover:scale-105 z-10 pointer-events-none",
  },
  steering: {
    type: "tall-white",
    image: steeringImg,
    icon: steeringIcon,
    tagline: "Precision steering & response",
    imageClass: "absolute right-[-4%] bottom-[8%] w-[68%] sm:w-[54%] lg:w-[68%] object-contain transition-all duration-700 ease-out group-hover:scale-105 z-10 pointer-events-none",
  },
  transmission: {
    type: "tall-white",
    image: transmissionImg,
    icon: transmissionIcon,
    tagline: "Smooth, seamless gear changes",
    imageClass: "absolute right-[-2%] bottom-[8%] w-[64%] sm:w-[50%] lg:w-[64%] object-contain transition-all duration-700 ease-out group-hover:scale-105 z-10 pointer-events-none",
  },
  "cooling-heating": {
    type: "tall-white",
    image: coolingImg,
    icon: coolingIcon,
    tagline: "Optimal temperature, always",
    imageClass: "absolute right-[-2%] bottom-[8%] w-[64%] sm:w-[50%] lg:w-[64%] object-contain transition-all duration-700 ease-out group-hover:scale-105 z-10 pointer-events-none",
  },
  "electrical-lighting": {
    type: "tall-white",
    image: electricalImg,
    icon: electricalIcon,
    tagline: "Reliable power & maximum safety",
    imageClass: "absolute right-[-2%] bottom-[8%] w-[62%] sm:w-[48%] lg:w-[62%] object-contain transition-all duration-700 ease-out group-hover:scale-105 z-10 pointer-events-none",
  },
  "fuel-air": {
    type: "tall-white",
    image: fuelImg,
    icon: airIcon,
    tagline: "Clean air & efficient fuel delivery",
    imageClass: "absolute right-[-2%] bottom-[8%] w-[66%] sm:w-[52%] lg:w-[66%] object-contain transition-all duration-700 ease-out group-hover:scale-105 z-10 pointer-events-none",
  },
  "oils-lubricants": {
    type: "tall-white",
    image: oilImg,
    icon: oilIcon,
    tagline: "Maximum protection & longevity",
    imageClass: "absolute right-[-2%] bottom-[8%] w-[62%] sm:w-[48%] lg:w-[62%] object-contain transition-all duration-700 ease-out group-hover:scale-105 z-10 pointer-events-none",
  },
};

export default function Categories() {
  useSEO({
    title: "Categories",
    description:
      "Browse auto spare parts by system — engine, transmission, cooling, brakes, electrical and more — for luxury European and American vehicles.",
  });

  // Merge general category data with our high-fidelity designs
  const mappedCategories = categories.map((c) => ({
    ...c,
    ...categoryStyles[c.slug],
  }));

  return (
    <>
      <PageHero
        eyebrow="Browse by System"
        title="Part Categories"
        subtitle="Explore our catalogue organised by vehicle system to quickly find the components you need."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Categories" }]}
      />
      
      {/* Sleek, premium background styling matching CategoriesSection */}
      <section className="bg-[#FAF9F6]/55 py-16 md:py-24 border-t border-neutral-200/30">
        <div className="container-x lg:max-w-[96rem]">
          
          {/* Beautiful Symmetrical Grid Layout for all screen sizes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mappedCategories.map((cat, index) => (
              <div
                key={cat.slug}
                className="h-[280px] sm:h-[320px] md:h-[380px] lg:h-[400px] w-full"
              >
                <CategoryCard category={cat} index={index} isListPage={true} />
              </div>
            ))}
          </div>
          
        </div>
      </section>
    </>
  );
}
