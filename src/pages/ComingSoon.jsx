import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiPhone, FiMail, FiExternalLink } from "react-icons/fi";
import { siteConfig } from "../config/siteConfig";
import comingSoonVideo from "../assets/comingsoon.mp4";

export default function ComingSoon() {
  const { brand, contact } = siteConfig;

  // Render a WhatsApp link with a customized greeting
  const waUrl = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(
    "Hello Spare Mec 👋, I saw your coming soon page and would like to enquire about auto spare parts."
  )}`;

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] flex flex-col justify-between items-center text-white p-6 md:p-10 lg:p-12 overflow-hidden select-none bg-black">
      
      {/* ── BACKGROUND VIDEO & OVERLAYS ─────────────────────────────────────── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <video
          src={comingSoonVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Semi-transparent dark overlay to guarantee white text pop */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-dark opacity-[0.03] pointer-events-none" />
        {/* Soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#000000_100%)] pointer-events-none" />
      </div>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="w-full max-w-5xl flex justify-between items-center z-10 animate-fadeIn">
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow">
            Spare<span className="text-white font-semibold">Mec</span>
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </div>
      </header>

      {/* ── MAIN CONTENT (MINIMAL & HIGH-CONTRAST FULL WHITE) ───────────────── */}
      <main className="w-full max-w-md z-10 my-auto flex flex-col justify-center items-center">

        {/* Brand Main Text - Full White */}
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-white text-center mb-4 leading-[1.1] drop-shadow-lg animate-fadeUp">
          Premium Spare Parts <br />
          <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.35)]">Coming Soon</span>
        </h1>

        {/* Minimal Subtitle - Full White */}
        <p className="text-white text-sm md:text-base font-normal text-center max-w-sm mb-8 leading-relaxed drop-shadow animate-fadeUp [animation-delay:100ms]">
          We are fine-tuning our luxury auto spares marketplace. Our spares desk is fully active and ready to assist.
        </p>

        {/* Glass Boxed Actions */}
        <div className="w-full bg-black/50 border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-md rounded-2xl p-5 md:p-6 flex flex-col gap-3 animate-fadeUp [animation-delay:200ms]">
          
          {/* WhatsApp CTA (White font with green bg) */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#1FB457] text-white font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-5px_rgba(37,211,102,0.4)] active:translate-y-0"
          >
            <FaWhatsapp size={18} />
            <span>Chat on WhatsApp</span>
          </a>

          {/* Direct Call CTA */}
          <a
            href={`tel:${contact.phoneNumber}`}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <FiPhone size={15} className="text-white animate-pulse" />
            <span>Call: {contact.phoneDisplay}</span>
          </a>

          {/* Email Info - Full White */}
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-white transition-colors duration-300">
            <FiMail size={13} className="text-white" />
            <a href={`mailto:${contact.email}`} className="hover:underline">
              {contact.email}
            </a>
          </div>
        </div>

      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="w-full flex flex-col items-center gap-2 z-10 text-center animate-fadeIn">
        <p className="text-[11px] text-white font-medium drop-shadow-sm">
          © {brand.foundedYear} – {new Date().getFullYear()} {brand.legalName}
        </p>
        
        <p className="flex items-center gap-1.5 text-[11px] text-white font-medium tracking-wide drop-shadow-sm">
          <span>Developed by</span>
          <a
            href="https://www.n3global.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline font-bold transition-all duration-300 inline-flex items-center gap-0.5 group"
          >
            N3 Global Tech
            <FiExternalLink size={10} className="inline opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
          </a>
        </p>
      </footer>

    </div>
  );
}
