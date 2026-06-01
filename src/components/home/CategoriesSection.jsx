import React from "react";
import CategoryCard from "../ui/CategoryCard";

// High-fidelity 3D spare parts render assets
import engineImg from "../../assets/sections/category/Engine&powertrain.png";
import brakesImg from "../../assets/sections/category/Brakesystems.png";
import suspensionImg from "../../assets/sections/category/Suspension&steering.png";
import filtrationImg from "../../assets/sections/category/Filteration.png";
import electricalImg from "../../assets/sections/category/Battery.png";
import lightingImg from "../../assets/sections/category/Headlight.png";

// Flat outline engine icon for Engine card top-left badge
import engineIcon from "../../assets/engine.png";

const homeCategories = [
  {
    slug: "engine",
    name: "Engine & Powertrain",
    tagline: "Peak engine power",
    image: engineImg,
    icon: engineIcon,
    type: "tall-white",
  },
  {
    slug: "brakes-suspension",
    name: "Brake Systems",
    tagline: "Superior stopping force",
    image: brakesImg,
    type: "tall-black",
  },
  {
    slug: "steering",
    name: "Suspension & Steering",
    tagline: "Smooth road control",
    image: suspensionImg,
    type: "small-white",
    imageClass: "absolute right-2 bottom-[10%] w-[58%] sm:w-[50%] lg:w-[85%] lg:bottom-[12%] lg:right-[-12px] object-contain z-10 transition-all duration-700 ease-out group-hover:scale-105 group-hover:translate-x-1",
  },
  {
    slug: "fuel-air",
    name: "Filtration",
    tagline: "Clean engine flow",
    image: filtrationImg,
    type: "small-white",
    imageClass: "absolute right-2 bottom-[10%] w-[58%] sm:w-[50%] lg:w-[85%] lg:bottom-[12%] lg:right-[-10px] object-contain z-10 transition-all duration-700 ease-out group-hover:scale-105 group-hover:translate-x-1",
  },
  {
    slug: "electrical-lighting",
    name: "Electrical",
    tagline: "Reliable power systems",
    image: electricalImg,
    type: "small-white",
    imageClass: "absolute right-2 bottom-[10%] w-[56%] sm:w-[48%] lg:w-[80%] lg:bottom-[18%] lg:left-1/2 lg:-translate-x-1/2 lg:right-auto object-contain z-10 transition-all duration-700 ease-out group-hover:scale-105 group-hover:translate-y-[-4px]",
  },
  {
    slug: "electrical-lighting",
    name: "Lighting",
    tagline: "Maximum road visibility",
    image: lightingImg,
    type: "small-white",
    imageClass: "absolute right-2 bottom-[10%] w-[56%] sm:w-[48%] lg:w-[80%] lg:bottom-[18%] lg:left-1/2 lg:-translate-x-1/2 lg:right-auto object-contain z-10 transition-all duration-700 ease-out group-hover:scale-105 group-hover:translate-y-[-4px]",
  },
  {
    slug: "all",
    name: "View All",
    type: "yellow-cta",
  },
];

export default function CategoriesSection() {
  return (
    <section id="categories" className="bg-[#FAF9F6]/55 py-20 md:py-28 border-t border-neutral-200/30">
      {/* Expanded Max-Width to matches Hero and layouts perfectly */}
      <div className="container-x lg:max-w-[96rem]">
        {/* Minimal Modern Header matching reference screens exactly */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-4xl md:text-5xl font-display font-light text-neutral-500 tracking-tight">
            Shop by <span className="font-extrabold text-neutral-950">Category</span>
          </h2>
          <p className="text-neutral-500 text-sm md:text-base font-medium mt-4 max-w-xl mx-auto leading-relaxed">
            Find the right truck spare parts faster through organized categories designed for easy browsing
          </p>
        </div>

        {/* Desktop Custom Nested Grid Layout (Matching visual aspect ratios perfectly) */}
        <div className="hidden lg:grid grid-cols-12 gap-6 h-[560px]">
          {/* Column 1: Engine & Powertrain */}
          <div className="col-span-4 h-full">
            <CategoryCard category={homeCategories[0]} index={0} />
          </div>

          {/* Column 2: Brake Systems */}
          <div className="col-span-3 h-full">
            <CategoryCard category={homeCategories[1]} index={1} />
          </div>

          {/* Column 3: Right Section Nested Grid */}
          <div className="col-span-5 h-full flex flex-col justify-between gap-6">
            {/* Row 1: Suspension & Filtration (Equal width grids) */}
            <div className="grid grid-cols-2 gap-6 h-[268px]">
              <CategoryCard category={homeCategories[2]} index={2} />
              <CategoryCard category={homeCategories[3]} index={3} />
            </div>

            {/* Row 2: Electrical, Lighting, View All (Equal width grids) */}
            <div className="grid grid-cols-3 gap-6 h-[268px]">
              <CategoryCard category={homeCategories[4]} index={4} />
              <CategoryCard category={homeCategories[5]} index={5} />
              <CategoryCard category={homeCategories[6]} index={6} />
            </div>
          </div>
        </div>

        {/* Mobile Responsive Grid Layout (Reduced mobile tall card heights to matches reference) */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:hidden">
          {/* Engine & Powertrain */}
          <div className="col-span-1 h-[310px] sm:h-[350px]">
            <CategoryCard category={homeCategories[0]} index={0} />
          </div>

          {/* Brake Systems */}
          <div className="col-span-1 h-[310px] sm:h-[350px]">
            <CategoryCard category={homeCategories[1]} index={1} />
          </div>

          {/* Suspension & Steering */}
          <div className="col-span-1 h-[200px] sm:h-[220px]">
            <CategoryCard category={homeCategories[2]} index={2} />
          </div>

          {/* Filtration */}
          <div className="col-span-1 h-[200px] sm:h-[220px]">
            <CategoryCard category={homeCategories[3]} index={3} />
          </div>

          {/* Electrical */}
          <div className="col-span-1 h-[200px] sm:h-[220px]">
            <CategoryCard category={homeCategories[4]} index={4} />
          </div>

          {/* Lighting */}
          <div className="col-span-1 h-[200px] sm:h-[220px]">
            <CategoryCard category={homeCategories[5]} index={5} />
          </div>

          {/* View All Categories full-width banner */}
          <div className="col-span-2 h-[76px] sm:h-[84px]">
            <CategoryCard category={homeCategories[6]} index={6} />
          </div>
        </div>
      </div>
    </section>
  );
}
