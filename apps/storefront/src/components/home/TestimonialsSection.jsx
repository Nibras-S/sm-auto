import React from "react";
import Slider from "react-slick";
import { FaQuoteLeft } from "react-icons/fa";
import SectionHeading from "../ui/SectionHeading";
import StarRating from "../ui/StarRating";
import { testimonials } from "../../data/testimonials";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function TestimonialsSection() {
  const list = testimonials.slice(0, 6);
  const avg = (
    testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length
  ).toFixed(1);

  // Slider settings matching user requests: single row, auto-play 1-by-1 on mobile
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    pauseOnHover: true,
    className: "testimonials-slider",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          autoplaySpeed: 3000, // Slightly faster transition on mobile
        },
      },
    ],
  };

  return (
    <section className="bg-white py-20 md:py-28 overflow-hidden">
      <div className="container-x">
        <SectionHeading
          eyebrow="Customer Stories"
          title="Trusted by Owners & Workshops"
          subtitle={`Rated ${avg}/5 by drivers, garages and fleets across the UAE and GCC.`}
        />

        <div className="mt-14 px-1 md:px-0">
          <Slider {...settings}>
            {list.map((t) => (
              <div key={t.name} className="px-3 h-full pb-8 outline-none">
                <figure className="h-full flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft transition-shadow duration-500 hover:shadow-card">
                  <div>
                    <div className="flex items-center justify-between">
                      <FaQuoteLeft className="text-neutral-100" size={24} />
                      <StarRating rating={t.rating} />
                    </div>
                    <blockquote className="mt-4 text-sm leading-relaxed text-neutral-700 italic">
                      “{t.text}”
                    </blockquote>
                  </div>
                  
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-display text-sm font-bold text-white">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-ink leading-tight">{t.name}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {t.role} · {t.location}
                      </div>
                    </div>
                  </figcaption>
                </figure>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}

