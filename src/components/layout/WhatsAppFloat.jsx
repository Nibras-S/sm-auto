import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { genericWaLink } from "../../utils/whatsapp";

export default function WhatsAppFloat({ hideOnMobile = false }) {
  const [showLabel, setShowLabel] = useState(false);

  // Auto-peek the label once after a short delay to invite the action
  useEffect(() => {
    const t1 = setTimeout(() => setShowLabel(true), 2600);
    const t2 = setTimeout(() => setShowLabel(false), 7200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <a
      href={genericWaLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      className={`group fixed bottom-6 right-6 z-40 items-center ${
        hideOnMobile ? "hidden md:flex" : "flex"
      }`}
    >
      <AnimatePresence>
        {showLabel && (
          <motion.span
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            className="mr-3 hidden rounded-full bg-ink px-4 py-2 text-sm font-medium text-white shadow-card sm:block"
          >
            Need a part? Chat with us
          </motion.span>
        )}
      </AnimatePresence>
      <span className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-60 animate-pulseRing" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-card-hover transition-transform duration-300 group-hover:scale-110">
          <FaWhatsapp size={28} />
        </span>
      </span>
    </a>
  );
}
