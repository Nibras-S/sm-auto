import React from "react";
import SectionHeading from "../ui/SectionHeading";
import BrandMarquee from "../ui/BrandMarquee";
import Reveal from "../ui/Reveal";

export default function BrandsSection() {
  return (
    <section id="brands" className="border-y border-neutral-200 bg-neutral-50 py-20 md:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Brands We Service"
          title="Parts for the World's Finest Marques"
          subtitle="We supply genuine and OEM-quality components for leading European and American manufacturers."
        />
      </div>
      <Reveal className="mt-12 space-y-8">
        <BrandMarquee />
        <BrandMarquee speed="animate-marquee-slow" />
      </Reveal>
    </section>
  );
}
