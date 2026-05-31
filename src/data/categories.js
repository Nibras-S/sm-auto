import engineIcon from "../assets/engine.png";
import electricalIcon from "../assets/electrical.png";
import steeringIcon from "../assets/steering.png";
import transmissionIcon from "../assets/transmission.png";
import coolingIcon from "../assets/coolingandheating.png";
import oilIcon from "../assets/lubri.png";
import brakesIcon from "../assets/brasus.png";
import airIcon from "../assets/airintake.png";

export const categories = [
  {
    slug: "engine",
    name: "Engine",
    icon: engineIcon,
    tagline: "The heart of every drive",
    description:
      "Mounts, filters, gaskets, pulleys, timing components and core engine parts engineered to keep your motor running smoothly and reliably.",
  },
  {
    slug: "electrical-lighting",
    name: "Electrical & Lighting",
    icon: electricalIcon,
    tagline: "Power, sensors & visibility",
    description:
      "Sensors, modules, switches, ignition components and OEM-grade lighting that restore factory performance and safety.",
  },
  {
    slug: "steering",
    name: "Steering",
    icon: steeringIcon,
    tagline: "Precision & control",
    description:
      "Steering racks, pumps, tie rods and linkages for sharp, confident handling and a precise feel at the wheel.",
  },
  {
    slug: "transmission",
    name: "Transmission",
    icon: transmissionIcon,
    tagline: "Smooth power delivery",
    description:
      "Mounts, supports, solenoids and drivetrain components that deliver seamless gear changes and durable performance.",
  },
  {
    slug: "cooling-heating",
    name: "Cooling & Heating",
    icon: coolingIcon,
    tagline: "Optimal temperature, always",
    description:
      "Water pumps, thermostats, radiators, AC filters and climate components that protect your engine and keep the cabin comfortable.",
  },
  {
    slug: "oils-lubricants",
    name: "Engine Oils & Lubricants",
    icon: oilIcon,
    tagline: "Protection that lasts",
    description:
      "Premium engine oils, fluids and lubricants matched to manufacturer specifications for maximum protection and longevity.",
  },
  {
    slug: "brakes-suspension",
    name: "Brakes & Suspension",
    icon: brakesIcon,
    tagline: "Stop & ride with confidence",
    description:
      "Brake pads, discs, sensors, arms, bushings and shock components for safe stopping power and a refined, controlled ride.",
  },
  {
    slug: "fuel-air",
    name: "Fuel & Air Control",
    icon: airIcon,
    tagline: "Breathe & burn efficiently",
    description:
      "Air filters, intake components, fuel pumps and injectors that keep combustion clean, efficient and responsive.",
  },
];

export const getCategory = (slug) =>
  categories.find((c) => c.slug === slug) || null;

export default categories;
