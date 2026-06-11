import { siteConfig } from "../config/siteConfig";

const wa = siteConfig.contact.whatsappDisplay;

export const faqGroups = [
  {
    group: "Ordering & Inquiry",
    items: [
      {
        q: "How do I order a part from Spare Mec?",
        a: "Browse or search our catalogue, then either tap “Request Best Price” on a product or add several parts to your Inquiry List. When you send the inquiry, a pre-filled WhatsApp message opens with your selected parts so we can confirm availability, price and fitment instantly.",
      },
      {
        q: "Why don't you show prices on the website?",
        a: "Spare parts pricing varies by availability, genuine vs OEM-quality option, and exact fitment for your vehicle. To always give you the best, most accurate price, we confirm it directly on WhatsApp — usually within minutes during working hours.",
      },
      {
        q: "Can I order multiple parts at once?",
        a: "Yes. Add everything you need to your Inquiry List and send it in a single WhatsApp message. It's the fastest way to get a complete quote for a full service or repair.",
      },
      {
        q: "What if I can't find my part in the catalogue?",
        a: `Our catalogue is a sample of what we supply — we can source most parts for European and American vehicles. Send us your part number or vehicle details on WhatsApp (${wa}) and we'll locate it for you.`,
      },
    ],
  },
  {
    group: "Compatibility & Fitment",
    items: [
      {
        q: "How do I know a part will fit my car?",
        a: "Share your VIN / chassis number or your exact make, model and year when you inquire. We verify fitment before confirming your order to avoid wrong parts and returns.",
      },
      {
        q: "Do you supply genuine (OEM) parts or aftermarket?",
        a: "Both. We offer genuine (OEM) parts as well as premium OEM-quality aftermarket alternatives. We'll explain the options so you can choose the best fit for your needs and budget.",
      },
      {
        q: "Which vehicle brands do you cover?",
        a: "We specialise in European and American luxury vehicles including BMW, Mercedes-Benz, Porsche, Land Rover, Jaguar, Audi, Bentley, Ferrari, Lamborghini and more, plus Ford, GMC, Chevrolet, Jeep, Nissan and Lexus.",
      },
    ],
  },
  {
    group: "Shipping & Delivery",
    items: [
      {
        q: "Do you deliver across the UAE and GCC?",
        a: "Yes. We deliver throughout the UAE and ship across the GCC including Saudi Arabia, Oman, Qatar, Kuwait and Bahrain. Delivery times and options are confirmed with your quote.",
      },
      {
        q: "How long does delivery take?",
        a: "In-stock items are typically dispatched within 1–3 business days inside the UAE. Sourced or made-to-order parts and GCC shipments may take longer — we'll always give you a clear timeline upfront.",
      },
    ],
  },
  {
    group: "Returns & Warranty",
    items: [
      {
        q: "Do your parts come with a warranty?",
        a: "Yes. Genuine parts carry the manufacturer's warranty, and our OEM-quality parts include a replacement warranty. Specific terms are confirmed with each quote.",
      },
      {
        q: "What is your return policy?",
        a: "Because we verify fitment before ordering, returns are rare. If you receive an incorrect or damaged item, contact us promptly and we'll arrange a replacement or resolution. See our Returns & Refunds page for full details.",
      },
    ],
  },
  {
    group: "Payment & Support",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept convenient, secure payment methods which we'll share when confirming your order, including cash on delivery for eligible UAE orders and bank transfer. Details are provided with your quote.",
      },
      {
        q: "How can I reach your team?",
        a: `The fastest way is WhatsApp at ${wa}. You can also email ${siteConfig.contact.email}. Our team is happy to help with part identification, fitment and quotes.`,
      },
    ],
  },
];

// Flat list (useful for the homepage preview)
export const faqs = faqGroups.flatMap((g) => g.items);

export default faqGroups;
