import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import RouteScrollTop from "./RouteScrollTop";
import WhatsAppFloat from "./WhatsAppFloat";
import ScrollToTopButton from "./ScrollToTopButton";
import InquiryDrawer from "./InquiryDrawer";
import ChatWidget from "./ChatWidget";

export default function Layout() {
  const { pathname } = useLocation();
  // On product pages there's a mobile sticky action bar — hide the floating
  // WhatsApp button on mobile there to avoid overlap.
  const isProduct = pathname.startsWith("/product/");
  return (
    <>
      <RouteScrollTop />
      <Navbar />
      <main className="min-h-[60vh]">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat hideOnMobile={isProduct} />
      <ChatWidget />
      <ScrollToTopButton />
      <InquiryDrawer />
    </>
  );
}
