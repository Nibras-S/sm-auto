import { brandLogos } from "../utils/brandImages";

// Map raw file names → clean display names
const DISPLAY_NAMES = {
  AstonMartin: "Aston Martin",
  audiLogo: "Audi",
  Benz: "Mercedes-Benz",
  BMW: "BMW",
  Bentley: "Bentley",
  chevrolet: "Chevrolet",
  dodge: "Dodge",
  Ferrari: "Ferrari",
  ford: "Ford",
  gmc: "GMC",
  jaguar: "Jaguar",
  jeep: "Jeep",
  lambo: "Lamborghini",
  lexus: "Lexus",
  lr: "Land Rover",
  maserati: "Maserati",
  mclarenne: "McLaren",
  nissan: "Nissan",
  porsche: "Porsche",
  VW: "Volkswagen",
};

export const brands = brandLogos.map((b) => ({
  src: b.src,
  name: DISPLAY_NAMES[b.name] || b.name,
}));

export default brands;
