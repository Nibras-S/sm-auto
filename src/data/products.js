// ────────────────────────────────────────────────────────────────────────────
// Spare Mec product catalogue.
// `imageKey` MUST match the file name (without extension) inside
// src/assets/ProductList/. Prices are intentionally NOT stored — Spare Mec
// operates an inquiry-based model ("Request Best Price").
// Fitment notes are typical/illustrative and confirmed on inquiry.
// ────────────────────────────────────────────────────────────────────────────

export const products = [
  {
    slug: "air-filter-lr011593-land-rover",
    imageKey: "Air Filter LR011593 for Land Rover",
    name: "Air Filter LR011593 for Land Rover",
    partNumber: "LR011593",
    brand: "Land Rover",
    category: "fuel-air",
    categoryName: "Fuel & Air Control",
    type: "OEM / Genuine",
    availability: "In Stock",
    condition: "Brand New",
    warranty: "Genuine OEM warranty",
    featured: true,
    trending: true,
    shortDescription:
      "Genuine engine air filter for Land Rover — maximum airflow and engine protection.",
    description:
      "The LR011593 air filter is engineered to the exact specification of your Land Rover's intake system, capturing dust, debris and contaminants before they reach the combustion chamber. A clean filter restores throttle response, protects internal engine components and helps maintain optimal fuel efficiency.\n\nManufactured from high-grade pleated media with a precise sealing gasket, it delivers a perfect factory fit and consistent filtration performance. Fitting genuine-grade filtration is one of the simplest, most cost-effective ways to extend the life of a premium engine.",
    highlights: [
      "Exact OEM fit and sealing",
      "High dust-holding capacity media",
      "Protects against premature engine wear",
      "Restores airflow and fuel efficiency",
    ],
    specs: [
      { label: "Part Number", value: "LR011593" },
      { label: "Vehicle Make", value: "Land Rover" },
      { label: "Category", value: "Fuel & Air Control" },
      { label: "Component", value: "Engine Air Filter" },
      { label: "Condition", value: "Brand New" },
      { label: "Filter Media", value: "Pleated cellulose" },
      { label: "Country of Origin", value: "United Kingdom" },
      { label: "Warranty", value: "Genuine OEM warranty" },
    ],
    fitment: [
      "Land Rover Range Rover / Range Rover Sport (select model years)",
      "Land Rover Discovery (select model years)",
      "Exact fitment confirmed by VIN on inquiry",
    ],
  },
  {
    slug: "engine-mount-4602407018-mercedes-benz",
    imageKey: "Engine Mount 4602407018 for Mercedes-Benz",
    name: "Engine Mount 4602407018 for Mercedes-Benz",
    partNumber: "A4602407018",
    brand: "Mercedes-Benz",
    category: "engine",
    categoryName: "Engine",
    type: "OEM-Quality Aftermarket",
    availability: "In Stock",
    condition: "Brand New",
    warranty: "6-month replacement warranty",
    featured: true,
    trending: true,
    shortDescription:
      "Hydraulic engine mount for Mercedes-Benz — eliminates vibration and harshness.",
    description:
      "This engine mount (4602407018) secures the engine to the chassis while absorbing vibration and torque for a smooth, refined drive. Worn mounts cause noticeable vibration, clunking over bumps and excessive engine movement that can stress surrounding components.\n\nBuilt to OEM-quality standards with durable rubber-to-metal bonding and, where applicable, hydraulic damping, this mount restores the quiet, planted feel Mercedes-Benz owners expect.",
    highlights: [
      "Eliminates vibration and engine movement",
      "Durable rubber-to-metal bonding",
      "Direct OEM-quality replacement",
      "Protects driveline and surrounding parts",
    ],
    specs: [
      { label: "Part Number", value: "A4602407018 / 4602407018" },
      { label: "Vehicle Make", value: "Mercedes-Benz" },
      { label: "Category", value: "Engine" },
      { label: "Component", value: "Engine Mount" },
      { label: "Position", value: "Left / Right (confirm on inquiry)" },
      { label: "Condition", value: "Brand New" },
      { label: "Material", value: "Reinforced rubber & steel" },
      { label: "Warranty", value: "6-month replacement warranty" },
    ],
    fitment: [
      "Mercedes-Benz G-Class / select chassis",
      "Exact fitment confirmed by VIN on inquiry",
    ],
  },
  {
    slug: "air-filter-99711013030-porsche",
    imageKey: "Air Filter 99711013030 for Porsche",
    name: "Air Filter 99711013030 for Porsche",
    partNumber: "99711013030",
    brand: "Porsche",
    category: "fuel-air",
    categoryName: "Fuel & Air Control",
    type: "OEM / Genuine",
    availability: "In Stock",
    condition: "Brand New",
    warranty: "Genuine OEM warranty",
    featured: false,
    trending: true,
    shortDescription:
      "Genuine Porsche engine air filter for clean, high-performance airflow.",
    description:
      "Precision-engineered air filtration (99711013030) for your Porsche, designed to maximise clean airflow to the engine while trapping fine particulates. Correct filtration is essential to protect performance engines and preserve crisp throttle response.\n\nThe filter's high-efficiency media and exact frame dimensions ensure a leak-free seal and reliable, long-lasting performance.",
    highlights: [
      "Genuine Porsche specification",
      "High-efficiency filtration media",
      "Leak-free factory seal",
      "Preserves performance and economy",
    ],
    specs: [
      { label: "Part Number", value: "99711013030" },
      { label: "Vehicle Make", value: "Porsche" },
      { label: "Category", value: "Fuel & Air Control" },
      { label: "Component", value: "Engine Air Filter" },
      { label: "Condition", value: "Brand New" },
      { label: "Filter Media", value: "High-efficiency pleated" },
      { label: "Country of Origin", value: "Germany" },
      { label: "Warranty", value: "Genuine OEM warranty" },
    ],
    fitment: [
      "Porsche Cayenne / Panamera (select model years)",
      "Exact fitment confirmed by VIN on inquiry",
    ],
  },
  {
    slug: "oil-filter-lr011279-land-rover",
    imageKey: "Oil Filter",
    name: "Oil Filter LR011279 for Land Rover",
    partNumber: "LR011279",
    brand: "Land Rover",
    category: "engine",
    categoryName: "Engine",
    type: "OEM / Genuine",
    availability: "In Stock",
    condition: "Brand New",
    warranty: "Genuine OEM warranty",
    featured: true,
    trending: true,
    shortDescription:
      "Genuine oil filter for Land Rover — clean oil, longer engine life.",
    description:
      "The LR011279 oil filter removes harmful particles and metal debris from engine oil, keeping lubrication clean and protecting bearings, camshafts and turbo components. A genuine-grade filter ensures correct flow rate, bypass behaviour and filtration efficiency for your engine.\n\nReplacing the oil filter at every oil change is essential maintenance — and using the correct part protects one of the most expensive components in the vehicle.",
    highlights: [
      "Removes contaminants and metal debris",
      "Correct flow rate and bypass valve",
      "Protects bearings, turbo and valvetrain",
      "Essential at every oil service",
    ],
    specs: [
      { label: "Part Number", value: "LR011279" },
      { label: "Vehicle Make", value: "Land Rover" },
      { label: "Category", value: "Engine" },
      { label: "Component", value: "Oil Filter" },
      { label: "Condition", value: "Brand New" },
      { label: "Type", value: "Cartridge / spin-on (confirm on inquiry)" },
      { label: "Country of Origin", value: "United Kingdom" },
      { label: "Warranty", value: "Genuine OEM warranty" },
    ],
    fitment: [
      "Land Rover / Range Rover with applicable engine",
      "Exact fitment confirmed by VIN on inquiry",
    ],
  },
  {
    slug: "engine-mount-2222407217-mercedes-benz",
    imageKey: "Engine Mount 2222407217 for Mercedes-Benz",
    name: "Engine Mount 2222407217 for Mercedes-Benz",
    partNumber: "A2222407217",
    brand: "Mercedes-Benz",
    category: "engine",
    categoryName: "Engine",
    type: "OEM-Quality Aftermarket",
    availability: "Limited Stock",
    condition: "Brand New",
    warranty: "6-month replacement warranty",
    featured: false,
    trending: false,
    shortDescription:
      "Hydraulic engine mount (2222407217) for Mercedes-Benz S/E-Class refinement.",
    description:
      "Engine mount 2222407217 restores the smooth, vibration-free ride Mercedes-Benz is known for. As mounts age, the rubber and hydraulic fluid degrade, allowing vibration into the cabin and excess engine movement under load.\n\nThis OEM-quality replacement reinstates factory damping characteristics for a quiet, composed drive and protects connected components from fatigue.",
    highlights: [
      "Hydraulic damping for cabin comfort",
      "Restores factory NVH levels",
      "Precision OEM-quality construction",
      "Direct-fit replacement",
    ],
    specs: [
      { label: "Part Number", value: "A2222407217 / 2222407217" },
      { label: "Vehicle Make", value: "Mercedes-Benz" },
      { label: "Category", value: "Engine" },
      { label: "Component", value: "Engine Mount" },
      { label: "Position", value: "Left / Right (confirm on inquiry)" },
      { label: "Condition", value: "Brand New" },
      { label: "Material", value: "Reinforced rubber & steel" },
      { label: "Warranty", value: "6-month replacement warranty" },
    ],
    fitment: [
      "Mercedes-Benz S-Class / E-Class (W222 / W213 and related)",
      "Exact fitment confirmed by VIN on inquiry",
    ],
  },
  {
    slug: "transmission-support-mount-22316784357-bmw",
    imageKey: "Transmission Support Mount 22316784357 for BMW",
    name: "Transmission Support Mount 22316784357 for BMW",
    partNumber: "22316784357",
    brand: "BMW",
    category: "transmission",
    categoryName: "Transmission",
    type: "OEM-Quality Aftermarket",
    availability: "In Stock",
    condition: "Brand New",
    warranty: "6-month replacement warranty",
    featured: true,
    trending: true,
    shortDescription:
      "Gearbox support mount for BMW — smooth shifts, reduced driveline vibration.",
    description:
      "The transmission support mount (22316784357) cushions the gearbox against the chassis, absorbing vibration and shock during gear changes and acceleration. A failed mount causes clunking, harsh shifts and driveline vibration felt through the cabin.\n\nThis OEM-quality mount restores a smooth, refined driveline and protects the transmission and surrounding components from excess movement.",
    highlights: [
      "Smooths gear changes",
      "Reduces driveline vibration & clunk",
      "Durable rubber-to-metal bonding",
      "Precise OEM-quality fit",
    ],
    specs: [
      { label: "Part Number", value: "22316784357" },
      { label: "Vehicle Make", value: "BMW" },
      { label: "Category", value: "Transmission" },
      { label: "Component", value: "Transmission / Gearbox Mount" },
      { label: "Condition", value: "Brand New" },
      { label: "Material", value: "Reinforced rubber & steel" },
      { label: "Country of Origin", value: "Germany (spec)" },
      { label: "Warranty", value: "6-month replacement warranty" },
    ],
    fitment: [
      "BMW 3 / 5 Series and X models (select chassis)",
      "Exact fitment confirmed by VIN on inquiry",
    ],
  },
  {
    slug: "oil-filter-11427953129-bmw",
    imageKey: "Oil Filter 11427953129 for BMW",
    name: "Oil Filter 11427953129 for BMW",
    partNumber: "11427953129",
    brand: "BMW",
    category: "engine",
    categoryName: "Engine",
    type: "OEM / Genuine",
    availability: "In Stock",
    condition: "Brand New",
    warranty: "Genuine OEM warranty",
    featured: true,
    trending: true,
    shortDescription:
      "Genuine BMW oil filter (11427953129) for clean oil and full engine protection.",
    description:
      "This genuine BMW oil filter (11427953129) keeps engine oil free of contaminants, protecting precision components in modern BMW powertrains. The cartridge-style filter includes the correct sealing rings for a leak-free service.\n\nUsing the correct filter ensures proper oil flow and pressure — critical for turbocharged and high-output BMW engines. Replace at every oil change for maximum engine longevity.",
    highlights: [
      "Genuine BMW specification",
      "Includes correct sealing rings",
      "Maintains oil pressure & flow",
      "Ideal for turbocharged engines",
    ],
    specs: [
      { label: "Part Number", value: "11427953129" },
      { label: "Vehicle Make", value: "BMW" },
      { label: "Category", value: "Engine" },
      { label: "Component", value: "Oil Filter (cartridge)" },
      { label: "Condition", value: "Brand New" },
      { label: "Includes", value: "Sealing O-rings" },
      { label: "Country of Origin", value: "Germany" },
      { label: "Warranty", value: "Genuine OEM warranty" },
    ],
    fitment: [
      "BMW models with B-series / N-series engines (select)",
      "Exact fitment confirmed by VIN on inquiry",
    ],
  },
  {
    slug: "air-filter-98111013000-porsche",
    imageKey: "Air Filter 98111013000 for Porsche",
    name: "Air Filter 98111013000 for Porsche",
    partNumber: "98111013000",
    brand: "Porsche",
    category: "fuel-air",
    categoryName: "Fuel & Air Control",
    type: "OEM / Genuine",
    availability: "Limited Stock",
    condition: "Brand New",
    warranty: "Genuine OEM warranty",
    featured: false,
    trending: false,
    shortDescription:
      "Genuine Porsche air filter (98111013000) for clean, performance airflow.",
    description:
      "Engine air filter 98111013000 maintains a constant supply of clean air to your Porsche's engine, protecting it from dust and grit while preserving throttle response. Built to genuine specification for an exact fit and dependable filtration.\n\nA fresh air filter is inexpensive insurance for a high-value performance engine.",
    highlights: [
      "Genuine Porsche fit",
      "High-efficiency media",
      "Protects performance engine",
      "Maintains throttle response",
    ],
    specs: [
      { label: "Part Number", value: "98111013000" },
      { label: "Vehicle Make", value: "Porsche" },
      { label: "Category", value: "Fuel & Air Control" },
      { label: "Component", value: "Engine Air Filter" },
      { label: "Condition", value: "Brand New" },
      { label: "Filter Media", value: "High-efficiency pleated" },
      { label: "Country of Origin", value: "Germany" },
      { label: "Warranty", value: "Genuine OEM warranty" },
    ],
    fitment: [
      "Porsche 911 (996 / 997) and related (select)",
      "Exact fitment confirmed by VIN on inquiry",
    ],
  },
  {
    slug: "engine-oil-filler-cap-11427525334-bmw",
    imageKey: "Engine Oil Filler Cap 11427525334 for BMW",
    name: "Engine Oil Filler Cap 11427525334 for BMW",
    partNumber: "11427525334",
    brand: "BMW",
    category: "engine",
    categoryName: "Engine",
    type: "OEM / Genuine",
    availability: "In Stock",
    condition: "Brand New",
    warranty: "Genuine OEM warranty",
    featured: false,
    trending: true,
    shortDescription:
      "Genuine BMW oil filler cap (11427525334) with correct seal and thread.",
    description:
      "The oil filler cap (11427525334) seals the engine's oil fill point, maintaining crankcase pressure and preventing oil leaks and contamination. A worn or cracked cap can cause oil weeping, fault codes and a rough idle.\n\nThis genuine cap includes the correct sealing ring and thread for a perfect, leak-free fit.",
    highlights: [
      "Correct seal and thread",
      "Prevents oil leaks & contamination",
      "Maintains crankcase pressure",
      "Genuine BMW part",
    ],
    specs: [
      { label: "Part Number", value: "11427525334" },
      { label: "Vehicle Make", value: "BMW" },
      { label: "Category", value: "Engine" },
      { label: "Component", value: "Oil Filler Cap" },
      { label: "Condition", value: "Brand New" },
      { label: "Includes", value: "Integrated seal" },
      { label: "Country of Origin", value: "Germany" },
      { label: "Warranty", value: "Genuine OEM warranty" },
    ],
    fitment: [
      "Wide range of BMW engines (select)",
      "Exact fitment confirmed by VIN on inquiry",
    ],
  },
  {
    slug: "cabin-ac-filter-lr036369-land-rover",
    imageKey: "AC Filter LR036369 for Land Rover",
    name: "Cabin AC Filter LR036369 for Land Rover",
    partNumber: "LR036369",
    brand: "Land Rover",
    category: "cooling-heating",
    categoryName: "Cooling & Heating",
    type: "OEM / Genuine",
    availability: "In Stock",
    condition: "Brand New",
    warranty: "Genuine OEM warranty",
    featured: true,
    trending: false,
    shortDescription:
      "Genuine cabin/AC filter (LR036369) for clean, fresh air inside your Land Rover.",
    description:
      "The cabin air filter (LR036369) cleans the air entering your Land Rover's interior, trapping pollen, dust and pollutants for a fresh, healthy cabin. A clogged filter reduces airflow from the AC and creates unpleasant odours.\n\nReplacing the cabin filter is quick, affordable maintenance that noticeably improves climate performance and air quality.",
    highlights: [
      "Traps pollen, dust & pollutants",
      "Restores strong AC airflow",
      "Removes cabin odours",
      "Genuine exact fit",
    ],
    specs: [
      { label: "Part Number", value: "LR036369" },
      { label: "Vehicle Make", value: "Land Rover" },
      { label: "Category", value: "Cooling & Heating" },
      { label: "Component", value: "Cabin / AC Filter" },
      { label: "Condition", value: "Brand New" },
      { label: "Filter Media", value: "Multi-layer particulate" },
      { label: "Country of Origin", value: "United Kingdom" },
      { label: "Warranty", value: "Genuine OEM warranty" },
    ],
    fitment: [
      "Land Rover / Range Rover (select model years)",
      "Exact fitment confirmed by VIN on inquiry",
    ],
  },
  {
    slug: "intake-valley-pan-11147507278-bmw",
    imageKey: "Intake Valet Pan 11147507278 for BMW",
    name: "Intake Valley Pan 11147507278 for BMW",
    partNumber: "11147507278",
    brand: "BMW",
    category: "engine",
    categoryName: "Engine",
    type: "OEM-Quality Aftermarket",
    availability: "Made to Order",
    condition: "Brand New",
    warranty: "6-month replacement warranty",
    featured: false,
    trending: false,
    shortDescription:
      "Engine valley pan (11147507278) for BMW V8/V12 — seals the engine valley.",
    description:
      "The intake/valley pan (11147507278) seals the central valley of BMW V-engines, preventing oil and coolant leaks and housing related components. Failure leads to leaks, overheating and contamination — a common service item on higher-mileage V8 and V12 engines.\n\nThis OEM-quality replacement restores a clean, leak-free seal with the correct gaskets where required.",
    highlights: [
      "Seals the engine valley",
      "Prevents oil & coolant leaks",
      "OEM-quality construction",
      "Common V8 / V12 service item",
    ],
    specs: [
      { label: "Part Number", value: "11147507278" },
      { label: "Vehicle Make", value: "BMW" },
      { label: "Category", value: "Engine" },
      { label: "Component", value: "Intake / Valley Pan" },
      { label: "Condition", value: "Brand New" },
      { label: "Engine", value: "Select V8 / V12 (confirm on inquiry)" },
      { label: "Country of Origin", value: "Germany (spec)" },
      { label: "Warranty", value: "6-month replacement warranty" },
    ],
    fitment: [
      "BMW V8 / V12 engines (select chassis)",
      "Exact fitment confirmed by VIN on inquiry",
    ],
  },
  {
    slug: "auxiliary-water-pump-11515a36581-bmw",
    imageKey: "Auxiliary Pump 11515A36581 for BMW",
    name: "Auxiliary Water Pump 11515A36581 for BMW",
    partNumber: "11515A36581",
    brand: "BMW",
    category: "cooling-heating",
    categoryName: "Cooling & Heating",
    type: "OEM / Genuine",
    availability: "In Stock",
    condition: "Brand New",
    warranty: "Genuine OEM warranty",
    featured: true,
    trending: true,
    shortDescription:
      "Electric auxiliary water pump (11515A36581) for BMW cooling circulation.",
    description:
      "The electric auxiliary water pump (11515A36581) circulates coolant to manage engine and turbo temperatures, often running after shutdown to prevent heat soak. A failed pump can cause overheating, heater issues and turbo coolant problems.\n\nThis genuine-grade pump restores reliable coolant circulation and protects your engine's thermal management system.",
    highlights: [
      "Reliable electric coolant circulation",
      "Protects engine & turbo from heat soak",
      "Genuine-grade construction",
      "Direct-fit replacement",
    ],
    specs: [
      { label: "Part Number", value: "11515A36581" },
      { label: "Vehicle Make", value: "BMW" },
      { label: "Category", value: "Cooling & Heating" },
      { label: "Component", value: "Auxiliary Water Pump (electric)" },
      { label: "Condition", value: "Brand New" },
      { label: "Type", value: "Electric, 12V" },
      { label: "Country of Origin", value: "Germany" },
      { label: "Warranty", value: "Genuine OEM warranty" },
    ],
    fitment: [
      "BMW with electric auxiliary cooling (select)",
      "Exact fitment confirmed by VIN on inquiry",
    ],
  },
  {
    slug: "drive-belt-idler-pulley-11287598833-bmw",
    imageKey: "Drive Belt Idler Assembly 11287598833 for BMW",
    name: "Drive Belt Idler Pulley 11287598833 for BMW",
    partNumber: "11287598833",
    brand: "BMW",
    category: "engine",
    categoryName: "Engine",
    type: "OEM-Quality Aftermarket",
    availability: "In Stock",
    condition: "Brand New",
    warranty: "6-month replacement warranty",
    featured: false,
    trending: true,
    shortDescription:
      "Drive belt idler pulley (11287598833) for BMW — smooth, quiet belt operation.",
    description:
      "The drive belt idler pulley (11287598833) guides and tensions the accessory belt, keeping the alternator, water pump and AC compressor turning smoothly. A worn pulley bearing produces squealing, rattling and, ultimately, belt failure.\n\nThis OEM-quality pulley uses a precision sealed bearing for quiet, long-lasting operation.",
    highlights: [
      "Precision sealed bearing",
      "Quiet, smooth belt operation",
      "Prevents squeal & belt failure",
      "OEM-quality durability",
    ],
    specs: [
      { label: "Part Number", value: "11287598833" },
      { label: "Vehicle Make", value: "BMW" },
      { label: "Category", value: "Engine" },
      { label: "Component", value: "Belt Idler Pulley" },
      { label: "Condition", value: "Brand New" },
      { label: "Bearing", value: "Sealed, maintenance-free" },
      { label: "Country of Origin", value: "Germany (spec)" },
      { label: "Warranty", value: "6-month replacement warranty" },
    ],
    fitment: [
      "BMW accessory drive systems (select)",
      "Exact fitment confirmed by VIN on inquiry",
    ],
  },
  {
    slug: "water-pump-lr097165-land-rover",
    imageKey: "Water Pump Lr",
    name: "Water Pump LR097165 for Land Rover",
    partNumber: "LR097165",
    brand: "Land Rover",
    category: "cooling-heating",
    categoryName: "Cooling & Heating",
    type: "OEM / Genuine",
    availability: "Limited Stock",
    condition: "Brand New",
    warranty: "Genuine OEM warranty",
    featured: true,
    trending: true,
    shortDescription:
      "Genuine water pump (LR097165) for Land Rover — reliable engine cooling.",
    description:
      "The water pump (LR097165) circulates coolant through the engine and radiator to maintain safe operating temperatures. A failing pump leads to overheating, coolant leaks and potential engine damage — making timely replacement essential.\n\nThis genuine-grade pump features a precision impeller and durable seal for dependable, long-term cooling performance.",
    highlights: [
      "Reliable coolant circulation",
      "Precision impeller & durable seal",
      "Prevents overheating",
      "Genuine-grade construction",
    ],
    specs: [
      { label: "Part Number", value: "LR097165" },
      { label: "Vehicle Make", value: "Land Rover" },
      { label: "Category", value: "Cooling & Heating" },
      { label: "Component", value: "Water Pump" },
      { label: "Condition", value: "Brand New" },
      { label: "Includes", value: "Gasket / seal (confirm on inquiry)" },
      { label: "Country of Origin", value: "United Kingdom" },
      { label: "Warranty", value: "Genuine OEM warranty" },
    ],
    fitment: [
      "Land Rover / Range Rover (select engines)",
      "Exact fitment confirmed by VIN on inquiry",
    ],
  },
  {
    slug: "thermostat-11538685978-bmw",
    imageKey: "Thermostat 11538685978 for BMW",
    name: "Thermostat 11538685978 for BMW",
    partNumber: "11538685978",
    brand: "BMW",
    category: "cooling-heating",
    categoryName: "Cooling & Heating",
    type: "OEM / Genuine",
    availability: "In Stock",
    condition: "Brand New",
    warranty: "Genuine OEM warranty",
    featured: false,
    trending: true,
    shortDescription:
      "Genuine BMW map-controlled thermostat (11538685978) for precise temperature control.",
    description:
      "The thermostat (11538685978) regulates coolant flow to bring the engine to optimal temperature quickly and hold it there for efficiency and emissions performance. Modern BMW map-controlled thermostats are electronically managed for precise control.\n\nA stuck thermostat causes overheating or over-cooling and triggers fault codes. This genuine unit restores accurate, reliable temperature regulation.",
    highlights: [
      "Map-controlled precise regulation",
      "Faster warm-up & better economy",
      "Prevents overheating / over-cooling",
      "Genuine BMW part",
    ],
    specs: [
      { label: "Part Number", value: "11538685978" },
      { label: "Vehicle Make", value: "BMW" },
      { label: "Category", value: "Cooling & Heating" },
      { label: "Component", value: "Thermostat (map-controlled)" },
      { label: "Condition", value: "Brand New" },
      { label: "Type", value: "Electronically controlled" },
      { label: "Country of Origin", value: "Germany" },
      { label: "Warranty", value: "Genuine OEM warranty" },
    ],
    fitment: [
      "BMW with map-controlled cooling (select engines)",
      "Exact fitment confirmed by VIN on inquiry",
    ],
  },
  {
    slug: "oil-filter-0pc115466-porsche",
    imageKey: "Oil Filter 0PC115466 for Porsche",
    name: "Oil Filter 0PC115466 for Porsche",
    partNumber: "0PC115466",
    brand: "Porsche",
    category: "engine",
    categoryName: "Engine",
    type: "OEM / Genuine",
    availability: "In Stock",
    condition: "Brand New",
    warranty: "Genuine OEM warranty",
    featured: false,
    trending: false,
    shortDescription:
      "Genuine Porsche oil filter (0PC115466) for clean oil and engine protection.",
    description:
      "Oil filter 0PC115466 keeps your Porsche's engine oil clean, removing contaminants that accelerate wear on precision components. Genuine filtration ensures correct flow and bypass behaviour for high-output engines.\n\nReplace at every oil service to safeguard performance and longevity.",
    highlights: [
      "Genuine Porsche specification",
      "Removes harmful contaminants",
      "Correct flow & bypass behaviour",
      "Protects high-output engines",
    ],
    specs: [
      { label: "Part Number", value: "0PC115466" },
      { label: "Vehicle Make", value: "Porsche" },
      { label: "Category", value: "Engine" },
      { label: "Component", value: "Oil Filter" },
      { label: "Condition", value: "Brand New" },
      { label: "Type", value: "Cartridge (confirm on inquiry)" },
      { label: "Country of Origin", value: "Germany" },
      { label: "Warranty", value: "Genuine OEM warranty" },
    ],
    fitment: [
      "Porsche Cayenne / Panamera / Macan (select)",
      "Exact fitment confirmed by VIN on inquiry",
    ],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
export const getProductBySlug = (slug) =>
  products.find((p) => p.slug === slug) || null;

export const getProductsByCategory = (categorySlug) =>
  products.filter((p) => p.category === categorySlug);

export const getRelatedProducts = (product, limit = 4) => {
  if (!product) return [];
  const sameCategory = products.filter(
    (p) => p.slug !== product.slug && p.category === product.category
  );
  const sameBrand = products.filter(
    (p) =>
      p.slug !== product.slug &&
      p.brand === product.brand &&
      p.category !== product.category
  );
  const merged = [];
  const seen = new Set();
  [...sameCategory, ...sameBrand].forEach((p) => {
    if (!seen.has(p.slug)) {
      seen.add(p.slug);
      merged.push(p);
    }
  });
  return merged.slice(0, limit);
};

export const featuredProducts = products.filter((p) => p.featured);
export const trendingProducts = products.filter((p) => p.trending);

export const productBrands = [...new Set(products.map((p) => p.brand))].sort();

export default products;
