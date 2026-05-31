import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiSearch, FiFileText } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import logo from "../../assets/logor.png";
import { navLinks } from "../../config/siteConfig";
import { genericWaLink } from "../../utils/whatsapp";
import { useInquiry } from "../../context/InquiryContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count, openDrawer } = useInquiry();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border-b border-neutral-100"
            : "bg-white/40 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="container-x flex h-[68px] items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src={logo}
              alt="Spare Mec"
              className="h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-extrabold tracking-tight text-ink group-hover:text-accent-500 transition-colors duration-300">
                SPARE<span className="text-neutral-400">MEC</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-neutral-400">
                Auto Spare Parts
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1.5 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `relative rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-300 ${
                    isActive
                      ? "text-accent-500"
                      : "text-neutral-500 hover:text-ink hover:bg-neutral-100/60"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute bottom-1.5 left-4 right-4 h-0.5 rounded-full bg-accent-500"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              to="/catalogue"
              aria-label="Search catalogue"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-neutral-600 transition-all duration-300 hover:bg-neutral-100 hover:text-accent-500 sm:flex"
            >
              <FiSearch size={19} />
            </Link>

            <button
              onClick={openDrawer}
              aria-label="Open inquiry list"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 transition-all duration-300 hover:bg-neutral-100 hover:text-accent-500"
            >
              <FiFileText size={19} />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1.5 text-[9px] font-bold text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]">
                  {count}
                  <span className="absolute inset-0 -z-10 rounded-full bg-accent-500/50 animate-ping" />
                </span>
              )}
            </button>

            <a
              href={genericWaLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-wa hidden px-4 py-2.5 text-sm md:inline-flex"
            >
              <FaWhatsapp size={16} />
              <span className="hidden lg:inline">WhatsApp</span>
            </a>

            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-neutral-100 lg:hidden"
            >
              {open ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
            />
            <motion.nav
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 right-0 top-[68px] z-40 mx-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-card lg:hidden"
            >
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                        isActive
                          ? "bg-neutral-100 text-ink"
                          : "text-neutral-600 hover:bg-neutral-50"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
              <a
                href={genericWaLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-wa mt-2 w-full py-3"
              >
                <FaWhatsapp size={18} />
                Chat on WhatsApp
              </a>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
