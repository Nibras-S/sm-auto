import React from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiSearch } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import heroImg from "../../assets/car2.jpg";
import { genericWaLink } from "../../utils/whatsapp";
import BrandMarquee from "../ui/BrandMarquee";
import Grain from "../ui/Grain";

const stats = [
  { value: "20+", label: "Premium Brands" },
  { value: "GCC", label: "Wide Delivery" },
  { value: "100%", label: "Genuine & OEM" },
  { value: "Fast", label: "WhatsApp Quotes" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt=""
          className="h-full w-full object-cover opacity-40 animate-kenburns"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
        <div className="absolute inset-0 bg-grid-dark bg-[size:46px_46px] opacity-[0.15]" />
        {/* Premium multi-spotlight glows */}
        <div className="absolute -left-32 top-1/3 h-[450px] w-[450px] rounded-full bg-accent-500/25 blur-[130px] animate-pulse" />
        <div className="absolute -right-32 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent-600/15 blur-[120px]" />
        <Grain opacity={0.08} />
      </div>

      <div className="container-x relative pb-16 pt-16 md:pb-20 md:pt-24 lg:pt-28">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-200 backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-500" />
            </span>
            Genuine & OEM Parts · UAE & GCC
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl text-white"
          >
            Premium Spare Parts for Cars That{" "}
            <span className="text-metal">Deserve the Best</span>.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-base leading-relaxed text-neutral-300 sm:text-lg"
          >
            Spare Mec supplies genuine and OEM-quality parts for BMW,
            Mercedes-Benz, Porsche, Land Rover and more — fitment-verified and
            delivered across the UAE and GCC. Send your inquiry and get your best
            price on WhatsApp.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/catalogue"
              className="group btn bg-white text-ink px-7 py-3.5 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgba(255,255,255,0.2)] hover:bg-neutral-50 transition-all duration-300"
            >
              <FiSearch size={18} className="transition-transform group-hover:scale-105" />
              Browse Catalogue
              <FiArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={genericWaLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-wa px-7 py-3.5"
            >
              <FaWhatsapp size={18} />
              Request a Part
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={item}
            className="mt-12 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5 text-center backdrop-blur-md transition-all duration-500 hover:border-accent-500/40 hover:bg-white/[0.06] hover:shadow-[0_12px_32px_-8px_rgba(220,38,38,0.25)]"
              >
                <div className="font-display text-2xl font-extrabold text-white transition-all duration-300 group-hover:scale-105 group-hover:text-accent-400">
                  {s.value}
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 transition-colors duration-300 group-hover:text-neutral-200">
                  {s.label}
                </div>
                {/* Thin bottom line glow on hover */}
                <div className="absolute bottom-0 inset-x-6 h-[2px] scale-x-0 rounded-full bg-accent-500 transition-transform duration-500 group-hover:scale-x-100" />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Brand marquee */}
      <div className="relative border-t border-white/10 bg-ink/70 py-6 backdrop-blur">
        <p className="container-x mb-4 text-center text-[11px] uppercase tracking-[0.22em] text-neutral-500">
          Trusted parts for the world's finest marques
        </p>
        <div className="[&_img]:opacity-70 [&_img]:brightness-0 [&_img]:invert">
          <BrandMarquee />
        </div>
      </div>
    </section>
  );
}
