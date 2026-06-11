import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiSearch, FiShoppingCart, FiHeart, FiChevronDown } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { navLinks } from "../../config/siteConfig";
import { genericWaLink } from "../../utils/whatsapp";
import { useInquiry } from "../../context/InquiryContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { categories } from "../../data/categories";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { count, openDrawer } = useInquiry();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setShowMobileSearch(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={`sticky top-0 z-[110] transition-all duration-300 bg-white border-b border-neutral-100 ${
          scrolled ? "shadow-[0_8px_30px_rgb(0,0,0,0.02)]" : ""
        }`}
      >
        {showMobileSearch ? (
          <div className="container-x lg:max-w-[96rem] flex h-[72px] items-center gap-3 w-full animate-fadeIn">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = e.target.search.value;
                if (q.trim()) {
                  window.location.href = `/catalogue?q=${encodeURIComponent(q)}`;
                  setShowMobileSearch(false);
                }
              }}
              className="relative flex-1"
            >
              <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                name="search"
                autoFocus
                placeholder="Search for parts, brands or products..."
                className="w-full rounded-full border border-neutral-200/60 bg-[#F3F4F6] py-2.5 pl-9 pr-4 text-xs font-semibold text-neutral-850 outline-none focus:bg-white focus:border-neutral-300 focus:shadow-sm"
              />
            </form>
            <button
              onClick={() => setShowMobileSearch(false)}
              className="text-xs font-bold text-neutral-500 hover:text-neutral-900 px-3 py-1.5 rounded-full hover:bg-neutral-100 transition-colors shrink-0"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="container-x lg:max-w-[96rem] flex h-[72px] items-center justify-between gap-4">
            
            {/* Left Block: Logo Brand Text */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <span className="font-display text-2xl font-black tracking-tight text-neutral-900 group-hover:text-accent-500 transition-colors duration-300">
                Spare<span className="text-[#6B7280]">Mec</span>
              </span>
            </Link>

            {/* Center-Left Block: Single-Row Desktop Navigation Links with Hover Dropdown */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-6 ml-4 shrink-0">
              {navLinks.map((link) => {
                const hasDropdown = link.label === "Categories";
                return (
                  <div key={link.to} className="relative group/nav h-[72px] flex items-center">
                    <NavLink
                      to={link.to}
                      end={link.to === "/"}
                      className={({ isActive }) =>
                        `relative flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-widest transition-all duration-300 py-6 ${
                          isActive
                            ? "text-[#EF4444] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#EF4444] after:rounded-t-full"
                            : "text-neutral-500 hover:text-[#EF4444]"
                        }`
                      }
                    >
                      <span>{link.label}</span>
                      {hasDropdown && <FiChevronDown size={11} className="opacity-70 mt-0.5 group-hover/nav:rotate-180 transition-transform duration-300" />}
                    </NavLink>

                    {/* Premium Dropdown Flyout */}
                    {hasDropdown && (
                      <div className="absolute top-[72px] left-1/2 -translate-x-1/2 w-[260px] bg-white border border-neutral-100 rounded-2xl shadow-[0_16px_36px_-12px_rgba(10,10,10,0.08)] py-3 px-2 hidden group-hover/nav:block animate-fadeIn z-50">
                        {categories.map((cat) => (
                          <Link
                            key={cat.slug}
                            to={`/category/${cat.slug}`}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 transition-all duration-200"
                          >
                            <img src={cat.icon} alt={cat.name} className="w-5 h-5 object-contain opacity-80" />
                            <span className="text-xs font-bold">{cat.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
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
                className="w-full rounded-full border border-neutral-200/60 bg-[#F3F4F6] py-2.5 pl-9 pr-4 text-xs font-semibold text-neutral-850 placeholder:text-neutral-400 outline-none transition-all duration-300 focus:bg-white focus:border-neutral-300 focus:shadow-sm"
              />
            </form>

            {/* Right Block: Badges & Profile Dropdown Widget */}
            <div className="flex items-center gap-3 shrink-0 ml-auto xl:ml-0">
              {/* Mobile/Tablet Search Button (Triggers Search overlay inside header) */}
              <button
                onClick={() => setShowMobileSearch(true)}
                aria-label="Search catalogue"
                className="flex xl:hidden h-10 w-10 items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 text-neutral-600 transition-all duration-300 hover:bg-neutral-100 hover:text-accent-500"
              >
                <FiSearch size={18} />
              </button>

              {/* Request/Inquiry list Badge (Circular Button) */}
              <button
                onClick={openDrawer}
                aria-label="Open inquiry cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 text-neutral-600 transition-all duration-300 hover:bg-neutral-100 hover:text-accent-500"
              >
                <FiShoppingCart size={18} />
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

              {/* Account — single entry point, shows avatar on all sizes + name on desktop */}
              <Link
                to={user ? "/account" : "/login"}
                aria-label={user ? "My account" : "Sign in"}
                className="flex items-center gap-0 md:gap-2.5 md:border-l md:border-neutral-200 md:pl-4 md:ml-1 shrink-0"
              >
                {user ? (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white text-sm font-black shadow-sm shrink-0 select-none">
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                ) : (
                  <svg viewBox="0 0 32 32" className="w-9 h-9 rounded-full border border-neutral-200/80 shadow-sm shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill="#E0F2FE" />
                    <circle cx="16" cy="12" r="5" fill="#0284C7" />
                    <path d="M7 26.5C7 20.7 11.03 16 16 16C20.97 16 25 20.7 25 26.5" fill="#0284C7" />
                  </svg>
                )}
                <div className="hidden md:flex flex-col text-left leading-none">
                  <span className="text-[10px] text-neutral-400 font-medium">{user ? "Signed in" : "Welcome!"}</span>
                  <span className="text-xs font-bold text-ink mt-0.5">{user ? user.name.split(" ")[0] : "Guest"}</span>
                </div>
                <FiChevronDown size={14} className="hidden md:block text-neutral-400" />
              </Link>

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
        )}
      </header>

      {/* Mobile Navigation Drawer (Right-Side Slide-In Sidebar) */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[120] bg-ink/40 backdrop-blur-sm lg:hidden"
            />
            
            {/* Full-Height Drawer Nav */}
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed right-0 top-0 bottom-0 z-[121] w-[290px] sm:w-[320px] bg-white border-l border-neutral-100 p-6 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.08)] lg:hidden"
            >
              {/* Drawer Header with Close Button */}
              <div className="flex items-center justify-between pb-5 border-b border-neutral-100 mb-5 shrink-0">
                <span className="font-display text-xl font-black tracking-tight text-neutral-900">
                  Spare<span className="text-[#6B7280]">Mec</span>
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 text-neutral-600 transition-all duration-300 hover:bg-neutral-100"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Navigation Links (Scrollable area) */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 text-base font-bold transition-all duration-300 ${
                        isActive
                          ? "bg-neutral-50 text-[#EF4444] border-l-4 border-[#EF4444]"
                          : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              {/* WhatsApp Action Button pinned to bottom */}
              <div className="pt-5 border-t border-neutral-100 mt-auto shrink-0">
                <a
                  href={genericWaLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-wa w-full py-3.5 justify-center"
                >
                  <FaWhatsapp size={18} />
                  Chat on WhatsApp
                </a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
