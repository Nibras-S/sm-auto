import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import ProductCard from "../ui/ProductCard";
import { featuredProducts, products } from "../../data/products";
import featuredCarImg from "../../assets/sections/featured_car.png";

export default function FeaturedProducts() {
  // We display the top 6 premium parts in the slider/grid
  const list = (featuredProducts.length ? featuredProducts : products).slice(0, 6);
  const sliderRef = useRef(null);

  const handleScroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 304; // Card width (280) + gap (24)
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="products" className="bg-white pt-6 pb-6 md:py-24">
      <div className="container-x lg:max-w-[96rem]">
        
        {/* Responsive Showroom Header Container */}
        <div className="relative overflow-hidden rounded-3xl bg-neutral-950 text-white p-6 md:p-0 md:bg-transparent md:text-ink md:rounded-none min-h-[220px] md:min-h-0 mb-8 md:mb-12">
          
          {/* Background Car Image visible on mobile (with mix-blend) and desktop */}
          <div className="absolute right-0 top-0 bottom-0 w-[55%] md:w-[42%] z-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/75 to-transparent md:from-white md:via-white/70 md:to-transparent z-10" />
            <img
              src={featuredCarImg}
              alt="Sports car headlight close-up"
              className="w-full h-full object-cover object-right opacity-60 md:opacity-95 z-0 mix-blend-screen md:mix-blend-normal"
            />
          </div>

          {/* Header text and slider arrows overlay */}
          <div className="relative z-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-[85%] md:max-w-[55%] flex flex-col">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FBEE21] md:text-accent-500">
                  FEATURE PRODUCTS
                </span>
                <span className="w-8 h-[2px] bg-[#FBEE21] md:bg-accent-500" />
              </div>
              <h2 className="text-[28px] sm:text-3xl md:text-[2.65rem] font-display font-black leading-[1.05] tracking-tight text-white md:text-neutral-900">
                High-Demand Parts
              </h2>
              <p className="mt-2.5 text-xs sm:text-sm text-neutral-400 md:text-neutral-500 font-medium max-w-md">
                Find the right parts, built for performance and reliability.
              </p>
              
              {/* Slider dots on desktop banner */}
              <div className="hidden md:flex items-center gap-1.5 mt-5 z-20">
                <span className="w-2 h-2 rounded-full bg-accent-500" />
                <span className="w-2 h-2 rounded-full bg-neutral-300" />
                <span className="w-2 h-2 rounded-full bg-neutral-300" />
              </div>
              
              {/* Shop Now CTA on mobile */}
              <Link
                to="/catalogue"
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#FBEE21] text-neutral-900 px-5 py-2.5 text-xs font-extrabold transition-all duration-300 hover:scale-105 hover:bg-[#e0d51d] md:hidden w-fit shadow-md"
              >
                Shop Now
              </Link>
            </div>

            {/* Slide Navigation Arrows - hidden on mobile */}
            <div className="hidden md:flex items-center gap-2.5 self-end md:self-auto mb-1 md:mb-0">
              <button
                onClick={() => handleScroll("left")}
                aria-label="Previous slide"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-all duration-300 md:bg-neutral-50 md:border-neutral-200/80 md:text-neutral-600 md:hover:bg-neutral-100"
              >
                <FiArrowLeft size={18} />
              </button>
              <button
                onClick={() => handleScroll("right")}
                aria-label="Next slide"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FBEE21] text-neutral-900 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-[#e0d51d]"
              >
                <FiArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Slider dots on mobile banner */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:hidden z-20">
            <span className="w-2 h-2 rounded-full bg-[#FBEE21]" />
            <span className="w-2 h-2 rounded-full bg-white/30" />
            <span className="w-2 h-2 rounded-full bg-white/30" />
          </div>
        </div>

        {/* DESKTOP/TABLET VIEW: Horizontal Slider Carousel */}
        <div className="hidden md:block relative overflow-visible">
          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto no-scrollbar pb-8 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {list.map((p, i) => (
              <div key={p.slug} className="w-[280px] shrink-0 select-none">
                <ProductCard product={p} index={i} isFeaturedSection={true} />
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE VIEW: Premium Horizontal Card Stack */}
        <div className="mt-4 flex flex-col gap-3.5 md:hidden">
          {list.slice(0, 4).map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} isFeaturedSection={true} />
          ))}
        </div>

        {/* View All CTA Button */}
        <div className="mt-6 flex justify-center">
          <Link
            to="/catalogue"
            className="btn bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl px-6 py-3 font-bold flex items-center justify-center gap-2 text-sm shadow-md transition-all duration-300 hover:scale-105"
          >
            <svg
              className="w-4 h-4 fill-current text-white shrink-0"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>View All Products</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
