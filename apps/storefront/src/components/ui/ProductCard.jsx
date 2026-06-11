import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheck, FiHeart, FiShoppingCart } from "react-icons/fi";
import { getProductImage } from "../../utils/productImages";
import { useInquiry } from "../../context/InquiryContext";
import { useWishlist } from "../../context/WishlistContext";

// price is stored as integer fils (AED × 100). Null → On Request.
const fmtPrice = (fils) =>
  fils != null ? `AED ${(fils / 100).toFixed(2)}` : null;

export default function ProductCard({ product, index = 0, forceCol = false }) {
  const { addItem, has, openDrawer, count } = useInquiry();
  const { toggleWishlist, hasWishlist } = useWishlist();
  const added = has(product.slug);
  const isWished = hasWishlist(product.slug);
  const img = product.images?.[0]?.url || getProductImage(product.imageKey);
  const priceLabel = fmtPrice(product.price);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (added) {
      openDrawer();
      return;
    }
    addItem(product);
    if (count === 0) {
      openDrawer();
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex overflow-hidden rounded-[24px] border border-neutral-200/80 bg-white transition-all duration-500 hover:border-neutral-300 hover:shadow-[0_16px_36px_-12px_rgba(10,10,10,0.05)] hover:-translate-y-1 ${
        forceCol ? "flex-col p-0 min-h-0" : "flex-row md:flex-col p-4 md:p-0 min-h-[148px] md:min-h-0"
      }`}
    >
      <Link
        to={`/product/${product.slug}`}
        className={`flex flex-1 gap-5 md:gap-0 w-full ${
          forceCol ? "flex-col" : "flex-row md:flex-col"
        }`}
      >
        {/* Image */}
        <div
          className={`relative aspect-square overflow-hidden bg-neutral-50/65 shrink-0 ${
            forceCol ? "w-full h-auto rounded-none" : "rounded-xl md:rounded-none w-28 h-28 sm:w-32 sm:h-32 md:w-full md:h-auto"
          }`}
        >
          <div className="absolute inset-0 bg-grid-light bg-[size:22px_22px] opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-tr from-neutral-500/0 via-transparent to-neutral-500/0 opacity-0 group-hover:opacity-100 group-hover:from-neutral-500/[0.01] group-hover:to-neutral-500/[0.03] transition-all duration-700 ease-out" />
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className={`relative h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105 ${
              forceCol ? "p-4" : "p-0 sm:p-0.5 md:p-1.5"
            }`}
          />
        </div>

        {/* MOBILE VIEW BODY */}
        <div className={forceCol ? "hidden" : "flex flex-1 flex-col justify-between md:hidden pt-2.5 pb-2.5 pl-1 pr-1.5 relative"}>
          {/* Row 1: Category on left, Heart Icon on right */}
          <div className="flex justify-between items-start w-full">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block pt-0.5">
              {product.categoryName}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              }}
              aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
              className="text-neutral-400 hover:text-neutral-800 transition-colors duration-300 shrink-0 -mt-1 -mr-1"
            >
              <FiHeart size={18} className={isWished ? "fill-neutral-900 text-neutral-900" : ""} />
            </button>
          </div>

          {/* Row 2: Title on left, Price on right */}
          <div className="flex justify-between items-start w-full mt-1 gap-2">
            <h3 className="text-[13px] font-bold leading-snug text-neutral-900 line-clamp-2 flex-1 h-[36px]">
              {product.name}
            </h3>
            <div className="flex flex-col items-end shrink-0 text-right -mt-0.5 min-w-[72px]">
              {priceLabel ? (
                <span className="text-[13px] text-neutral-950 font-black leading-none">{priceLabel}</span>
              ) : (
                <span className="text-[10px] font-bold text-neutral-500 border border-neutral-300 rounded-full px-2 py-0.5 leading-none">
                  On Request
                </span>
              )}
            </div>
          </div>

          {/* Row 3: Availability on left, Add to Cart Button on right */}
          <div className="flex justify-between items-end w-full mt-2">
            <span className="text-[9px] uppercase tracking-wider font-semibold text-neutral-400 pb-1">
              {product.availability}
            </span>
            <button
              onClick={handleAdd}
              className={`px-3 py-1.5 -mr-3 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all duration-300 shadow-sm ${
                added
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 hover:border-neutral-300"
              }`}
            >
              <span>{added ? "Added" : "Add to Cart"}</span>
              {added ? <FiCheck size={11} /> : <FiShoppingCart size={11} />}
            </button>
          </div>
        </div>

        {/* DESKTOP / FORCED-VERTICAL VIEW BODY */}
        <div className={`${forceCol ? "flex animate-fadeIn" : "hidden md:flex"} flex-1 flex-col p-4 md:p-4.5 relative`}>
          <span className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
            {product.categoryName}
          </span>
          <h3 className="mt-1.5 md:mt-2 text-xs md:text-sm font-bold leading-snug text-neutral-800 transition-colors duration-300 group-hover:text-neutral-950 line-clamp-2 pr-6 h-[32px] md:h-[40px]">
            {product.name}
          </h3>
          <div className="mt-1.5 md:mt-2">
            <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
              {product.availability}
            </span>
          </div>
          <div className="mt-2 md:mt-2.5">
            {priceLabel ? (
              <span className="text-[13px] md:text-[15px] text-neutral-900 font-black">{priceLabel}</span>
            ) : (
              <span className="text-[11px] font-bold text-neutral-500 border border-neutral-300 rounded-full px-2.5 py-1 leading-none">
                On Request
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* ACTION BUTTON AREA */}
      <div className={`${forceCol ? "flex" : "hidden md:flex"} items-center w-full px-4 pb-4 md:px-4.5 md:pb-4.5 mt-auto`}>
        <button
          onClick={handleAdd}
          className={`w-full py-2 md:py-2.5 rounded-xl border text-[10px] md:text-xs font-bold flex items-center justify-center gap-1.5 md:gap-2 transition-all duration-300 shadow-sm ${
            added
              ? "border-neutral-950 bg-neutral-950 text-white shadow-sm"
              : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300"
          }`}
        >
          <span>{added ? "Added" : "Add to Cart"}</span>
          {added ? <FiCheck size={13} /> : <FiShoppingCart size={13} />}
        </button>
      </div>

      {/* Floating Wishlist Heart Icon Toggle Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute right-4 top-4 z-30 ${forceCol ? "flex" : "hidden md:flex"} text-neutral-400 hover:text-neutral-800 transition-colors duration-300`}
      >
        <FiHeart size={18} className={isWished ? "fill-neutral-900 text-neutral-900" : ""} />
      </button>
    </motion.article>
  );
}
