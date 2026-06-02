import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import brakeOfferImg from "../../assets/sections/breakoffer.png";
import airFilterOfferImg from "../../assets/sections/airfitleroffer.png";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function PromoBanners() {
  return (
    <section className="bg-white pt-2 pb-12 md:pt-4 md:pb-16">
      <div className="container-x lg:max-w-[96rem]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Brake Disc & Pad Kit */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="relative bg-white text-ink rounded-[2rem] border border-neutral-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.04)] transition-all duration-500 overflow-hidden flex items-center justify-between p-6 sm:p-8 md:p-10 group min-h-[240px] sm:min-h-[260px]"
          >
            {/* Left Content Area */}
            <div className="flex-1 z-10 pr-2">
              {/* On Sale Accent Badge */}
              <div className="flex items-center gap-1.5 text-[#EF4444] text-[10px] sm:text-xs font-black uppercase tracking-wider">
                <span className="h-[2px] w-4 bg-[#EF4444] rounded-full inline-block" />
                ON SALE
              </div>
              
              {/* Headline */}
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-black text-neutral-950 leading-tight mt-3 max-w-[95%]">
                Brake Disc & Pad Kit<br />
                Up to <span className="text-[#EF4444] font-black">30% Off</span>
              </h2>
              
              {/* Subtitle description */}
              <p className="text-xs sm:text-sm text-neutral-500 mt-2.5 max-w-[85%] leading-relaxed">
                High-performance braking for maximum safety and control.
              </p>
              
              {/* CTA Button */}
              <Link
                to="/catalogue?category=brakes-suspension"
                className="inline-flex items-center justify-center rounded-full bg-[#EF4444] hover:bg-[#D93838] text-white font-bold text-xs sm:text-[13px] px-6 py-2.5 sm:py-3 gap-2 mt-5 sm:mt-6 transition-all duration-300 hover:shadow-[0_6px_20px_rgba(239,68,68,0.25)] active:scale-95"
              >
                <span>Shop Now</span>
                <FiArrowRight size={14} className="stroke-[2.5]" />
              </Link>
            </div>

            {/* Right Image Area */}
            <div className="w-[36%] sm:w-[42%] h-full flex items-center justify-end relative select-none pointer-events-none shrink-0">
              <img
                src={brakeOfferImg}
                alt="Brake Kit Offer"
                className="w-full h-auto object-contain max-h-[170px] sm:max-h-[210px] group-hover:scale-105 group-hover:rotate-1 transition-all duration-700 ease-out"
              />
            </div>
          </motion.div>

          {/* Card 2: Performance Air Filter */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="relative bg-white text-ink rounded-[2rem] border border-neutral-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.04)] transition-all duration-500 overflow-hidden flex items-center justify-between p-6 sm:p-8 md:p-10 group min-h-[240px] sm:min-h-[260px]"
          >
            {/* Left Content Area */}
            <div className="flex-1 z-10 pr-2">
              {/* On Sale Accent Badge */}
              <div className="flex items-center gap-1.5 text-[#EF4444] text-[10px] sm:text-xs font-black uppercase tracking-wider">
                <span className="h-[2px] w-4 bg-[#EF4444] rounded-full inline-block" />
                ON SALE
              </div>
              
              {/* Headline */}
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-black text-neutral-950 leading-tight mt-3 max-w-[95%]">
                Performance Air Filter<br />
                Up to <span className="text-[#EF4444] font-black">30% Off</span>
              </h2>
              
              {/* Subtitle description */}
              <p className="text-xs sm:text-sm text-neutral-500 mt-2.5 max-w-[85%] leading-relaxed">
                Improved airflow. Better performance. Cleaner engine. Longer life.
              </p>
              
              {/* CTA Button */}
              <Link
                to="/catalogue?category=fuel-air"
                className="inline-flex items-center justify-center rounded-full bg-[#0B0B0C] hover:bg-[#1C1C1E] text-white font-bold text-xs sm:text-[13px] px-6 py-2.5 sm:py-3 gap-2 mt-5 sm:mt-6 transition-all duration-300 hover:shadow-[0_6px_20px_rgba(11,11,12,0.15)] active:scale-95"
              >
                <span>Shop Now</span>
                <FiArrowRight size={14} className="stroke-[2.5]" />
              </Link>
            </div>

            {/* Right Image Area */}
            <div className="w-[36%] sm:w-[42%] h-full flex items-center justify-end relative select-none pointer-events-none shrink-0">
              <img
                src={airFilterOfferImg}
                alt="Air Filter Offer"
                className="w-full h-auto object-contain max-h-[150px] sm:max-h-[190px] group-hover:scale-105 group-hover:-rotate-1 transition-all duration-700 ease-out"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
