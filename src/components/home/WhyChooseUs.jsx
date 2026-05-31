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
    icon: FiShield,
    title: "Genuine & OEM-Quality",
    desc: "Every part is sourced from trusted channels — authentic OEM or premium OEM-quality alternatives you can rely on.",
  },
  {
    icon: FiCheckCircle,
    title: "Fitment Verified",
    desc: "We confirm compatibility by VIN or chassis before your order ships, so you get the right part the first time.",
  },
  {
    icon: FiTag,
    title: "Best Price on Inquiry",
    desc: "Send your part and we'll come back with our sharpest price — no inflated list prices, no surprises.",
  },
  {
    icon: FiTruck,
    title: "Fast UAE & GCC Delivery",
    desc: "Quick dispatch across the Emirates and reliable shipping to Saudi Arabia, Oman, Qatar, Kuwait and Bahrain.",
  },
  {
    icon: FiHeadphones,
    title: "Real Parts Specialists",
    desc: "Talk to people who actually know these cars. We help identify the right component and what to replace with it.",
  },
  {
    icon: FiAward,
    title: "Warranty & Peace of Mind",
    desc: "Manufacturer and replacement warranties on our parts, with a straightforward resolution if anything's not right.",
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
          subtitle="We make sourcing premium car parts simple, reliable and fairly priced — the way it should be."
        />

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group relative bg-ink p-8 transition-colors duration-500 hover:bg-ink-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white transition-all duration-500 group-hover:bg-white group-hover:text-ink">
                <r.icon size={22} />
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                {r.desc}
              </p>
              <span className="absolute right-6 top-6 font-display text-4xl font-bold text-white/[0.06] transition-colors duration-500 group-hover:text-white/15">
                0{i + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
