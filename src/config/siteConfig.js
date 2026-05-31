// ────────────────────────────────────────────────────────────────────────────
// Spare Mec — central site configuration.
// Update real contact details / links here in ONE place.
// (Placeholders are marked with TODO — swap them when available.)
// ────────────────────────────────────────────────────────────────────────────

export const siteConfig = {
  brand: {
    name: "Spare Mec",
    fullName: "Spare Mec Auto Spare Parts",
    legalName: "Spare Mec Auto Spare Parts Trading LLC",
    tagline: "Genuine & OEM-Quality Parts for Luxury Cars",
    foundedYear: 2024,
  },

  contact: {
    // Digits only — used for wa.me / tel links
    whatsappNumber: "971507855298",
    phoneNumber: "971507855298",
    // Human-readable versions
    whatsappDisplay: "+971 50 785 5298",
    phoneDisplay: "+971 50 785 5298",
    email: "contact.smautospares@gmail.com",
    address: "Dubai, United Arab Emirates", // TODO: full street address
    mapsUrl: "https://maps.google.com/?q=Dubai+UAE", // TODO: exact location pin
    hours: "Sat – Thu: 9:00 AM – 8:00 PM",
  },

  social: {
    instagram: "https://www.instagram.com/smautospareparts", // TODO confirm
    facebook: "", // TODO
    tiktok: "", // TODO
    youtube: "", // TODO
  },

  serviceAreas: [
    "United Arab Emirates",
    "Saudi Arabia",
    "Oman",
    "Qatar",
    "Kuwait",
    "Bahrain",
  ],

  // Default text used when a customer taps a generic WhatsApp button
  whatsappGreeting:
    "Hello Spare Mec 👋, I'd like to enquire about auto spare parts. Could you please assist?",
};

export const navLinks = [
  { label: "Home", to: "/" },
  { label: "Catalogue", to: "/catalogue" },
  { label: "Categories", to: "/categories" },
  { label: "About", to: "/about" },
  { label: "FAQs", to: "/faqs" },
  { label: "Contact", to: "/contact" },
];

export default siteConfig;
