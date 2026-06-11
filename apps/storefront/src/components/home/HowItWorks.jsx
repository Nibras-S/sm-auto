import React from "react";
import { motion } from "framer-motion";
import { FiSearch, FiList, FiSend, FiPackage } from "react-icons/fi";
import SectionHeading from "../ui/SectionHeading";

const steps = [
  {
    icon: FiSearch,
    title: "Find your part",
    desc: "Search or browse the catalogue by category, brand or part number to find exactly what you need.",
  },
  {
    icon: FiList,
    title: "Add parts to cart",
    desc: "Tap “Add to Cart” on every part you need — or “Request Best Price” for a single item.",
  },
  {
    icon: FiSend,
    title: "Send on WhatsApp",
    desc: "Share your car details and send the list. A pre-filled WhatsApp message does the work for you.",
  },
  {
    icon: FiPackage,
    title: "Get price & delivery",
    desc: "We confirm fitment, send your best price, and arrange fast delivery across the UAE & GCC.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Simple & Fast"
          title="How It Works"
          subtitle="No complicated checkout. Just a clear, four-step path from finding your part to getting it delivered."
        />

        <div className="relative mt-16 flex flex-col gap-10 lg:flex-row lg:gap-8 justify-between">
          
          {/* Desktop Horizontal Connector Line */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent lg:block pointer-events-none" />
          
          {/* Mobile Vertical Timeline Track */}
          <div className="absolute left-[28px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-neutral-200/20 via-neutral-200 to-neutral-200/20 lg:hidden pointer-events-none" />

          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative flex flex-row lg:flex-col items-start lg:items-center text-left lg:text-center gap-5 lg:gap-0"
            >
              {/* Timeline Step Badge */}
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ink text-white shadow-card transition-all duration-300 hover:scale-105">
                <s.icon size={22} className="text-white" />
                <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-accent-500 text-[10px] font-bold text-white shadow-soft">
                  0{i + 1}
                </span>
              </div>

              {/* Step Text Details */}
              <div className="lg:mt-5 flex flex-col">
                <h3 className="text-base font-bold text-ink leading-tight">{s.title}</h3>
                <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-neutral-500">
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
