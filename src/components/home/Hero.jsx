import React from "react";
import { motion } from "framer-motion";
import { FiShield } from "react-icons/fi";
import { Link } from "react-router-dom";
import hero1 from "../../assets/sections/hero1.png";
import hero2 from "../../assets/sections/hero2.png";
import BrandMarquee from "../ui/BrandMarquee";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0B0B0C] lg:bg-[#FAFAFA] pt-6 pb-12 md:pt-8 md:pb-16 lg:pt-10 lg:pb-20">
      <div className="container-x lg:max-w-[96rem]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col lg:flex-row gap-5 lg:gap-6 lg:items-stretch"
        >
          {/* Main Hero Card */}
          <motion.div
            variants={itemVariants}
            className="flex-grow relative bg-[#0B0B0C] text-white rounded-none lg:rounded-[2rem] overflow-hidden shadow-none lg:shadow-glow min-h-[460px] lg:h-[540px] xl:h-[580px]"
          >
            {/* Top Content Area */}
            <div className="relative z-20 px-0 py-8 lg:p-10 xl:p-12 flex flex-col h-full pointer-events-none">

              {/* Eyebrow Badge */}
              <div className="hidden lg:block mb-6 pointer-events-auto">
                <span className="text-[11px] font-normal text-neutral-400 font-display">
                  Sale <span className="text-[#E2F314] font-bold">15% Discount</span>
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] leading-[1.05] tracking-tight text-white lg:max-w-[65%] xl:max-w-[60%] pointer-events-auto">
                <span className="font-light">Reliable</span> <span className="font-semibold">Parts</span><br />
                <span className="font-extrabold">For You</span> <span className="font-light">Can</span><br />
                <span className="font-light">— Trust.</span>
              </h1>

              {/* CTA Button */}
              <div className="mt-8 lg:mt-10 pointer-events-auto">
                <Link
                  to="/catalogue"
                  className="inline-flex items-center justify-center rounded-full bg-[#E2F314] text-[#0B0B0C] px-8 py-3.5 font-bold text-[13px] hover:bg-[#c9da0e] hover:shadow-[0_0_24px_rgba(226,243,20,0.25)] transition-all duration-300 active:scale-95"
                >
                  Shop Now
                </Link>
              </div>
            </div>

            {/* Desktop Car Image (Massively scaled to fill the right half perfectly) */}
            <motion.div
              initial={{ opacity: 0, x: 150 }}
              animate={{ opacity: 0.95, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
              className="hidden lg:flex absolute right-[-6%] bottom-[60px] xl:bottom-[65px] w-[84%] xl:w-[80%] h-[85%] xl:h-[88%] z-0 pointer-events-none select-none items-end justify-end"
            >
              <img
                src={hero1}
                alt="Premium Car"
                className="w-full h-full object-contain object-right-bottom mix-blend-lighten opacity-95"
              />
            </motion.div>

            {/* Mobile Car Image (Flush at bottom-0 now that marquee is outside on mobile) */}
            <motion.div
              initial={{ opacity: 0, x: 120 }}
              animate={{ opacity: 0.9, x: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
              className="block lg:hidden absolute right-[-12%] bottom-0 w-[125%] z-0 pointer-events-none select-none"
            >
              <img
                src={hero1}
                alt="Premium Car"
                className="w-full h-auto object-contain mix-blend-lighten"
              />
            </motion.div>

            {/* Brand Marquee inside the Hero Card (Desktop Only - filling the empty black space at bottom) */}
            <div className="hidden lg:block absolute bottom-6 left-0 right-0 z-20 pointer-events-auto">
              <div className="px-0 lg:px-10 xl:px-12 mb-6 text-center">
                <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold">
                  Trusted parts for the world's finest marques
                </p>
              </div>
              <BrandMarquee />
            </div>
          </motion.div>

          {/* Brand Marquee for brand trusted badges on Mobile (Placed cleanly between Main Hero Card and Brake Kit Card stack) */}
          <div className="block lg:hidden w-full my-4">
            <div className="mb-4 text-center">
              <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold">
                Trusted parts for the world's finest marques
              </p>
            </div>
            <BrandMarquee />
          </div>

          {/* Right Column Stack */}
          <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col gap-5 lg:gap-6 justify-between lg:h-[540px] xl:h-[580px]">

            {/* Top Product Card */}
            <motion.div
              variants={itemVariants}
              className="flex-1 relative bg-[#18181A] text-white rounded-[2rem] p-6 lg:p-8 overflow-hidden flex flex-col justify-between group"
            >
              {/* Product Card Content */}
              <div className="relative z-20">
                <span className="text-[11px] font-medium text-neutral-400">
                  30% <span className="text-yellow-400 font-bold">Big Offer</span>
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-light mt-2 text-neutral-400 leading-[1.2]">
                  Premium <span className="font-bold text-white">Brake</span><br />
                  <span className="font-light text-neutral-400">Up to 25% Offer</span>
                </h2>

                <div className="mt-6 lg:mt-8">
                  <Link
                    to="/catalogue"
                    className="inline-flex items-center justify-center rounded-full bg-[#2A2A2C] border border-white/5 text-white hover:bg-[#333335] px-6 py-2.5 text-[11px] font-medium transition-colors"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>

              {/* Spare parts image MASSIVELY scaled to match the reference */}
              <div className="absolute right-[-15%] bottom-[-5%] w-[120%] h-[110%] z-0 pointer-events-none flex items-end justify-end">
                <img
                  src={hero2}
                  alt="Brake Kit"
                  className="w-full h-full object-contain object-right-bottom mix-blend-lighten opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            </motion.div>

            {/* Trust badge card */}
            <motion.div
              variants={itemVariants}
              className="relative bg-white text-ink rounded-[2rem] p-6 lg:p-7 flex items-center gap-4 sm:gap-5 group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700">
                <FiShield size={16} className="stroke-[2]" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-display text-[12px] sm:text-[13px] text-neutral-500 leading-tight">
                  OEM Quality <span className="font-bold text-neutral-900">Guarantee</span>
                </h3>
                <p className="text-[10px] text-neutral-500 mt-1 leading-snug">
                  Every Part We Sell Meets or Exceeds Original<br />
                  Equipment Specifications.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
