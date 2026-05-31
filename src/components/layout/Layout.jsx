import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";
import RouteScrollTop from "./RouteScrollTop";
import WhatsAppFloat from "./WhatsAppFloat";
import ScrollToTopButton from "./ScrollToTopButton";
import InquiryDrawer from "./InquiryDrawer";

export default function Layout() {
  const { pathname } = useLocation();
  // On product pages there's a mobile sticky action bar — hide the floating
  // WhatsApp button on mobile there to avoid overlap.
  const isProduct = pathname.startsWith("/product/");
  return (
    <>
      <ScrollProgress />
      <RouteScrollTop />
      <Navbar />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-[60vh]"
      >
        <Outlet />
      </motion.main>
      <Footer />
      <WhatsAppFloat hideOnMobile={isProduct} />
      <ScrollToTopButton />
      <InquiryDrawer />
    </>
  );
}
