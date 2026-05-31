import React from "react";
import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";
import SectionHeading from "../ui/SectionHeading";
import StarRating from "../ui/StarRating";
import { testimonials } from "../../data/testimonials";

export default function TestimonialsSection() {
  const list = testimonials.slice(0, 6);
  const avg = (
    testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length
  ).toFixed(1);

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Customer Stories"
          title="Trusted by Owners & Workshops"
          subtitle={`Rated ${avg}/5 by drivers, garages and fleets across the UAE and GCC.`}
        />

        <div className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {list.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="break-inside-avoid rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft transition-shadow duration-500 hover:shadow-card"
            >
              <div className="flex items-center justify-between">
                <FaQuoteLeft className="text-neutral-200" size={26} />
                <StarRating rating={t.rating} />
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-neutral-700">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-neutral-100 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-display text-sm font-bold text-white">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">{t.name}</div>
                  <div className="text-xs text-neutral-500">
                    {t.role} · {t.location}
                  </div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
