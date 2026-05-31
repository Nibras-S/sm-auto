import React from "react";
import { FiRefreshCw, FiShield, FiAlertTriangle, FiPackage } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import useSEO from "../hooks/useSEO";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import { siteConfig } from "../config/siteConfig";
import { genericWaLink } from "../utils/whatsapp";

export default function Returns() {
  useSEO({
    title: "Returns & Warranty",
    description:
      "Spare Mec returns, refunds and warranty policy — clear terms for genuine and OEM-quality auto parts purchased across the UAE and GCC.",
  });

  const { contact } = siteConfig;

  const sections = [
    {
      icon: FiRefreshCw,
      title: "Returns Policy",
      body: [
        "Because we verify fitment by VIN or chassis number before every order, returns are rare. If you receive an item that is incorrect, damaged or defective, contact us within 7 days of delivery and we'll make it right.",
        "To be eligible, the part must be unused, in its original condition and packaging, with any seals intact. Parts that have been fitted, modified or damaged through improper handling cannot be returned.",
      ],
    },
    {
      icon: FiPackage,
      title: "How to Request a Return",
      body: [
        `Message us on WhatsApp at ${contact.whatsappDisplay} or email ${contact.email} with your order details and the reason for the return. We'll guide you through the next steps and, where applicable, arrange collection within the UAE.`,
        "Please keep the original packaging and any documentation until the return is resolved.",
      ],
    },
    {
      icon: FiShield,
      title: "Warranty",
      body: [
        "Genuine (OEM) parts are covered by the manufacturer's warranty. Our OEM-quality parts include a replacement warranty against manufacturing defects.",
        "Specific warranty terms and durations are confirmed with each quote. Warranty claims require proof of purchase and may require inspection of the part.",
      ],
    },
    {
      icon: FiAlertTriangle,
      title: "Non-Returnable Items",
      body: [
        "For safety and quality reasons, certain items cannot be returned once supplied, including electrical components that have been installed, special-order or made-to-order parts, and fluids or lubricants once opened.",
        "We'll always confirm whether an item is returnable before you order.",
      ],
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Policies"
        title="Returns & Warranty"
        subtitle="Clear, fair terms designed to give you confidence with every order — and a simple path to resolution if anything isn't right."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Returns & Warranty" }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="container-x max-w-4xl space-y-6">
          {sections.map((s, i) => (
            <Reveal
              key={s.title}
              delay={i * 0.06}
              className="rounded-3xl border border-neutral-200 bg-white p-7 md:p-9"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-ink">
                  <s.icon size={22} />
                </div>
                <h2 className="font-display text-xl font-bold text-ink md:text-2xl">
                  {s.title}
                </h2>
              </div>
              <div className="mt-5 space-y-3 text-neutral-600">
                {s.body.map((p, j) => (
                  <p key={j} className="leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          ))}

          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
            <h3 className="font-display text-xl font-bold text-ink">
              Need help with a return or warranty claim?
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
              Our team will resolve it quickly. Reach us on WhatsApp or email{" "}
              {contact.email}.
            </p>
            <a
              href={genericWaLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-wa mt-6 px-7 py-3"
            >
              <FaWhatsapp size={18} />
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
