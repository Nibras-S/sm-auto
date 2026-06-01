import React from "react";
import { brands } from "../../data/brands";

export default function BrandMarquee({ className = "", speed = "animate-marquee" }) {
  const row = [...brands, ...brands];
  return (
    <div className={`relative overflow-hidden mask-fade-x ${className}`}>
      <div
        className={`flex w-max items-center gap-10 md:gap-16 ${speed} hover:[animation-play-state:paused]`}
      >
        {row.map((b, i) => (
          <img
            key={i}
            src={b.src}
            alt={b.name}
            title={b.name}
            className="h-9 w-auto shrink-0 object-contain opacity-80 hover:opacity-100 transition-all duration-300 md:h-11"
          />
        ))}
      </div>
    </div>
  );
}
