import { siteConfig } from "../config/siteConfig";

const BASE = `https://wa.me/${siteConfig.contact.whatsappNumber}`;

export const waLink = (text) =>
  `${BASE}?text=${encodeURIComponent(text)}`;

// Generic "chat with us" link
export const genericWaLink = () => waLink(siteConfig.whatsappGreeting);

// Single-product "Request Best Price"
export const productWaLink = (product) => {
  const lines = [
    `Hello ${siteConfig.brand.name} 👋, I'd like to request the best price for:`,
    "",
    `• ${product.name}`,
    product.partNumber ? `  Part No: ${product.partNumber}` : "",
    product.brand ? `  Vehicle Brand: ${product.brand}` : "",
    "",
    "Could you please confirm availability, price and fitment? Thank you.",
  ].filter(Boolean);
  return waLink(lines.join("\n"));
};

// Build the message body for a full inquiry list + customer details
export const buildInquiryMessage = (items = [], customer = {}) => {
  const lines = [];
  lines.push(
    `Hello ${siteConfig.brand.name} 👋, I'd like to request the best price for the following part(s):`
  );
  lines.push("");

  items.forEach((item, i) => {
    const qty = item.qty || 1;
    let line = `${i + 1}. ${item.name}`;
    if (item.partNumber) line += `  (Part No: ${item.partNumber})`;
    line += `  ×${qty}`;
    lines.push(line);
  });

  const vehicle = [customer.year, customer.carMake, customer.carModel]
    .filter(Boolean)
    .join(" ");

  const details = [];
  if (customer.name) details.push(`Name: ${customer.name}`);
  if (customer.phone) details.push(`Phone: ${customer.phone}`);
  if (vehicle) details.push(`Vehicle: ${vehicle}`);
  if (customer.vin) details.push(`VIN / Chassis: ${customer.vin}`);
  if (customer.emirate) details.push(`Location: ${customer.emirate}`);
  if (customer.notes) details.push(`Notes: ${customer.notes}`);

  if (details.length) {
    lines.push("");
    lines.push("— My details —");
    details.forEach((d) => lines.push(d));
  }

  lines.push("");
  lines.push("Please confirm availability, price and delivery. Thank you!");
  return lines.join("\n");
};

export const inquiryListWaLink = (items, customer) =>
  waLink(buildInquiryMessage(items, customer));

export default waLink;
