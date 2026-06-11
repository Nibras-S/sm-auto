import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import useSEO from "../hooks/useSEO";
import PageHero from "../components/ui/PageHero";
import Accordion from "../components/ui/Accordion";
import Reveal from "../components/ui/Reveal";
import { faqGroups } from "../data/faqs";
import { siteConfig } from "../config/siteConfig";
import { genericWaLink } from "../utils/whatsapp";

export default function Faqs() {
  useSEO({
    title: "FAQs",
    description:
      "Answers to common questions about ordering, fitment, delivery, warranty and payment at Spare Mec Auto Spare Parts.",
  });

  return (
    <>
      <PageHero
        eyebrow="Help Centre"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about ordering parts, checking fitment, delivery across the GCC, warranty and payment."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "FAQs" }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr]">
          {/* Side nav */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-1">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                Topics
              </h3>
              {faqGroups.map((g) => (
                <a
                  key={g.group}
                  href={`#${g.group.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                  className="block rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-ink"
                >
                  {g.group}
                </a>
              ))}
            </div>
          </aside>

          {/* Groups */}
          <div className="space-y-12">
            {faqGroups.map((g) => (
              <Reveal
                key={g.group}
                id={g.group.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}
                className="scroll-mt-24"
              >
                <h2 className="mb-3 font-display text-xl font-bold text-ink md:text-2xl">
                  {g.group}
                </h2>
                <Accordion items={g.items} />
              </Reveal>
            ))}

            {/* Contact CTA */}
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
              <h3 className="font-display text-xl font-bold text-ink">
                Still have questions?
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
                Our parts specialists are a message away. Reach us on WhatsApp at{" "}
                {siteConfig.contact.whatsappDisplay} for instant help.
              </p>
              <a
                href={genericWaLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-wa mt-6 px-7 py-3"
              >
                <FaWhatsapp size={18} />
                Chat with us
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
