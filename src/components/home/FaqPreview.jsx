import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import SectionHeading from "../ui/SectionHeading";
import Accordion from "../ui/Accordion";
import Reveal from "../ui/Reveal";
import { faqs } from "../../data/faqs";
import { genericWaLink } from "../../utils/whatsapp";

export default function FaqPreview() {
  const preview = faqs.slice(0, 6);
  return (
    <section className="bg-neutral-50 py-20 md:py-28">
      <div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Questions"
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about ordering, fitment, delivery and warranty."
            className="md:mx-0"
          />
          <Reveal delay={0.15} className="mt-8 hidden flex-col gap-3 lg:flex">
            <Link to="/faqs" className="btn btn-outline w-fit px-6 py-3">
              See all FAQs
              <FiArrowRight size={18} />
            </Link>
            <a
              href={genericWaLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-wa w-fit px-6 py-3"
            >
              <FaWhatsapp size={18} />
              Ask us directly
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <Accordion items={preview} defaultOpen={0} />
          <Link
            to="/faqs"
            className="btn btn-outline mt-8 w-full px-6 py-3 lg:hidden"
          >
            See all FAQs
            <FiArrowRight size={18} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
