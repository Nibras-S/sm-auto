import React from "react";

const MAP = {
  "In Stock": { dot: "bg-emerald-500", text: "text-emerald-700", ring: "ring-emerald-100" },
  "Limited Stock": { dot: "bg-amber-500", text: "text-amber-700", ring: "ring-amber-100" },
  "Made to Order": { dot: "bg-neutral-400", text: "text-neutral-600", ring: "ring-neutral-100" },
};

export default function AvailabilityBadge({ availability, className = "" }) {
  const style = MAP[availability] || MAP["Made to Order"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${style.text} ${className}`}
    >
      <span className={`relative flex h-2 w-2`}>
        {availability === "In Stock" && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${style.dot} opacity-60 animate-ping`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${style.dot}`} />
      </span>
      {availability}
    </span>
  );
}
