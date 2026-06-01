import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiSearch, FiFileText, FiHeart, FiChevronDown } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { navLinks } from "../../config/siteConfig";
import { genericWaLink } from "../../utils/whatsapp";
import { useInquiry } from "../../context/InquiryContext";
import { useWishlist } from "../../context/WishlistContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count, openDrawer } = useInquiry();
  const { wishlistCount } = useWishlist();
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
        className={`sticky top-0 z-50 transition-all duration-300 bg-white border-b border-neutral-100 ${
          scrolled ? "shadow-[0_8px_30px_rgb(0,0,0,0.02)]" : ""
        }`}
      >
        <div className="container-x lg:max-w-[96rem] flex h-[72px] items-center justify-between gap-4">
          
          {/* Left Block: Logo Brand Text */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="font-display text-2xl font-black tracking-tight text-neutral-900 group-hover:text-accent-500 transition-colors duration-300">
              Spare<span className="text-[#6B7280]">Mec</span>
            </span>
          </Link>

          {/* Center-Left Block: Single-Row Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 ml-4 shrink-0">
            {navLinks.map((link) => {
              const hasDropdown = link.label === "Catalogue" || link.label === "Categories";
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    `relative flex items-center gap-1.5 py-6 text-[11px] font-extrabold uppercase tracking-widest transition-all duration-300 h-[72px] ${
                      isActive
                        ? "text-[#EF4444] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#EF4444] after:rounded-t-full"
                        : "text-neutral-500 hover:text-[#EF4444]"
                    }`
                  }
                >
                  <span>{link.label}</span>
                  {hasDropdown && <FiChevronDown size={11} className="opacity-70 mt-0.5" />}
                </NavLink>
              );
            })}
          </nav>

          {/* Center-Right Block: Wide Inline Search Bar (Desktop only) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = e.target.search.value;
              if (q.trim()) {
                window.location.href = `/catalogue?q=${encodeURIComponent(q)}`;
              }
            }}
            className="hidden xl:flex relative w-[240px] xl:w-[280px] shrink-0 ml-auto mr-1"
          >
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              name="search"
              placeholder="Search for parts, brands or products..."
              className="w-full rounded-full border border-neutral-200/60 bg-[#F3F4F6] py-2 pl-9 pr-4 text-xs font-semibold text-neutral-850 placeholder:text-neutral-400 outline-none transition-all duration-300 focus:bg-white focus:border-neutral-300 focus:shadow-sm"
            />
          </form>

          {/* Right Block: Badges & Profile Dropdown Widget */}
          <div className="flex items-center gap-3 shrink-0 ml-auto xl:ml-0">
            {/* Mobile/Tablet Search Button (Hidden on wide Desktop since input is shown) */}
            <Link
              to="/catalogue"
              aria-label="Search catalogue"
              className="flex xl:hidden h-10 w-10 items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 text-neutral-600 transition-all duration-300 hover:bg-neutral-100 hover:text-accent-500"
            >
              <FiSearch size={18} />
            </Link>

            {/* Request/Inquiry list Badge (Circular Button) */}
            <button
              onClick={openDrawer}
              aria-label="Open inquiry list"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 text-neutral-600 transition-all duration-300 hover:bg-neutral-100 hover:text-accent-500"
            >
              <FiFileText size={18} />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1.5 text-[9px] font-bold text-white shadow-sm">
                  {count}
                  <span className="absolute inset-0 -z-10 rounded-full bg-accent-500/50 animate-ping" />
                </span>
              )}
            </button>

            {/* Wishlist Heart Badge (Circular Button) */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 text-neutral-600 transition-all duration-300 hover:bg-neutral-100 hover:text-accent-500"
            >
              <FiHeart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1.5 text-[9px] font-bold text-white shadow-sm">
                  {wishlistCount}
                  <span className="absolute inset-0 -z-10 rounded-full bg-accent-500/50 animate-ping" />
                </span>
              )}
            </Link>

            {/* User Profile Widget (Desktop only) */}
            <div className="hidden md:flex items-center gap-2.5 border-l border-neutral-200 pl-4 ml-1">
              <svg
                viewBox="0 0 32 32"
                className="w-9 h-9 rounded-full border border-neutral-200/80 shadow-sm"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="16" cy="16" r="16" fill="#E0F2FE" />
                <circle cx="16" cy="12" r="5" fill="#0284C7" />
                <path d="M7 26.5C7 20.7 11.03 16 16 16C20.97 16 25 20.7 25 26.5" fill="#0284C7" />
              </svg>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] text-neutral-400 font-medium">Welcome!</span>
                <span className="text-xs font-bold text-ink mt-0.5">Guest</span>
              </div>
              <FiChevronDown size={14} className="text-neutral-400" />
            </div>

            {/* Mobile Hamburger menu icon */}
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

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-45 bg-ink/40 backdrop-blur-sm lg:hidden"
            />
            <motion.nav
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 right-0 top-[72px] z-45 mx-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-card lg:hidden"
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
              
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * navLinks.length }}
              >
                <NavLink
                  to="/wishlist"
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-neutral-100 text-ink"
                        : "text-neutral-600 hover:bg-neutral-50"
                    }`
                  }
                >
                  <div className="flex items-center gap-2">
                    <FiHeart size={18} className="text-neutral-500" />
                    <span>My Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="rounded-full bg-accent-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </NavLink>
              </motion.div>

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
