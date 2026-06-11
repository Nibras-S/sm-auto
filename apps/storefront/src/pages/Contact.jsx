import React, { useState } from "react";
import { FiPhone, FiMail, FiMapPin, FiClock } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import useSEO from "../hooks/useSEO";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import { siteConfig } from "../config/siteConfig";
import { waLink, genericWaLink } from "../utils/whatsapp";

export default function Contact() {
  useSEO({
    title: "Contact Us",
    description:
      "Contact Spare Mec Auto Spare Parts — WhatsApp, call or email us for genuine and OEM-quality car parts across the UAE and GCC.",
  });

  const { contact } = siteConfig;
  const [form, setForm] = useState({
    name: "",
    phone: "",
    vehicle: "",
    message: "",
  });

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSend = (e) => {
    e.preventDefault();
    const lines = [
      `Hello ${siteConfig.brand.name} 👋, I'd like to make an inquiry.`,
      "",
      form.name && `Name: ${form.name}`,
      form.phone && `Phone: ${form.phone}`,
      form.vehicle && `Vehicle: ${form.vehicle}`,
      form.message && `Message: ${form.message}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(waLink(lines), "_blank", "noopener,noreferrer");
  };

  const methods = [
    {
      icon: FaWhatsapp,
      title: "WhatsApp",
      value: contact.whatsappDisplay,
      sub: "Fastest response",
      href: genericWaLink(),
      accent: true,
    },
    {
      icon: FiPhone,
      title: "Call Us",
      value: contact.phoneDisplay,
      sub: contact.hours,
      href: `tel:+${contact.phoneNumber}`,
    },
    {
      icon: FiMail,
      title: "Email",
      value: contact.email,
      sub: "We reply within 24h",
      href: `mailto:${contact.email}`,
    },
    {
      icon: FiMapPin,
      title: "Location",
      value: contact.address,
      sub: "UAE & GCC delivery",
      href: contact.mapsUrl,
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title="Let's Find Your Part"
        subtitle="Reach us on WhatsApp for the fastest service, or send an inquiry below. Our specialists are ready to help with part identification, fitment and pricing."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]}
      />

      {/* Methods */}
      <section className="bg-white py-14 md:py-20">
        <div className="container-x grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {methods.map((m, i) => (
            <Reveal key={m.title} delay={i * 0.08}>
              <a
                href={m.href}
                target={m.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={`group flex h-full flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card ${
                  m.accent
                    ? "border-[#25D366]/30 bg-[#25D366]/5"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    m.accent ? "bg-[#25D366] text-white" : "bg-neutral-100 text-ink"
                  }`}
                >
                  <m.icon size={22} />
                </div>
                <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-neutral-400">
                  {m.title}
                </h3>
                <p className="mt-1 break-words font-semibold text-ink">{m.value}</p>
                <p className="mt-auto pt-2 text-xs text-neutral-500">{m.sub}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Form + map */}
      <section className="bg-neutral-50 py-14 md:py-20">
        <div className="container-x grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Form */}
          <Reveal>
            <div className="rounded-3xl border border-neutral-200 bg-white p-7 md:p-9">
              <h2 className="font-display text-2xl font-bold text-ink">
                Send an Inquiry
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Fill in the details and we'll open WhatsApp with your message ready
                to send — no account needed.
              </p>
              <form onSubmit={handleSend} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Your Name"
                    value={form.name}
                    onChange={update("name")}
                    placeholder="John Smith"
                  />
                  <Input
                    label="Phone"
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="+971 ..."
                  />
                </div>
                <Input
                  label="Vehicle (make / model / year)"
                  value={form.vehicle}
                  onChange={update("vehicle")}
                  placeholder="e.g. BMW 320i 2019"
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-600">
                    What part do you need?
                  </label>
                  <textarea
                    value={form.message}
                    onChange={update("message")}
                    rows={4}
                    placeholder="Part name or number, quantity, and any details…"
                    className="resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-ink"
                  />
                </div>
                <button type="submit" className="btn btn-wa w-full py-3.5">
                  <FaWhatsapp size={19} />
                  Send via WhatsApp
                </button>
                <p className="text-center text-xs text-neutral-400">
                  By sending, WhatsApp opens with your message — you stay in control.
                </p>
              </form>
            </div>
          </Reveal>

          {/* Map + info */}
          <Reveal delay={0.1} className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-3xl border border-neutral-200">
              <iframe
                title="Spare Mec location"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  contact.address
                )}&output=embed`}
                className="h-72 w-full grayscale"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-7">
              <h3 className="font-display text-lg font-bold text-ink">
                Working Hours
              </h3>
              <div className="mt-3 flex items-center gap-3 text-sm text-neutral-600">
                <FiClock className="text-neutral-400" />
                {contact.hours}
              </div>
              <h3 className="mt-6 font-display text-lg font-bold text-ink">
                We Deliver To
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {siteConfig.serviceAreas.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-600">{label}</label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-ink"
      />
    </div>
  );
}
