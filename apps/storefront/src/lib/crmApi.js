import { apiClient } from "./apiClient";

// Every storefront sales action also creates a CRM record.
export const submitWhatsappInquiry = (payload) =>
  apiClient.post("/inquiries/whatsapp", payload).then((r) => r.data.inquiry);

export const submitContactInquiry = (payload) =>
  apiClient.post("/inquiries/contact", payload).then((r) => r.data.inquiry);

export const submitLead = (payload) =>
  apiClient.post("/leads", payload).then((r) => r.data.lead);

export const submitQuoteRequest = (payload) =>
  apiClient.post("/quote-requests", payload).then((r) => r.data.quoteRequest);

export const createOrder = (payload) =>
  apiClient.post("/orders", payload).then((r) => r.data.order);
