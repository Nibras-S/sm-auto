import React from "react";

/**
 * Film-grain + optional brushed-metal texture overlay for dark sections.
 * Place inside a `relative` container; keep real content at `z-10` or higher.
 */
export default function Grain({ opacity = 0.06, className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 bg-noise bg-repeat mix-blend-overlay ${className}`}
      style={{ opacity, backgroundSize: "180px 180px" }}
    />
  );
}
