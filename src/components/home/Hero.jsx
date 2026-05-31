import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiShield } from "react-icons/fi";
import { Link } from "react-router-dom";
import { waLink } from "../../utils/whatsapp";
import hero1 from "../../assets/sections/hero1.png";
import hero2 from "../../assets/sections/hero2.png";
import BrandMarquee from "../ui/BrandMarquee";

const brandsList = [
  "BMW",
  "Mercedes-Benz",
  "Porsche",
  "Land Rover",
  "Audi",
  "Lexus",
  "Toyota",
  "Nissan",
  "Other"
];

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
  const [brand, setBrand] = useState("");
  const [part, setPart] = useState("");
  const [phone, setPhone] = useState("");

  const handleGetQuote = (e) => {
    e.preventDefault();
    if (!brand || !part || !phone) {
      alert("Please fill in all fields to request a quote.");
      return;
    }
    const message = `Hello Spare Mec 👋, I'd like to get a quote for a spare part:
• Vehicle Brand: ${brand}
• Part Required: ${part}
• WhatsApp Number: ${phone}

Could you please confirm availability and pricing? Thank you!`;

    const link = waLink(message);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="relative overflow-hidden bg-[#FAFAFA] pt-6 pb-12 md:pt-8 md:pb-16 lg:pt-10 lg:pb-20">
      <div className="container-x">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 lg:items-stretch"
        >
          {/* Main Hero Card (Spans 8 columns) */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-8 relative bg-[#0B0B0C] text-white rounded-[2rem] overflow-hidden shadow-glow min-h-[500px] lg:h-[540px] xl:h-[580px]"
          >
            {/* Top Content Area */}
            <div className="relative z-20 p-8 lg:p-10 xl:p-12 flex flex-col h-full pointer-events-none">
              
              {/* Eyebrow Badge */}
              <div className="mb-6 pointer-events-auto">
                <span className="text-[11px] font-normal text-neutral-400 font-display">
                  Sale <span className="text-yellow-400 font-bold">15% Discount</span>
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-light leading-[1.05] tracking-tight text-white lg:max-w-[65%] xl:max-w-[60%] pointer-events-auto">
                Reliable <span className="font-extrabold">Parts</span><br />
                For You Can<br />
                <span className="opacity-95">— Trust.</span>
              </h1>

              {/* CTA Button */}
              <div className="mt-8 lg:mt-10 pointer-events-auto">
                <Link
                  to="/catalogue"
                  className="inline-flex items-center justify-center rounded-full bg-yellow-400 text-ink px-8 py-3.5 font-bold text-[13px] hover:bg-yellow-500 transition-colors duration-300 active:scale-95"
                >
                  Shop Now
                </Link>
              </div>
            </div>

            {/* Desktop Car Image (Massively scaled to fill the right half perfectly) */}
            <div className="hidden lg:flex absolute right-[-5%] bottom-[88px] xl:bottom-[92px] w-[75%] xl:w-[70%] h-[80%] z-0 pointer-events-none select-none items-end justify-end">
              <img
                src={hero1}
                alt="Premium Car"
                className="w-full h-full object-contain object-right-bottom mix-blend-lighten opacity-95"
              />
            </div>

            {/* Mobile Car Image */}
            <div className="block lg:hidden absolute right-[-10%] bottom-[130px] w-[110%] z-0 pointer-events-none select-none opacity-90">
              <img
                src={hero1}
                alt="Premium Car"
                className="w-full h-auto object-contain mix-blend-lighten"
              />
            </div>

            {/* Full-width Lead Gen Form Panel at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] p-5 sm:p-6 lg:px-10 lg:py-6 z-30 rounded-b-[2rem]">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 xl:gap-8">
                
                {/* Form Title */}
                <div className="flex-shrink-0">
                  <h3 className="font-display text-[13px] font-bold text-white leading-snug">
                    <span className="text-neutral-400 font-normal">Need a</span> Spare Part?
                  </h3>
                </div>

                {/* Form Inputs */}
                <form onSubmit={handleGetQuote} className="flex flex-wrap lg:flex-nowrap items-end gap-3 lg:gap-4 flex-grow justify-end w-full lg:w-auto">
                  {/* Vehicle Brand */}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[110px] max-w-[160px]">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider pl-1">Vehicle Brand</label>
                    <div className="relative">
                      <select
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full rounded-full bg-[#2A2A2A] border border-white/5 px-4 text-xs text-white focus:outline-none focus:border-neutral-500 transition-colors h-[42px] appearance-none"
                      >
                        <option value="" className="bg-ink">Select Brand</option>
                        {brandsList.map((b) => (
                          <option key={b} value={b} className="bg-ink">{b}</option>
                        ))}
                      </select>
                      {/* Custom select arrow */}
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-[10px]">▼</div>
                    </div>
                  </div>

                  {/* Part Required */}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[130px] max-w-[180px]">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider pl-1">Part Required</label>
                    <input
                      type="text"
                      placeholder="e.g. Brake Pads"
                      value={part}
                      onChange={(e) => setPart(e.target.value)}
                      className="w-full rounded-full bg-[#2A2A2A] border border-white/5 px-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors h-[42px]"
                    />
                  </div>

                  {/* WhatsApp Contact */}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[120px] max-w-[160px]">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider pl-1">WhatsApp No.</label>
                    <input
                      type="tel"
                      placeholder="e.g. +971..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-full bg-[#2A2A2A] border border-white/5 px-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors h-[42px]"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-[42px] h-[42px] lg:w-[42px] flex-shrink-0 inline-flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 text-ink transition-colors mt-2 lg:mt-0"
                    aria-label="Get Quote"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Right Column Stack (Spans 4 columns) */}
          <div className="lg:col-span-4 flex flex-col gap-5 lg:gap-6 justify-between lg:h-[540px] xl:h-[580px]">
            
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

      {/* Brand Marquee for brand trusted badges */}
      <div className="relative mt-12 sm:mt-16">
        <div className="container-x mb-4 text-center">
          <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold">
            Trusted parts for the world's finest marques
          </p>
        </div>
        <div className="opacity-40 hover:opacity-60 transition-opacity duration-300 [&_img]:opacity-60 [&_img]:brightness-0">
          <BrandMarquee />
        </div>
      </div>
    </section>
  );
}
