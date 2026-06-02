import React from "react";
import { motion } from "framer-motion";
import {
  FiShield,
  FiCheckCircle,
  FiTag,
  FiTruck,
  FiHeadphones,
  FiAward,
} from "react-icons/fi";
import SectionHeading from "../ui/SectionHeading";
import Grain from "../ui/Grain";

export const reasons = [
  {
    icon: FiTag,
    title: "Best Price on Inquiry",
    desc: "Send your part details and get our absolute best price — fast.",
  },
  {
    icon: FiTruck,
    title: "UAE & GCC Delivery",
    desc: "Quick shipping across the Emirates & all GCC countries.",
  },
  {
    icon: FiHeadphones,
    title: "Real Specialists",
    desc: "Talk directly to experts who actually know these cars.",
  },
  {
    icon: FiAward,
    title: "Peace of Mind",
    desc: "Full manufacturer & replacement warranties on all parts.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-metal-radial py-20 text-white md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-[size:46px_46px] opacity-[0.15]" />
      <div className="pointer-events-none absolute -right-20 top-10 h-96 w-96 rounded-full bg-accent-500/15 blur-[120px]" />
      <Grain opacity={0.07} />
      <div className="container-x relative">
        <SectionHeading
          light
          eyebrow="Why Spare Mec"
          title="Built on Trust, Quality & Speed"
          subtitle="We make sourcing premium car parts simple, reliable and fairly priced, the way it should be."
        />

        {/* Compact 2-column mobile grid & balanced 2-column desktop grid */}
        <div className="mt-14 grid grid-cols-2 gap-2.5 sm:gap-6 -mx-2 xs:-mx-4 sm:mx-0">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group relative bg-ink p-4 xs:p-6 sm:p-8 rounded-2xl border border-white/10 transition-colors duration-500 hover:bg-ink-soft"
            >
              <div className="flex h-8 w-8 xs:h-11 xs:w-11 items-center justify-center rounded-lg xs:rounded-xl bg-white/10 text-white transition-all duration-500 group-hover:bg-white group-hover:text-ink">
                <r.icon className="w-4 h-4 xs:w-5 xs:h-5" />
              </div>
              <h3 className="mt-3.5 xs:mt-5 text-sm xs:text-base sm:text-lg font-bold text-white">{r.title}</h3>
              <p className="mt-1.5 text-[10px] xs:text-xs sm:text-sm leading-normal xs:leading-relaxed text-neutral-400">
                {r.desc}
              </p>
              <span className="absolute right-4 top-4 xs:right-6 xs:top-6 font-display text-2xl xs:text-4xl font-bold text-white/[0.04] transition-colors duration-500 group-hover:text-white/10 hidden xs:block">
                0{i + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
