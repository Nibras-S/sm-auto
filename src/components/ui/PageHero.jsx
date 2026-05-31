import React from "react";
import { motion } from "framer-motion";
import Breadcrumbs from "./Breadcrumbs";
import Grain from "./Grain";

export default function PageHero({ eyebrow, title, subtitle, breadcrumbs, children }) {
  return (
    <section className="relative overflow-hidden bg-metal-radial text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-[size:46px_46px] opacity-[0.15]" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent-500/15 blur-3xl" />
      <Grain opacity={0.07} />
      <div className="accent-rule pointer-events-none absolute inset-x-0 bottom-0 h-px" />
      <div className="container-x relative py-12 md:py-16">
        {breadcrumbs && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5"
          >
            <Breadcrumbs items={breadcrumbs} light />
          </motion.div>
        )}
        {eyebrow && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="eyebrow text-neutral-400"
          >
            {eyebrow}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-3 max-w-3xl font-display text-3xl font-extrabold leading-tight md:text-4xl lg:text-5xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-300 md:text-lg"
          >
            {subtitle}
          </motion.p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
