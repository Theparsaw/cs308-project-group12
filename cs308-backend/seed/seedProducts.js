const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Category = require("../models/Category");
const Product = require("../models/Product");

dotenv.config();

const CLOUD_NAME = "dzbhkhrrt";

const img = (publicId) =>
  `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`;

const categories = [
  {
    categoryId: "smartphones",
    name: "Smartphones",
    description: "Flagship and mid-range smartphones from top brands",
  },
  {
    categoryId: "laptops",
    name: "Laptops",
    description: "Professional, student, ultrabook, and gaming laptops",
  },
  {
    categoryId: "audio",
    name: "Audio",
    description: "Headphones, earbuds, speakers, and wireless audio devices",
  },
  {
    categoryId: "gaming",
    name: "Gaming",
    description: "Gaming consoles, handhelds, and gaming-focused hardware",
  },
  {
    categoryId: "monitors",
    name: "Monitors",
    description: "Gaming, office, and creator-focused display monitors",
  },
  {
    categoryId: "storage",
    name: "Storage",
    description: "SSDs, portable drives, and USB storage devices",
  },
  {
    categoryId: "wearables",
    name: "Wearables",
    description: "Smartwatches, fitness trackers, and connected wearables",
  },
  {
    categoryId: "tablets",
    name: "Tablets",
    description: "Entertainment and productivity tablets",
  },
  {
    categoryId: "cameras",
    name: "Cameras",
    description: "Mirrorless cameras, action cameras, and digital imaging devices",
  },
  {
    categoryId: "accessories",
    name: "Accessories",
    description: "Keyboards, mice, docks, and computer accessories",
  },
];

const products = [
  // SMARTPHONES (1–5)
  {
    productId: "p001",
    categoryId: "smartphones",
    name: "Apple",
    model: "iPhone 15 Pro",
    serialNumber: "APL-IP15PRO-001",
    description:
      "Premium Apple smartphone with advanced camera system, titanium design, and high-performance chipset.",
    quantityInStock: 12,
    price: 1299,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Apple Türkiye",
    imageUrl: img("iphone-15-pro"),
  },
  {
    productId: "p002",
    categoryId: "smartphones",
    name: "Samsung",
    model: "Galaxy S24 Ultra",
    serialNumber: "SMS-S24ULTRA-001",
    description:
      "Flagship Samsung smartphone with S Pen support, premium build, and high-end camera features.",
    quantityInStock: 10,
    price: 1199,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Samsung Türkiye",
    imageUrl: img("galaxy-s24-ultra"),
  },
  {
    productId: "p003",
    categoryId: "smartphones",
    name: "Google",
    model: "Pixel 8 Pro",
    serialNumber: "GGL-PX8PRO-001",
    description:
      "Google smartphone focused on computational photography, AI-assisted features, and clean Android experience.",
    quantityInStock: 8,
    price: 999,
    warrantyStatus: "2 years limited warranty",
    distributorInfo: "Google Devices Distributor",
    imageUrl: img("pixel-8-pro"),
  },
  {
    productId: "p004",
    categoryId: "smartphones",
    name: "Xiaomi",
    model: "14 Ultra",
    serialNumber: "XMI-14ULTRA-001",
    description:
      "High-end Xiaomi smartphone with premium imaging hardware and flagship-level display and performance.",
    quantityInStock: 7,
    price: 1099,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Xiaomi Türkiye Distributor",
    imageUrl: img("xiaomi-14-ultra"),
  },
  {
    productId: "p005",
    categoryId: "smartphones",
    name: "OnePlus",
    model: "12",
    serialNumber: "ONP-12-001",
    description:
      "Performance-focused Android flagship with fast charging, premium screen, and smooth day-to-day experience.",
    quantityInStock: 9,
    price: 899,
    warrantyStatus: "2 years limited warranty",
    distributorInfo: "OnePlus Regional Distributor",
    imageUrl: img("oneplus-12"),
  },

  // LAPTOPS (6–10)
  {
    productId: "p006",
    categoryId: "laptops",
    name: "Apple",
    model: "MacBook Pro 14 M3",
    serialNumber: "APL-MBP14M3-001",
    description:
      "Professional Apple laptop for development, creative workflows, and high-productivity daily use.",
    quantityInStock: 6,
    price: 1999,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Apple Türkiye",
    imageUrl: img("macbook-pro-14-m3"),
  },
  {
    productId: "p007",
    categoryId: "laptops",
    name: "Dell",
    model: "XPS 13",
    serialNumber: "DLL-XPS13-001",
    description:
      "Compact premium ultrabook with slim design, quality display, and strong portability for everyday work.",
    quantityInStock: 7,
    price: 1499,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Dell Authorized Distributor",
    imageUrl: img("dell-xps-13"),
  },
  {
    productId: "p008",
    categoryId: "laptops",
    name: "ASUS",
    model: "ROG Zephyrus G14",
    serialNumber: "ASS-ROGG14-001",
    description:
      "Portable high-performance gaming and creator laptop balancing strong graphics power with mobility.",
    quantityInStock: 5,
    price: 1799,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "ASUS Türkiye",
    imageUrl: img("asus-rog-zephyrus-g14"),
  },
  {
    productId: "p009",
    categoryId: "laptops",
    name: "Lenovo",
    model: "ThinkPad X1 Carbon",
    serialNumber: "LNV-X1CARBON-001",
    description:
      "Business-class lightweight laptop known for durability, keyboard quality, and enterprise-ready design.",
    quantityInStock: 9,
    price: 1699,
    warrantyStatus: "3 years official warranty",
    distributorInfo: "Lenovo Türkiye",
    imageUrl: img("thinkpad-x1-carbon"),
  },
  {
    productId: "p010",
    categoryId: "laptops",
    name: "HP",
    model: "Spectre x360",
    serialNumber: "HPP-SPX360-001",
    description:
      "Premium convertible laptop with touchscreen design for productivity, creativity, and flexible usage.",
    quantityInStock: 8,
    price: 1599,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "HP Türkiye",
    imageUrl: img("hp-spectre-x360"),
  },

  // AUDIO (11–15)
  {
    productId: "p011",
    categoryId: "audio",
    name: "Sony",
    model: "WH-1000XM5",
    serialNumber: "SNY-WH1000XM5-001",
    description:
      "Wireless over-ear headphones with premium noise cancellation, comfort, and flagship audio performance.",
    quantityInStock: 15,
    price: 399,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Sony Eurasia",
    imageUrl: img("sony-wh1000xm5"),
  },
  {
    productId: "p012",
    categoryId: "audio",
    name: "Apple",
    model: "AirPods Pro 2",
    serialNumber: "APL-AIRPODSPRO2-001",
    description:
      "Wireless earbuds with active noise cancellation and seamless integration into the Apple ecosystem.",
    quantityInStock: 20,
    price: 249,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Apple Türkiye",
    imageUrl: img("airpods-pro-2"),
  },
  {
    productId: "p013",
    categoryId: "audio",
    name: "Bose",
    model: "QuietComfort Ultra",
    serialNumber: "BSE-QCULTRA-001",
    description:
      "Premium wireless headphones focused on comfort, immersive sound, and strong noise isolation.",
    quantityInStock: 11,
    price: 429,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Bose Regional Distributor",
    imageUrl: img("bose-qc-ultra"),
  },
  {
    productId: "p014",
    categoryId: "audio",
    name: "JBL",
    model: "Charge 5",
    serialNumber: "JBL-CHARGE5-001",
    description:
      "Portable Bluetooth speaker with durable outdoor-ready design and reliable battery-powered playback.",
    quantityInStock: 14,
    price: 179,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "JBL Türkiye",
    imageUrl: img("jbl-charge-5"),
  },
  {
    productId: "p015",
    categoryId: "audio",
    name: "Samsung",
    model: "Galaxy Buds2 Pro",
    serialNumber: "SMS-BUDS2PRO-001",
    description:
      "Compact wireless earbuds with active noise cancellation and Samsung ecosystem compatibility.",
    quantityInStock: 16,
    price: 229,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Samsung Türkiye",
    imageUrl: img("galaxy-buds2-pro"),
  },

  // GAMING (16–20)
  {
    productId: "p016",
    categoryId: "gaming",
    name: "Sony",
    model: "PlayStation 5",
    serialNumber: "SNY-PS5-001",
    description:
      "Current-generation gaming console with fast SSD storage and strong exclusive game support.",
    quantityInStock: 8,
    price: 499,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Sony Eurasia",
    imageUrl: img("ps5"),
  },
  {
    productId: "p017",
    categoryId: "gaming",
    name: "Microsoft",
    model: "Xbox Series X",
    serialNumber: "MSC-XSX-001",
    description:
      "High-performance gaming console focused on 4K gaming, Game Pass ecosystem, and premium hardware.",
    quantityInStock: 6,
    price: 499,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Microsoft Authorized Distributor",
    imageUrl: img("xbox-series-x"),
  },
  {
    productId: "p018",
    categoryId: "gaming",
    name: "Nintendo",
    model: "Switch OLED",
    serialNumber: "NTD-SWOLED-001",
    description:
      "Hybrid gaming console supporting both portable and docked play with OLED screen upgrade.",
    quantityInStock: 10,
    price: 349,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Nintendo Regional Distributor",
    imageUrl: img("switch-oled"),
  },
  {
    productId: "p019",
    categoryId: "gaming",
    name: "Valve",
    model: "Steam Deck OLED",
    serialNumber: "VLV-SDOLED-001",
    description:
      "Portable handheld gaming device designed for access to large PC game libraries on the go.",
    quantityInStock: 5,
    price: 549,
    warrantyStatus: "1 year limited warranty",
    distributorInfo: "Valve Authorized Distributor",
    imageUrl: img("steam-deck-oled"),
  },
  {
    productId: "p020",
    categoryId: "gaming",
    name: "ASUS",
    model: "ROG Ally",
    serialNumber: "ASS-ROGALLY-001",
    description:
      "Windows-based handheld gaming device built for portable access to PC gaming platforms.",
    quantityInStock: 7,
    price: 699,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "ASUS Türkiye",
    imageUrl: img("asus-rog-ally"),
  },

  // MONITORS (21–25)
  {
    productId: "p021",
    categoryId: "monitors",
    name: "LG",
    model: "UltraGear 27GP850",
    serialNumber: "LG-27GP850-001",
    description:
      "27-inch high-refresh-rate gaming monitor with strong motion performance and vivid IPS panel.",
    quantityInStock: 11,
    price: 449,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "LG Türkiye",
    imageUrl: img("lg-ultragear-27gp850"),
  },
  {
    productId: "p022",
    categoryId: "monitors",
    name: "Samsung",
    model: "Odyssey G7",
    serialNumber: "SMS-ODYSSEYG7-001",
    description:
      "Curved gaming monitor designed for fast refresh rates, immersive play, and strong contrast.",
    quantityInStock: 9,
    price: 599,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Samsung Türkiye",
    imageUrl: img("odyssey-g7"),
  },
  {
    productId: "p023",
    categoryId: "monitors",
    name: "Dell",
    model: "UltraSharp U2723QE",
    serialNumber: "DLL-U2723QE-001",
    description:
      "Premium 27-inch productivity monitor aimed at office professionals and detail-oriented workflows.",
    quantityInStock: 8,
    price: 649,
    warrantyStatus: "3 years official warranty",
    distributorInfo: "Dell Authorized Distributor",
    imageUrl: img("dell-ultrasharp-u2723qe"),
  },
  {
    productId: "p024",
    categoryId: "monitors",
    name: "ASUS",
    model: "ProArt PA278CV",
    serialNumber: "ASS-PA278CV-001",
    description:
      "Creator-focused monitor built for color-sensitive workflows, design work, and editing tasks.",
    quantityInStock: 7,
    price: 399,
    warrantyStatus: "3 years official warranty",
    distributorInfo: "ASUS Türkiye",
    imageUrl: img("asus-proart-pa278cv"),
  },
  {
    productId: "p025",
    categoryId: "monitors",
    name: "AOC",
    model: "24G2",
    serialNumber: "AOC-24G2-001",
    description:
      "Affordable gaming monitor offering fast refresh rate performance for everyday competitive gaming.",
    quantityInStock: 13,
    price: 219,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "AOC Regional Distributor",
    imageUrl: img("aoc-24g2"),
  },

  // STORAGE (26–30)
  {
    productId: "p026",
    categoryId: "storage",
    name: "Samsung",
    model: "970 EVO Plus 1TB",
    serialNumber: "SMS-970EVO-001",
    description:
      "High-speed NVMe SSD storage upgrade suitable for laptops, desktops, and demanding applications.",
    quantityInStock: 25,
    price: 129,
    warrantyStatus: "5 years limited warranty",
    distributorInfo: "Samsung Türkiye",
    imageUrl: img("samsung-970-evo-plus"),
  },
  {
    productId: "p027",
    categoryId: "storage",
    name: "Western Digital",
    model: "WD Black SN850X",
    serialNumber: "WDC-SN850X-001",
    description:
      "Performance NVMe SSD designed for gaming systems, heavy workloads, and fast load times.",
    quantityInStock: 18,
    price: 169,
    warrantyStatus: "5 years limited warranty",
    distributorInfo: "Western Digital Distributor",
    imageUrl: img("wd-black-sn850x"),
  },
  {
    productId: "p028",
    categoryId: "storage",
    name: "Crucial",
    model: "P3 Plus",
    serialNumber: "CRC-P3PLUS-001",
    description:
      "Affordable PCIe NVMe SSD balancing everyday speed, value, and modern system compatibility.",
    quantityInStock: 20,
    price: 99,
    warrantyStatus: "5 years limited warranty",
    distributorInfo: "Crucial Regional Distributor",
    imageUrl: img("crucial-p3-plus"),
  },
  {
    productId: "p029",
    categoryId: "storage",
    name: "SanDisk",
    model: "Extreme Portable SSD",
    serialNumber: "SDK-EXTPSSD-001",
    description:
      "Portable external SSD with compact design, rugged build, and fast file transfer capability.",
    quantityInStock: 15,
    price: 149,
    warrantyStatus: "3 years limited warranty",
    distributorInfo: "SanDisk Authorized Distributor",
    imageUrl: img("sandisk-extreme-ssd"),
  },
  {
    productId: "p030",
    categoryId: "storage",
    name: "Kingston",
    model: "DataTraveler USB",
    serialNumber: "KNG-DATATRAVELER-001",
    description:
      "Reliable USB flash storage device for everyday backup, transport, and quick file sharing.",
    quantityInStock: 30,
    price: 29,
    warrantyStatus: "2 years limited warranty",
    distributorInfo: "Kingston Türkiye",
    imageUrl: img("kingston-datatraveler"),
  },

  // WEARABLES (31–35)
  {
    productId: "p031",
    categoryId: "wearables",
    name: "Apple",
    model: "Watch Series 9",
    serialNumber: "APL-WATCH9-001",
    description:
      "Smartwatch for fitness, health tracking, notifications, and deep Apple ecosystem integration.",
    quantityInStock: 14,
    price: 399,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Apple Türkiye",
    imageUrl: img("apple-watch-series-9"),
  },
  {
    productId: "p032",
    categoryId: "wearables",
    name: "Samsung",
    model: "Galaxy Watch 6",
    serialNumber: "SMS-GWATCH6-001",
    description:
      "Modern smartwatch for health tracking, fitness monitoring, and Android-connected daily use.",
    quantityInStock: 12,
    price: 329,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Samsung Türkiye",
    imageUrl: img("galaxy-watch-6"),
  },
  {
    productId: "p033",
    categoryId: "wearables",
    name: "Garmin",
    model: "Fenix 7",
    serialNumber: "GRM-FENIX7-001",
    description:
      "Premium multisport smartwatch with strong GPS features, outdoor focus, and long battery life.",
    quantityInStock: 6,
    price: 699,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Garmin Authorized Distributor",
    imageUrl: img("garmin-fenix-7"),
  },
  {
    productId: "p034",
    categoryId: "wearables",
    name: "Fitbit",
    model: "Charge 6",
    serialNumber: "FTB-CHARGE6-001",
    description:
      "Fitness tracker built for health insights, workouts, and comfortable everyday wear.",
    quantityInStock: 10,
    price: 179,
    warrantyStatus: "2 years limited warranty",
    distributorInfo: "Fitbit Regional Distributor",
    imageUrl: img("fitbit-charge-6"),
  },
  {
    productId: "p035",
    categoryId: "wearables",
    name: "Huawei",
    model: "Watch GT 4",
    serialNumber: "HWI-WATCHGT4-001",
    description:
      "Stylish smartwatch with long battery life and health-oriented smart features for daily use.",
    quantityInStock: 11,
    price: 249,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Huawei Türkiye",
    imageUrl: img("huawei-watch-gt4"),
  },

  // TABLETS (36–40)
  {
    productId: "p036",
    categoryId: "tablets",
    name: "Apple",
    model: "iPad Pro M2",
    serialNumber: "APL-IPADPROM2-001",
    description:
      "Premium tablet for note-taking, media use, productivity, and creative professional workflows.",
    quantityInStock: 9,
    price: 1099,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Apple Türkiye",
    imageUrl: img("ipad-pro-m2"),
  },
  {
    productId: "p037",
    categoryId: "tablets",
    name: "Samsung",
    model: "Galaxy Tab S9",
    serialNumber: "SMS-TABS9-001",
    description:
      "High-end Android tablet with premium display, stylus support, and versatile entertainment features.",
    quantityInStock: 8,
    price: 899,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Samsung Türkiye",
    imageUrl: img("galaxy-tab-s9"),
  },
  {
    productId: "p038",
    categoryId: "tablets",
    name: "Xiaomi",
    model: "Pad 6",
    serialNumber: "XMI-PAD6-001",
    description:
      "Value-focused tablet designed for everyday media use, light productivity, and smooth performance.",
    quantityInStock: 10,
    price: 499,
    warrantyStatus: "2 years limited warranty",
    distributorInfo: "Xiaomi Türkiye Distributor",
    imageUrl: img("xiaomi-pad-6"),
  },
  {
    productId: "p039",
    categoryId: "tablets",
    name: "Lenovo",
    model: "Tab P12",
    serialNumber: "LNV-TABP12-001",
    description:
      "Large-screen Android tablet suitable for study, streaming, and family-oriented tablet use.",
    quantityInStock: 7,
    price: 429,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Lenovo Türkiye",
    imageUrl: img("lenovo-tab-p12"),
  },
  {
    productId: "p040",
    categoryId: "tablets",
    name: "Amazon",
    model: "Fire HD 10",
    serialNumber: "AMZ-FIREHD10-001",
    description:
      "Affordable tablet designed for media consumption, reading, and casual everyday entertainment.",
    quantityInStock: 13,
    price: 189,
    warrantyStatus: "1 year limited warranty",
    distributorInfo: "Amazon Devices Distributor",
    imageUrl: img("fire-hd-10"),
  },

  // CAMERAS (41–45)
  {
    productId: "p041",
    categoryId: "cameras",
    name: "Sony",
    model: "A7 IV",
    serialNumber: "SNY-A7IV-001",
    description:
      "Full-frame mirrorless camera aimed at hybrid shooters needing strong photo and video capabilities.",
    quantityInStock: 5,
    price: 2499,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Sony Eurasia",
    imageUrl: img("sony-a7-iv"),
  },
  {
    productId: "p042",
    categoryId: "cameras",
    name: "Canon",
    model: "EOS R6",
    serialNumber: "CNN-EOSR6-001",
    description:
      "Full-frame mirrorless camera balancing speed, autofocus, and versatile multimedia shooting.",
    quantityInStock: 4,
    price: 2299,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Canon Authorized Distributor",
    imageUrl: img("canon-eos-r6"),
  },
  {
    productId: "p043",
    categoryId: "cameras",
    name: "Nikon",
    model: "Z6 II",
    serialNumber: "NKN-Z6II-001",
    description:
      "Mirrorless full-frame camera with balanced performance for enthusiasts and professional creators.",
    quantityInStock: 4,
    price: 1999,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Nikon Regional Distributor",
    imageUrl: img("nikon-z6-ii"),
  },
  {
    productId: "p044",
    categoryId: "cameras",
    name: "Fujifilm",
    model: "X-T5",
    serialNumber: "FJI-XT5-001",
    description:
      "Retro-styled mirrorless camera popular for photography, color science, and travel-friendly design.",
    quantityInStock: 6,
    price: 1699,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Fujifilm Authorized Distributor",
    imageUrl: img("fujifilm-xt5"),
  },
  {
    productId: "p045",
    categoryId: "cameras",
    name: "GoPro",
    model: "Hero 12",
    serialNumber: "GPR-HERO12-001",
    description:
      "Action camera built for travel, sports, and compact high-quality video capture in dynamic environments.",
    quantityInStock: 10,
    price: 399,
    warrantyStatus: "2 years limited warranty",
    distributorInfo: "GoPro Regional Distributor",
    imageUrl: img("gopro-hero-12"),
  },

  // ACCESSORIES (46–50)
  {
    productId: "p046",
    categoryId: "accessories",
    name: "Logitech",
    model: "MX Master 3S",
    serialNumber: "LGT-MX3S-001",
    description:
      "Wireless productivity mouse designed for multi-device workflows, comfort, and precise control.",
    quantityInStock: 18,
    price: 99,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Logitech Türkiye",
    imageUrl: img("mx-master-3s"),
  },
  {
    productId: "p047",
    categoryId: "accessories",
    name: "Keychron",
    model: "K6",
    serialNumber: "KYC-K6-001",
    description:
      "Compact wireless mechanical keyboard popular among programmers, students, and office users.",
    quantityInStock: 14,
    price: 89,
    warrantyStatus: "1 year official warranty",
    distributorInfo: "Keychron Regional Distributor",
    imageUrl: img("keychron-k6"),
  },
  {
    productId: "p048",
    categoryId: "accessories",
    name: "Razer",
    model: "DeathAdder V3",
    serialNumber: "RZR-DAV3-001",
    description:
      "Ergonomic gaming mouse built for fast tracking, competitive play, and lightweight performance.",
    quantityInStock: 16,
    price: 79,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Razer Authorized Distributor",
    imageUrl: img("razer-deathadder-v3"),
  },
  {
    productId: "p049",
    categoryId: "accessories",
    name: "Anker",
    model: "USB-C Hub",
    serialNumber: "ANK-USBC-HUB-001",
    description:
      "Useful connectivity hub expanding laptop ports for modern USB-C based work setups.",
    quantityInStock: 22,
    price: 59,
    warrantyStatus: "18 months limited warranty",
    distributorInfo: "Anker Regional Distributor",
    imageUrl: img("anker-usb-c-hub"),
  },
  {
    productId: "p050",
    categoryId: "accessories",
    name: "Apple",
    model: "Magic Keyboard",
    serialNumber: "APL-MAGICKB-001",
    description:
      "Minimal wireless keyboard designed for Apple users seeking clean design and responsive typing.",
    quantityInStock: 12,
    price: 129,
    warrantyStatus: "1 year official warranty",
    distributorInfo: "Apple Türkiye",
    imageUrl: img("apple-magic-keyboard"),
  },
];

const seedData = async () => {
  try {
    await connectDB();

    await Category.deleteMany({});
    await Product.deleteMany({});

    await Category.insertMany(categories);
    await Product.insertMany(products);

    console.log("Categories inserted successfully");
    console.log("Products inserted successfully");
    console.log("Database seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();