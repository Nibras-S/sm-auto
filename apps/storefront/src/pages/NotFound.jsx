import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiSearch } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import useSEO from "../hooks/useSEO";
import { genericWaLink } from "../utils/whatsapp";

export default function NotFound() {
  useSEO({ title: "Page Not Found" });
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-white px-5 py-20 text-center">
      <div className="max-w-md">
        <p className="font-display text-7xl font-extrabold text-ink md:text-8xl">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">
          We couldn't find that page
        </h1>
        <p className="mt-3 text-neutral-500">
          The page may have moved — but the part you need is just a message away.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn btn-primary px-6 py-3">
            <FiHome size={18} /> Go Home
          </Link>
          <Link to="/catalogue" className="btn btn-outline px-6 py-3">
            <FiSearch size={18} /> Browse Catalogue
          </Link>
          <a
            href={genericWaLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-wa px-6 py-3"
          >
            <FaWhatsapp size={18} /> WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
