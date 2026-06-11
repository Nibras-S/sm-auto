import { apiClient } from "./apiClient";

// profile
export const getProfile = () => apiClient.get("/me/profile").then((r) => r.data.profile);
export const updateProfile = (b) => apiClient.patch("/me/profile", b).then((r) => r.data.profile);

// addresses
export const listAddresses = () => apiClient.get("/me/addresses").then((r) => r.data.addresses);
export const addAddress = (b) => apiClient.post("/me/addresses", b).then((r) => r.data.addresses);
export const removeAddress = (id) => apiClient.delete(`/me/addresses/${id}`).then((r) => r.data.addresses);

// vehicles
export const listVehicles = () => apiClient.get("/me/vehicles").then((r) => r.data.vehicles);
export const addVehicle = (b) => apiClient.post("/me/vehicles", b).then((r) => r.data.vehicles);
export const removeVehicle = (id) => apiClient.delete(`/me/vehicles/${id}`).then((r) => r.data.vehicles);

// wishlist
export const getWishlist = () => apiClient.get("/me/wishlist").then((r) => r.data.wishlist);
export const mergeWishlist = (slugs) =>
  apiClient.post("/me/wishlist/merge", { slugs }).then((r) => r.data.wishlist);

// history
export const myOrders = () => apiClient.get("/me/orders").then((r) => r.data.orders);
export const myInquiries = () => apiClient.get("/me/inquiries").then((r) => r.data.inquiries);
export const myQuoteRequests = () => apiClient.get("/me/quote-requests").then((r) => r.data.quoteRequests);

// password reset
export const forgotPassword = (email) => apiClient.post("/auth/forgot-password", { email });
export const resetPassword = (token, password) =>
  apiClient.post("/auth/reset-password", { token, password });
