import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient";
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

const STATIC_BANNERS = [
  {
    id: "static-brakes",
    accentColor: "#EF4444",
    badge: "ON SALE",
    headline: "Brake Disc & Pad Kit",
    highlight: "30% Off",
    subtitle: "High-performance braking for maximum safety and control.",
    ctaLabel: "Shop Now",
    ctaLink: "/catalogue?category=brakes-suspension",
    img: brakeOfferImg,
    imgAlt: "Brake Kit Offer",
    imgRotate: "group-hover:rotate-1",
    imgMaxH: "max-h-[170px] sm:max-h-[210px]",
    ctaBg: "bg-[#EF4444] hover:bg-[#D93838]",
    ctaShadow: "hover:shadow-[0_6px_20px_rgba(239,68,68,0.25)]",
  },
  {
    id: "static-air",
    accentColor: "#EF4444",
    badge: "ON SALE",
    headline: "Performance Air Filter",
    highlight: "30% Off",
    subtitle: "Improved airflow. Better performance. Cleaner engine. Longer life.",
    ctaLabel: "Shop Now",
    ctaLink: "/catalogue?category=fuel-air",
    img: airFilterOfferImg,
    imgAlt: "Air Filter Offer",
    imgRotate: "group-hover:-rotate-1",
    imgMaxH: "max-h-[150px] sm:max-h-[190px]",
    ctaBg: "bg-[#0B0B0C] hover:bg-[#1C1C1E]",
    ctaShadow: "hover:shadow-[0_6px_20px_rgba(11,11,12,0.15)]",
  },
];

function CmsBannerCard({ banner, index }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="relative bg-white text-ink rounded-[2rem] border border-neutral-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.04)] transition-all duration-500 overflow-hidden flex items-center justify-between p-6 sm:p-8 md:p-10 group min-h-[240px] sm:min-h-[260px]"
    >
      <div className="flex-1 z-10 pr-2">
        {banner.subtitle && (
          <div className="flex items-center gap-1.5 text-[#EF4444] text-[10px] sm:text-xs font-black uppercase tracking-wider">
            <span className="h-[2px] w-4 bg-[#EF4444] rounded-full inline-block" />
            {banner.subtitle}
          </div>
        )}
        <h2
          className="font-display text-xl sm:text-2xl md:text-3xl font-black text-neutral-950 leading-tight mt-3 max-w-[95%]"
          dangerouslySetInnerHTML={{ __html: banner.title ?? "" }}
        />
        {banner.link && (
          <Link
            to={banner.link.startsWith("http") ? banner.link : banner.link}
            className="inline-flex items-center justify-center rounded-full bg-[#0B0B0C] hover:bg-[#1C1C1E] text-white font-bold text-xs sm:text-[13px] px-6 py-2.5 sm:py-3 gap-2 mt-5 sm:mt-6 transition-all duration-300 hover:shadow-[0_6px_20px_rgba(11,11,12,0.15)] active:scale-95"
          >
            <span>Shop Now</span>
            <FiArrowRight size={14} className="stroke-[2.5]" />
          </Link>
        )}
      </div>
      {banner.image?.url && (
        <div className="w-[36%] sm:w-[42%] h-full flex items-center justify-end relative select-none pointer-events-none shrink-0">
          <img
            src={banner.image.url}
            alt={banner.title ?? ""}
            className="w-full h-auto object-contain max-h-[170px] sm:max-h-[210px] group-hover:scale-105 transition-all duration-700 ease-out"
          />
        </div>
      )}
    </motion.div>
  );
}

function StaticBannerCard({ b }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="relative bg-white text-ink rounded-[2rem] border border-neutral-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.04)] transition-all duration-500 overflow-hidden flex items-center justify-between p-6 sm:p-8 md:p-10 group min-h-[240px] sm:min-h-[260px]"
    >
      <div className="flex-1 z-10 pr-2">
        <div className="flex items-center gap-1.5 text-[#EF4444] text-[10px] sm:text-xs font-black uppercase tracking-wider">
          <span className="h-[2px] w-4 bg-[#EF4444] rounded-full inline-block" />
          {b.badge}
        </div>
        <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-black text-neutral-950 leading-tight mt-3 max-w-[95%]">
          {b.headline}<br />
          Up to <span className="text-[#EF4444] font-black">{b.highlight}</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-2.5 max-w-[85%] leading-relaxed">
          {b.subtitle}
        </p>
        <Link
          to={b.ctaLink}
          className={`inline-flex items-center justify-center rounded-full ${b.ctaBg} text-white font-bold text-xs sm:text-[13px] px-6 py-2.5 sm:py-3 gap-2 mt-5 sm:mt-6 transition-all duration-300 ${b.ctaShadow} active:scale-95`}
        >
          <span>{b.ctaLabel}</span>
          <FiArrowRight size={14} className="stroke-[2.5]" />
        </Link>
      </div>
      <div className="w-[36%] sm:w-[42%] h-full flex items-center justify-end relative select-none pointer-events-none shrink-0">
        <img
          src={b.img}
          alt={b.imgAlt}
          className={`w-full h-auto object-contain ${b.imgMaxH} group-hover:scale-105 ${b.imgRotate} transition-all duration-700 ease-out`}
        />
      </div>
    </motion.div>
  );
}

export default function PromoBanners() {
  const { data } = useQuery({
    queryKey: ["cms-banners-home-promo"],
    queryFn: async () => {
      const res = await apiClient.get("/banners");
      return (res.data.banners ?? []).filter((b) => b.placement === "home-promo");
    },
    staleTime: 5 * 60 * 1000,
  });

  const cmsBanners = data ?? null;

  return (
    <section className="bg-white pt-2 pb-12 md:pt-4 md:pb-16">
      <div className="container-x lg:max-w-[96rem]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cmsBanners && cmsBanners.length > 0
            ? cmsBanners.map((b, i) => <CmsBannerCard key={b.id} banner={b} index={i} />)
            : STATIC_BANNERS.map((b) => <StaticBannerCard key={b.id} b={b} />)
          }
        </div>
      </div>
    </section>
  );
}
