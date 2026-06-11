import React from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Scroll-reveal wrapper. Fades + slides children in when they enter the viewport.
 */
export default function Reveal({
  children,
  as = "div",
  delay = 0,
  y = 28,
  x = 0,
  duration = 0.7,
  once = true,
  amount = 0.2,
  className = "",
  ...rest
}) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
