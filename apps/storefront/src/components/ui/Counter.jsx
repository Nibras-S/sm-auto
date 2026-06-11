import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * Counts a numeric value up when scrolled into view. Falls back to plain text
 * for non-numeric values (e.g. "GCC-Wide").
 */
export default function Counter({ value, duration = 1600, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(value);

  const match = String(value).match(/^(\D*)(\d[\d,]*)(.*)$/);

  useEffect(() => {
    if (!match || !inView) return;
    const prefix = match[1];
    const target = parseInt(match[2].replace(/,/g, ""), 10);
    const suffix = match[3];
    let raf;
    let start;
    const step = (t) => {
      if (start === undefined) start = t;
      const progress = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setDisplay(`${prefix}${current.toLocaleString()}${suffix}`);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span ref={ref} className={className}>
      {match ? display : value}
    </span>
  );
}
