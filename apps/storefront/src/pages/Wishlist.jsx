import React from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import PageHero from "../components/ui/PageHero";
import ProductCard from "../components/ui/ProductCard";
import { useAllProducts } from "../hooks/useCatalog";
import { FiHeart, FiArrowRight } from "react-icons/fi";

export default function Wishlist() {
  const { wishlistItems } = useWishlist();
  const { products } = useAllProducts();

  // Map wishlist slug references to full product data objects (including admin-created products)
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {wishedProducts.map((product, idx) => (
              <ProductCard key={product.slug} product={product} index={idx} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

