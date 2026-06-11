import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { mergeWishlist } from "../lib/accountApi";

// Pushes the (guest) wishlist to the account on login and on changes while
// signed in. Removals are not synced cross-device (acceptable for now).
export default function WishlistSync() {
  const { user } = useAuth();
  const { wishlistItems } = useWishlist();

  useEffect(() => {
    if (!user) return;
    mergeWishlist(wishlistItems.map((i) => i.slug)).catch(() => {});
  }, [user, wishlistItems]);

  return null;
}
