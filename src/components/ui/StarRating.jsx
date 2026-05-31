import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

export default function StarRating({ rating = 5, size = 14, className = "" }) {
  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) =>
        i < rating ? (
          <FaStar key={i} size={size} className="text-ink" />
        ) : (
          <FaRegStar key={i} size={size} className="text-neutral-300" />
        )
      )}
    </div>
  );
}
