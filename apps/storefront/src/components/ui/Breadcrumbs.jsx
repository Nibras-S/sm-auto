import React from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

export default function Breadcrumbs({ items = [], light = false }) {
  const base = light ? "text-neutral-400" : "text-neutral-500";
  const active = light ? "text-white" : "text-ink";
  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-sm">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="inline-flex items-center gap-1">
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className={`${base} hover:${active} transition-colors link-underline`}
              >
                {item.label}
              </Link>
            ) : (
              <span className={`${isLast ? active + " font-medium" : base}`}>
                {item.label}
              </span>
            )}
            {!isLast && (
              <FiChevronRight className={`${base} opacity-60`} size={14} />
            )}
          </span>
        );
      })}
    </nav>
  );
}
