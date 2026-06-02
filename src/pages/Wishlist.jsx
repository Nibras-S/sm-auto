import React from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useInquiry } from "../context/InquiryContext";
import { getProductImage } from "../utils/productImages";
import PageHero from "../components/ui/PageHero";
import { products } from "../data/products";
import { FiHeart, FiArrowRight, FiTrash2, FiShoppingCart, FiCheck } from "react-icons/fi";

export default function Wishlist() {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addItem, has, openDrawer, count } = useInquiry();

  // Map wishlist slug references to full product data objects
  const wishedProducts = wishlistItems
    .map((item) => products.find((p) => p.slug === item.slug))
    .filter(Boolean);

  return (
    <div className="bg-neutral-50/50 min-h-screen pb-20">
      <PageHero
        eyebrow="My Collection"
        title="Saved Products"
        subtitle="View and manage the parts you've saved to your wishlist, or quickly request quotes for them."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Wishlist" }]}
      />

      <section className="container-x lg:max-w-[96rem] pt-6 pb-16">
        {wishedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white border border-neutral-200/60 rounded-2xl shadow-sm">
            <div className="w-16 h-16 rounded-full bg-accent-50 flex items-center justify-center text-accent-500 mb-6 animate-pulse">
              <FiHeart size={28} />
            </div>
            <h2 className="text-xl font-bold text-ink mb-2">Your wishlist is empty</h2>
            <p className="text-neutral-400 text-sm max-w-sm mb-8">
              Explore our wide range of premium luxury European and American spare parts to save your favourites here.
            </p>
            <Link to="/catalogue" className="btn btn-primary inline-flex items-center gap-2 px-6 py-3">
              <span>Browse Catalogue</span>
              <FiArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishedProducts.map((product, idx) => {
              const added = has(product.slug);
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
                <div
                  key={product.slug}
                  className="group relative flex flex-col overflow-hidden rounded-[24px] border border-neutral-200/80 bg-white p-4 transition-all duration-500 hover:border-neutral-300 hover:shadow-[0_16px_36px_-12px_rgba(10,10,10,0.05)] hover:-translate-y-1"
                >
                  {/* Remove Button (Floating in top right) */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    aria-label="Remove from wishlist"
                    className="absolute right-4 top-4 z-35 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 border border-neutral-100 text-neutral-400 backdrop-blur-sm transition-all duration-300 hover:bg-neutral-100 hover:text-red-500 hover:scale-105 shadow-sm"
                  >
                    <FiTrash2 size={13} />
                  </button>

                  {/* Image Link */}
                  <Link
                    to={`/product/${product.slug}`}
                    className="relative aspect-square w-full overflow-hidden bg-neutral-50/65 rounded-xl shrink-0 flex items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-grid-light bg-[size:22px_22px] opacity-25" />
                    <img
                      src={img}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex flex-1 flex-col pt-3.5 pb-4.5">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      {product.brand}
                    </span>
                    <Link
                      to={`/product/${product.slug}`}
                      className="mt-1 text-sm font-bold leading-snug text-neutral-800 transition-colors duration-300 hover:text-neutral-950 line-clamp-2 h-[40px]"
                    >
                      {product.name}
                    </Link>
                    <span className="mt-2 text-[10px] font-semibold text-neutral-400">
                      Part No: <span className="text-neutral-500">{product.partNumber}</span>
                    </span>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={handleAdd}
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm ${
                      added
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300"
                    }`}
                  >
                    {added ? <FiCheck size={14} /> : <FiShoppingCart size={14} />}
                    <span>{added ? "Added" : "Add to Cart"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
