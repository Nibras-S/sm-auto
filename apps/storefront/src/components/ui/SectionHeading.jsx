import React from "react";
import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
  className = "",
}) {
  const alignCls =
    align === "left" ? "text-left items-start" : "text-center items-center mx-auto";
  return (
    <div className={`flex flex-col ${alignCls} max-w-2xl ${className}`}>
      {eyebrow && (
        <Reveal>
          <span
            className={`eyebrow ${light ? "text-neutral-400" : ""}`}
          >
            <span
              className={`h-0.5 w-6 rounded-full ${
                light ? "bg-white/70" : "bg-accent-500"
              }`}
            />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2
          className={`mt-3 text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-[1.1] ${
            light ? "text-white" : "text-ink"
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.1}>
          <p
            className={`mt-4 text-base md:text-lg leading-relaxed ${
              light ? "text-neutral-300" : "text-neutral-600"
            }`}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
