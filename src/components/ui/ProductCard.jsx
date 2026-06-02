import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheck, FiHeart, FiShoppingCart } from "react-icons/fi";
import { getProductImage } from "../../utils/productImages";
import { useInquiry } from "../../context/InquiryContext";
import { useWishlist } from "../../context/WishlistContext";

const getMockPriceAndRating = (slug) => {
  if (slug.includes("wheel") || slug.includes("steering") || slug.includes("suspension") || slug.includes("mount")) {
    return { originalPrice: 290.00, salePrice: 219.99, reviews: 128 };
  }
  if (slug.includes("brake") || slug.includes("disc")) {
    return { originalPrice: 210.00, salePrice: 149.00, reviews: 98 };
  }
  if (slug.includes("control") || slug.includes("arm")) {
    return { originalPrice: 249.00, salePrice: 179.00, reviews: 74 };
  }
  if (slug.includes("spark") || slug.includes("plug") || slug.includes("ignition")) {
    return { originalPrice: 70.00, salePrice: 49.00, reviews: 63 };
  }
  if (slug.includes("filter") || slug.includes("oil")) {
    return { originalPrice: 25.00, salePrice: 16.00, reviews: 112 };
  }
  return { originalPrice: 45.00, salePrice: 31.00, reviews: 96 };
};

export default function ProductCard({ product, index = 0 }) {
  const { addItem, has, openDrawer, count } = useInquiry();
  const { toggleWishlist, hasWishlist } = useWishlist();
  const added = has(product.slug);
  const isWished = hasWishlist(product.slug);
  const img = getProductImage(product.imageKey);

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
      className="group relative flex overflow-hidden rounded-[24px] border border-neutral-200/80 bg-white transition-all duration-500 hover:border-neutral-300 hover:shadow-[0_16px_36px_-12px_rgba(10,10,10,0.05)] hover:-translate-y-1 flex-row md:flex-col p-4 md:p-0 min-h-[148px] md:min-h-0"
    >
      <Link
        to={`/product/${product.slug}`}
        className="flex flex-1 flex-row md:flex-col gap-5 md:gap-0 w-full"
      >
        {/* Image */}
        <div
          className="relative aspect-square overflow-hidden bg-neutral-50/65 rounded-xl md:rounded-none shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-full md:h-auto"
        >
          <div className="absolute inset-0 bg-grid-light bg-[size:22px_22px] opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-tr from-neutral-500/0 via-transparent to-neutral-500/0 opacity-0 group-hover:opacity-100 group-hover:from-neutral-500/[0.01] group-hover:to-neutral-500/[0.03] transition-all duration-700 ease-out" />
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="relative h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105 p-3 sm:p-4 md:p-6"
          />
        </div>

        {/* MOBILE VIEW BODY */}
        <div className="flex flex-1 flex-col justify-between md:hidden pt-2.5 pb-2.5 pl-1 pr-1.5 relative">
          {/* Row 1: Category on left, Heart Icon on right */}
          <div className="flex justify-between items-start w-full">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block pt-0.5">
              {product.categoryName}
            </span>
            {/* Borderless Wishlist heart toggle */}
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

          {/* Row 2: Title on left, Price Block on right */}
          <div className="flex justify-between items-start w-full mt-1 gap-2">
            <h3 className="text-[13px] font-bold leading-snug text-neutral-900 line-clamp-2 flex-1 h-[36px]">
              {product.name}
            </h3>
            <div className="flex flex-col items-end shrink-0 text-right -mt-0.5 min-w-[70px]">
              <span className="text-[10px] text-neutral-400 line-through font-semibold leading-none">
                AED {getMockPriceAndRating(product.slug).originalPrice.toFixed(2)}
              </span>
              <span className="text-[14px] text-neutral-950 font-black mt-1 leading-none">
                AED {getMockPriceAndRating(product.slug).salePrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Row 3: Stars on left, Add to Cart Button on right */}
          <div className="flex justify-between items-end w-full mt-2">
            <div className="flex items-center gap-1 pb-1">
              <div className="flex items-center gap-0.5 text-[#FBBF24]">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[10px] text-neutral-400 font-medium">
                ({getMockPriceAndRating(product.slug).reviews})
              </span>
            </div>

            {/* Add to Cart rounded rectangular button with outline shopping cart icon on the right */}
            <button
              onClick={handleAdd}
              className={`px-3 py-1.5 -mr-3 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all duration-300 shadow-sm ${
                added
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 hover:border-neutral-300"
              }`}
            >
              <span>{added ? "Added" : "Add to Cart"}</span>
              {added ? <FiCheck size={11} /> : <FiShoppingCart size={11} />}
            </button>
          </div>
        </div>

        {/* DESKTOP VIEW BODY */}
        <div className="hidden md:flex flex-1 flex-col p-4.5 relative">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
            {product.categoryName}
          </span>
          <h3 className="mt-2 text-sm font-bold leading-snug text-neutral-800 transition-colors duration-300 group-hover:text-neutral-950 line-clamp-2 pr-6 h-[40px]">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-0.5 text-[#FBBF24]">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[11px] text-neutral-400 font-medium">
              ({getMockPriceAndRating(product.slug).reviews} reviews)
            </span>
          </div>
          <div className="flex items-baseline gap-2.5 mt-2.5">
            <span className="text-[12px] text-neutral-400 line-through font-semibold">
              AED {getMockPriceAndRating(product.slug).originalPrice.toFixed(2)}
            </span>
            <span className="text-[15px] text-neutral-900 font-black">
              AED {getMockPriceAndRating(product.slug).salePrice.toFixed(2)}
            </span>
          </div>
        </div>
      </Link>

      {/* DESKTOP ONLY actions */}
      <div className="hidden md:flex items-center w-full px-4.5 pb-4.5 mt-auto">
        {/* Full width rectangular Add to Cart button */}
        <button
          onClick={handleAdd}
          className={`w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm ${
            added
              ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
              : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300"
          }`}
        >
          <span>{added ? "Added" : "Add to Cart"}</span>
          {added ? <FiCheck size={14} /> : <FiShoppingCart size={14} />}
        </button>
      </div>

      {/* DESKTOP Wishlist Heart Icon Toggle Button (floating transparent in top-right) */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute right-4 top-4 z-30 hidden md:flex text-neutral-400 hover:text-neutral-800 transition-colors duration-300"
      >
        <FiHeart size={18} className={isWished ? "fill-neutral-900 text-neutral-900" : ""} />
      </button>
    </motion.article>
  );
}
