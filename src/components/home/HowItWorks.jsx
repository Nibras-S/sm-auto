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
    title: "Add to inquiry list",
    desc: "Tap “Add to Inquiry” on every part you need — or “Request Best Price” for a single item.",
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

        <div className="relative mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent lg:block" />
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white shadow-card">
                <s.icon size={22} />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-accent-500 text-xs font-bold text-white shadow-soft">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-base font-bold text-ink">{s.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-neutral-500">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
