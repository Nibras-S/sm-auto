import React from "react";
import useSEO from "../hooks/useSEO";
import Hero from "../components/home/Hero";
import TrustBar from "../components/home/TrustBar";
import CategoriesSection from "../components/home/CategoriesSection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import WhyChooseUs from "../components/home/WhyChooseUs";
import HowItWorks from "../components/home/HowItWorks";
import BrandsSection from "../components/home/BrandsSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import FaqPreview from "../components/home/FaqPreview";
import CtaBanner from "../components/home/CtaBanner";

export default function Home() {
  useSEO({
    description:
      "Spare Mec Auto Spare Parts — genuine and OEM-quality parts for BMW, Mercedes-Benz, Porsche, Land Rover and more. Fitment-verified, delivered across the UAE & GCC. Request your best price on WhatsApp.",
  });

  return (
    <>
      <Hero />
      <CategoriesSection />
      <FeaturedProducts />
      <TrustBar />
      <WhyChooseUs />
      <HowItWorks />
      <BrandsSection />
      <TestimonialsSection />
      <FaqPreview />
      <CtaBanner />
    </>
  );
}
