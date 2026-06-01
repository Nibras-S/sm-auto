import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiArrowRight } from "react-icons/fi";
import { getProductsByCategory } from "../../data/products";

export default function CategoryCard({ category, index = 0 }) {
  // If the category has a special design type, render the premium homepage grid variant
  if (category.type) {
    const isTallWhite = category.type === "tall-white";
    const isTallBlack = category.type === "tall-black";
    const isSmallWhite = category.type === "small-white";
    const isYellowCta = category.type === "yellow-cta";

    // Set layout classes based on card type (reduced corner roundness to rounded-2xl to match reference exactly)
    let cardClasses = "";
    if (isTallWhite) {
      cardClasses = "relative block overflow-hidden rounded-2xl border border-neutral-200/50 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] group h-full";
    } else if (isTallBlack) {
      cardClasses = "relative block overflow-hidden rounded-2xl bg-[#0A0A0A] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.25)] group h-full border border-white/5";
    } else if (isSmallWhite) {
      cardClasses = "relative block overflow-hidden rounded-2xl border border-neutral-200/50 bg-white p-5 sm:p-6 lg:p-7 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.05)] group h-full";
    } else if (isYellowCta) {
      cardClasses = "relative block overflow-hidden rounded-2xl bg-[#F4E100] p-5 sm:p-6 lg:p-7 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_-12px_rgba(244,225,0,0.2)] group h-full border border-[#D5CC00]";
    }

    const cardContent = (
      <>
        {/* Render Tall White (Engine & Powertrain) */}
        {isTallWhite && (
          <div className="h-full w-full relative">
            {/* Top-left Motor Outline Icon Badge - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block absolute lg:top-9 lg:left-9 z-20">
              {category.icon && (
                <div className="w-14 h-14 rounded-full bg-neutral-100/90 border border-neutral-200/30 flex items-center justify-center text-neutral-600 transition-colors duration-300 group-hover:bg-neutral-50 shadow-sm">
                  <img src={category.icon} alt="" className="w-7 h-7 object-contain opacity-80" />
                </div>
              )}
            </div>
            
            {/* Title & Tagline Content - Placed at top-6 left-6 on Mobile, Centered on Desktop */}
            <div className="absolute left-6 top-6 lg:left-9 lg:top-1/2 lg:-translate-y-1/2 z-20 max-w-[85%] lg:max-w-[50%] pointer-events-none">
              <h3 className="font-display font-black text-[17px] sm:text-lg lg:text-[2.35rem] text-neutral-900 leading-[1.08] lg:leading-[1.05] tracking-tight">
                Engine &amp;<br />
                Powertrain
              </h3>
              <p className="text-neutral-500 text-[10px] sm:text-xs lg:text-[14px] font-medium mt-1 lg:mt-2.5">
                {category.tagline}
              </p>
            </div>

            {/* Massively scaled floating engine 3D image */}
            <img
              src={category.image}
              alt={category.name}
              className="absolute right-[-8%] bottom-[11%] lg:top-1/2 lg:-translate-y-1/2 lg:bottom-auto lg:right-4 w-[109%] sm:w-[98%] lg:w-[65%] max-w-none object-contain transition-all duration-700 ease-out group-hover:scale-105 group-hover:translate-x-1 z-10"
            />

            {/* Bottom-left Arrow Button - Moved left-3 and bottom-3 on mobile as requested */}
            <div className="absolute bottom-3 left-3 lg:bottom-9 lg:left-9 z-20">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-950 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-neutral-800 group-hover:scale-105 shadow-md">
                <FiArrowRight size={18} className="sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
        )}

        {/* Render Tall Black (Brake Systems) */}
        {isTallBlack && (
          <div className="h-full w-full relative">
            {/* Top-left Title Content */}
            <div className="absolute top-6 left-6 lg:top-9 lg:left-9 z-20">
              <h3 className="font-display font-black text-[17px] sm:text-lg lg:text-[2.35rem] text-white leading-[1.08] lg:leading-[1.05] tracking-tight">
                {category.name}
              </h3>
              <p className="text-neutral-400 text-[10px] sm:text-xs lg:text-[14px] font-medium mt-1 lg:mt-2">
                {category.tagline}
              </p>
            </div>

            {/* Massively scaled Brake Rotor 3D image */}
            <img
              src={category.image}
              alt={category.name}
              className="absolute bottom-[11%] lg:bottom-[15%] left-1/2 -translate-x-1/2 w-[109%] sm:w-[98%] lg:w-[100%] xl:w-[105%] max-w-none object-contain transition-all duration-700 ease-out group-hover:scale-105 group-hover:translate-y-[-4px] z-10"
            />

            {/* Bottom-left Arrow Button - Moved left-3 and bottom-3 on mobile as requested */}
            <div className="absolute bottom-3 left-3 lg:bottom-9 lg:left-9 z-20">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-white/15 group-hover:scale-105 shadow-md">
                <FiArrowRight size={18} className="sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
        )}

        {/* Render Small White (Suspension, Filtration, Electrical, Lighting) */}
        {isSmallWhite && (
          <div className="flex flex-col h-full relative w-full">
            {/* Top-left Title */}
            <div className="z-20 max-w-[85%] lg:max-w-[70%]">
              <h3 className="font-display font-black text-[13.5px] sm:text-base lg:text-[1.3rem] text-neutral-900 leading-[1.1] lg:leading-[1.12] tracking-tight">
                {category.name}
              </h3>
              <p className="text-neutral-400 text-[9.5px] sm:text-xs lg:text-[13px] font-medium mt-1 leading-snug">
                {category.tagline}
              </p>
            </div>

            {/* Dynamic Float 3D Part Image */}
            <img
              src={category.image}
              alt={category.name}
              className={category.imageClass || "absolute right-[-4%] lg:right-[-6%] bottom-1/2 lg:bottom-1/2 translate-y-[52%] lg:translate-y-[50%] w-[54%] sm:w-[52%] lg:w-[65%] max-w-none object-contain transition-all duration-700 ease-out group-hover:scale-105 group-hover:translate-x-1 z-10"}
            />

            {/* Bottom-right Arrow Button on Desktop, Bottom-left on Mobile */}
            <div className="mt-auto z-20 flex justify-start lg:justify-end pt-10 lg:pt-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-neutral-200/60 shadow-sm flex items-center justify-center text-neutral-950 transition-all duration-300 group-hover:scale-105 group-hover:shadow group-hover:border-neutral-300">
                <FiArrowRight size={14} className="sm:w-[15px] sm:h-[15px]" />
              </div>
            </div>
          </div>
        )}

        {/* Render Yellow CTA (View All) */}
        {isYellowCta && (
          <div className="h-full w-full flex items-center justify-between">
            {/* Mobile View */}
            <div className="flex items-center justify-between w-full lg:hidden">
              <span className="font-display font-black text-neutral-950 text-base">
                View All Categories
              </span>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-neutral-950 flex items-center justify-center text-[#F4E100]">
                <FiArrowUpRight size={18} className="stroke-[2.5]" />
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:flex flex-col items-center justify-center w-full h-full text-center py-6">
              <div className="w-12 h-12 rounded-full bg-neutral-950 flex items-center justify-center text-[#F4E100] mb-4 transition-transform duration-300 group-hover:scale-110">
                <FiArrowUpRight size={22} className="stroke-[2.5]" />
              </div>
              <span className="font-display font-black text-neutral-950 text-lg">
                View All
              </span>
            </div>
          </div>
        )}
      </>
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full"
      >
        <Link to={isYellowCta ? "/categories" : `/category/${category.slug}`} className={cardClasses}>
          {cardContent}
        </Link>
      </motion.div>
    );
  }

  // Original fallback card layout (used in Categories list page)
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
