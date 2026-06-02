import React from "react";
import useSEO from "../hooks/useSEO";
import Hero from "../components/home/Hero";
import TrustBar from "../components/home/TrustBar";
import CategoriesSection from "../components/home/CategoriesSection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import WhyChooseUs from "../components/home/WhyChooseUs";
import MechanicBanner from "../components/home/MechanicBanner";
import HowItWorks from "../components/home/HowItWorks";
import BrandsSection from "../components/home/BrandsSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import FaqPreview from "../components/home/FaqPreview";

export default function Home() {
  useSEO({
    description:
      "No.1 Spare Parts Dealer. Your one-stop shop for everything from exhaust to suspensions. Shop Now. 24/7 Support. Support every time. FREE SHIPPING.",
  });

  return (
    <>
      <Hero />
      <CategoriesSection />
      <FeaturedProducts />
      <TrustBar />
      <WhyChooseUs />
      <MechanicBanner />
      <HowItWorks />
      <BrandsSection />
      <TestimonialsSection />
      <FaqPreview />
    </>
  );
}
