import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import heroImg from "../../assets/car3.jpg";
import { genericWaLink } from "../../utils/whatsapp";
import { siteConfig } from "../../config/siteConfig";
import Grain from "../ui/Grain";

export default function CtaBanner() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center text-white md:px-16 md:py-20"
        >
          <img
            src={heroImg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />
          <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-[size:46px_46px] opacity-20" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-accent-500/25 blur-[100px] animate-pulse" />
          <div className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-accent-600/15 blur-[100px]" />
          <Grain opacity={0.08} />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold leading-tight md:text-4xl lg:text-5xl text-white">
              Can't find your part?{" "}
              <span className="text-metal">We'll source it for you.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-neutral-300">
              Send us your part number or vehicle details and our specialists will
              locate it, confirm fitment and quote you the best price — fast.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={genericWaLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-wa px-7 py-3.5"
              >
                <FaWhatsapp size={18} />
                Message us on WhatsApp
              </a>
              <Link
                to="/catalogue"
                className="group btn bg-white text-ink px-7 py-3.5 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgba(255,255,255,0.2)] hover:bg-neutral-50 transition-all duration-300"
              >
                Browse Catalogue
                <FiArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <p className="mt-6 text-sm text-neutral-400">
              Or call us at{" "}
              <a
                href={`tel:+${siteConfig.contact.phoneNumber}`}
                className="font-semibold text-white hover:underline"
              >
                {siteConfig.contact.phoneDisplay}
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
