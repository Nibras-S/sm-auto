import React from "react";
import { FiTarget, FiEye, FiCheckCircle } from "react-icons/fi";
import useSEO from "../hooks/useSEO";
import PageHero from "../components/ui/PageHero";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal from "../components/ui/Reveal";
import Counter from "../components/ui/Counter";
import WhyChooseUs from "../components/home/WhyChooseUs";
import BrandsSection from "../components/home/BrandsSection";
import CtaBanner from "../components/home/CtaBanner";
import aboutImg from "../assets/car1.jpg";
import { siteConfig } from "../config/siteConfig";

const stats = [
  { value: "20+", label: "Premium Brands Served" },
  { value: "6", label: "GCC Countries" },
  { value: "1000+", label: "Parts Sourced" },
  { value: "100%", label: "Fitment Verified" },
];

const values = [
  {
    icon: FiCheckCircle,
    title: "Integrity",
    desc: "Honest advice, fair pricing and transparent sourcing. We tell you what your car actually needs.",
  },
  {
    icon: FiTarget,
    title: "Precision",
    desc: "Right part, first time. We verify fitment by VIN so you avoid costly mistakes and returns.",
  },
  {
    icon: FiEye,
    title: "Service",
    desc: "Fast, knowledgeable support on WhatsApp — from part identification to delivery.",
  },
];

export default function About() {
  useSEO({
    title: "About Us",
    description:
      "Spare Mec Auto Spare Parts is a UAE-based supplier of genuine and OEM-quality parts for luxury European and American vehicles, serving customers across the GCC.",
  });

  return (
    <>
      <PageHero
        eyebrow="About Spare Mec"
        title="Premium Parts, Backed by People Who Know Cars"
        subtitle="We're a UAE-based supplier of genuine and OEM-quality spare parts for the world's finest vehicles — built on quality, trust and speed."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "About" }]}
      />

      {/* Story */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-x grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal x={-30} y={0}>
            <div className="relative">
              <div className="overflow-hidden rounded-3xl">
                <img
                  src={aboutImg}
                  alt="Spare Mec premium auto parts"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-card md:-right-6">
                <div className="font-display text-3xl font-extrabold text-ink">
                  Since {siteConfig.brand.foundedYear}
                </div>
                <div className="text-xs uppercase tracking-wider text-neutral-500">
                  Trusted in the UAE & GCC
                </div>
              </div>
            </div>
          </Reveal>

          <div>
            <SectionHeading
              align="left"
              eyebrow="Who We Are"
              title="Your trusted partner for luxury car parts"
              className="md:mx-0"
            />
            <div className="mt-6 space-y-4 text-neutral-600">
              <p>
                Spare Mec Auto Spare Parts was founded with a simple goal: make
                sourcing premium, correctly-fitting car parts effortless. We
                specialise in genuine (OEM) and high-grade OEM-quality components
                for BMW, Mercedes-Benz, Porsche, Land Rover and other leading
                European and American marques.
              </p>
              <p>
                Through a strong sourcing network and real parts expertise, we
                help owners, workshops and fleets across the UAE and wider GCC get
                the right part, at the right price, fast — without the guesswork.
              </p>
              <p>
                Every inquiry is handled personally. We confirm fitment, explain
                your options and quote our best price — so you can buy with
                confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-neutral-200 bg-neutral-50 py-14">
        <div className="container-x grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="text-center">
              <Counter
                value={s.value}
                className="font-display text-4xl font-extrabold text-ink md:text-5xl"
              />
              <div className="mt-2 text-sm text-neutral-500">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-x grid grid-cols-1 gap-6 md:grid-cols-2">
          <Reveal className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 md:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-white">
              <FiTarget size={22} />
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold text-ink">
              Our Mission
            </h3>
            <p className="mt-3 leading-relaxed text-neutral-600">
              To make premium spare parts accessible, reliable and fairly priced —
              delivering the right component, verified for fitment, with service
              that earns long-term trust.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="rounded-3xl border border-neutral-200 bg-ink p-8 text-white md:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-ink">
              <FiEye size={22} />
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold">Our Vision</h3>
            <p className="mt-3 leading-relaxed text-neutral-300">
              To become the most trusted name for luxury vehicle spare parts across
              the GCC — known for authenticity, expertise and an effortless
              customer experience.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="bg-neutral-50 py-16 md:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow="What We Stand For"
            title="Our Core Values"
            subtitle="The principles behind every part we supply and every inquiry we answer."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal
                key={v.title}
                delay={i * 0.1}
                className="rounded-2xl border border-neutral-200 bg-white p-8 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-ink">
                  <v.icon size={22} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-ink">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {v.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <BrandsSection />
      <CtaBanner />
    </>
  );
}
