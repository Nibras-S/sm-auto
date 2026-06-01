import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Catalogue from "./pages/Catalogue";
import Categories from "./pages/Categories";
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Faqs from "./pages/Faqs";
import Returns from "./pages/Returns";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";

// Set to true to hide the developing site and show the Coming Soon screen
// Set to false to return to normal site viewing
const IS_COMING_SOON = true;

function App() {
  // Check if preview bypass is active (via URL or stored session)
  const [isBypassed] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("preview") === "true") {
        sessionStorage.setItem("smauto_preview_bypass", "true");
        return true;
      }
      return sessionStorage.getItem("smauto_preview_bypass") === "true";
    }
    return false;
  });

  // If coming soon is active and user is not in preview bypass mode, show the Coming Soon page
  if (IS_COMING_SOON && !isBypassed) {
    return <ComingSoon />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faqs" element={<Faqs />} />
        <Route path="/returns" element={<Returns />} />

        {/* Legacy redirects */}
        <Route path="/aboutus" element={<Navigate to="/about" replace />} />
        <Route path="/products" element={<Navigate to="/catalogue" replace />} />
        <Route path="/shop" element={<Navigate to="/catalogue" replace />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
