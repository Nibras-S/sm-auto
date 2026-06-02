import React from "react";
import { Link } from "react-router-dom";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiArrowUpRight,
} from "react-icons/fi";
import { FaWhatsapp, FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";
import logo from "../../assets/logor.png";
import Grain from "../ui/Grain";
import { siteConfig } from "../../config/siteConfig";
import { categories } from "../../data/categories";
import { genericWaLink } from "../../utils/whatsapp";

export default function Footer() {
  const { brand, contact, social } = siteConfig;
  const year = 2024;

  return (
    <footer id="contact" className="relative overflow-hidden bg-metal-radial text-neutral-300">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-[size:46px_46px] opacity-[0.18]" />
      <Grain opacity={0.07} />
      <div className="accent-rule pointer-events-none absolute inset-x-0 top-0 h-px" />

      {/* CTA band */}
      <div className="relative border-b border-white/10">
        <div className="container-x flex flex-col items-center gap-6 py-12 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h3 className="font-display text-2xl font-bold text-white md:text-3xl">
              Need a part? Get your best price in minutes.
            </h3>
            <p className="mt-2 max-w-xl text-sm text-neutral-400">
              Send us your part number or vehicle details on WhatsApp — our team
              confirms availability, price and fitment fast.
            </p>
          </div>
          <a
            href={genericWaLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-wa shrink-0 px-7 py-3.5"
          >
            <FaWhatsapp size={18} />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="container-x relative grid grid-cols-1 gap-12 py-16 lg:grid-cols-2">
        
        {/* Column 1: Brand Info & Contact Info Sub-Grid */}
        <div className="flex flex-col justify-between space-y-8">
          {/* Brand details */}
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="Spare Mec" className="h-9 w-auto object-contain brightness-0 invert" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-extrabold text-white">
                  SPARE<span className="text-neutral-400">MEC</span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.28em] text-neutral-500">
                  Auto Spare Parts
                </span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-neutral-400">
              {brand.legalName} — your trusted source for genuine and OEM-quality
              spare parts for luxury European & American vehicles across the UAE
              and GCC.
            </p>
            <div className="flex gap-2.5 pt-1">
              {social.instagram && (
                <SocialIcon href={social.instagram} label="Instagram">
                  <FaInstagram size={16} />
                </SocialIcon>
              )}
              {social.facebook && (
                <SocialIcon href={social.facebook} label="Facebook">
                  <FaFacebookF size={15} />
                </SocialIcon>
              )}
              {social.tiktok && (
                <SocialIcon href={social.tiktok} label="TikTok">
                  <FaTiktok size={15} />
                </SocialIcon>
              )}
              <SocialIcon href={genericWaLink()} label="WhatsApp">
                <FaWhatsapp size={16} />
              </SocialIcon>
            </div>
          </div>

          {/* Contact Sub-Grid inside Left Column */}
          <div className="border-t border-white/10 pt-8 max-w-lg">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Get in Touch
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <li className="flex items-start gap-3">
                <FiPhone className="mt-0.5 shrink-0 text-neutral-500" />
                <a href={`tel:+${contact.phoneNumber}`} className="hover:text-white transition-colors">
                  {contact.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FiMail className="mt-0.5 shrink-0 text-neutral-500" />
                <a href={`mailto:${contact.email}`} className="break-all hover:text-white transition-colors">
                  {contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FiMapPin className="mt-0.5 shrink-0 text-neutral-500" />
                <span className="text-neutral-400">{contact.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <FiClock className="mt-0.5 shrink-0 text-neutral-500" />
                <span className="text-neutral-400">{contact.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Column 2: Navigation Links & Top Categories Sub-Grid */}
        <div className="grid grid-cols-2 gap-8 lg:pl-8 border-t border-white/10 pt-8 lg:border-t-0 lg:pt-0">
          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <FootLink to="/about">About Us</FootLink>
              <FootLink to="/catalogue">Catalogue</FootLink>
              <FootLink to="/categories">Categories</FootLink>
              <FootLink to="/faqs">FAQs</FootLink>
              <FootLink to="/returns">Returns & Refunds</FootLink>
              <FootLink to="/contact">Contact</FootLink>
            </ul>
          </div>

          {/* Top Categories Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Top Categories
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              {categories.slice(0, 6).map((c) => (
                <FootLink key={c.slug} to={`/category/${c.slug}`}>
                  {c.name}
                </FootLink>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-neutral-500 md:flex-row">
          <p>
            © {year} {brand.legalName}. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link to="/returns" className="hover:text-white">
              Returns
            </Link>
            <Link to="/faqs" className="hover:text-white">
              FAQs
            </Link>
            <Link to="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FootLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="group inline-flex items-center gap-1 text-neutral-400 transition-colors hover:text-white"
      >
        <FiArrowUpRight
          size={13}
          className="opacity-0 transition-all group-hover:opacity-100"
        />
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-neutral-300 transition-all hover:border-white hover:bg-white hover:text-ink"
    >
      {children}
    </a>
  );
}
