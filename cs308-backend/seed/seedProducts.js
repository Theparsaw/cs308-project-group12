const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Category = require("../models/Category");
const Product = require("../models/Product");

dotenv.config();

const categories = [
  {
    categoryId: "cat1",
    name: "Smartphones",
    description: "Mobile phones and flagship smartphone devices",
  },
  {
    categoryId: "cat2",
    name: "Laptops",
    description: "Personal and professional laptop computers",
  },
  {
    categoryId: "cat3",
    name: "Audio",
    description: "Headphones, earbuds, and audio accessories",
  },
  {
    categoryId: "cat4",
    name: "Gaming",
    description: "Gaming consoles and gaming-related hardware",
  },
  {
    categoryId: "cat5",
    name: "Accessories",
    description: "Computer and mobile accessories",
  },
];

const products = [
  {
    productId: "p001",
    categoryId: "cat1",
    name: "Apple",
    model: "iPhone 15 Pro",
    serialNumber: "APL-IP15PRO-001",
    description: "Premium Apple smartphone with advanced camera system and high-performance chipset",
    quantityInStock: 12,
    price: 1299,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Apple Türkiye",
  },
  {
    productId: "p002",
    categoryId: "cat1",
    name: "Samsung",
    model: "Galaxy S24 Ultra",
    serialNumber: "SMS-S24ULTRA-001",
    description: "Flagship Samsung smartphone with large display, S Pen support, and premium build",
    quantityInStock: 10,
    price: 1199,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Samsung Türkiye",
  },
  {
    productId: "p003",
    categoryId: "cat1",
    name: "Google",
    model: "Pixel 8 Pro",
    serialNumber: "GGL-PX8PRO-001",
    description: "Google smartphone focused on camera quality and AI-powered features",
    quantityInStock: 8,
    price: 999,
    warrantyStatus: "2 years limited warranty",
    distributorInfo: "Google Devices Distributor",
  },
  {
    productId: "p004",
    categoryId: "cat1",
    name: "Xiaomi",
    model: "14 Ultra",
    serialNumber: "XMI-14ULTRA-001",
    description: "High-end Xiaomi smartphone with premium camera-focused design",
    quantityInStock: 7,
    price: 1099,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Xiaomi Türkiye Distributor",
  },

  {
    productId: "p005",
    categoryId: "cat2",
    name: "Apple",
    model: "MacBook Pro 14 M3",
    serialNumber: "APL-MBP14M3-001",
    description: "Professional Apple laptop designed for development, design, and productivity",
    quantityInStock: 6,
    price: 1999,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Apple Türkiye",
  },
  {
    productId: "p006",
    categoryId: "cat2",
    name: "Dell",
    model: "XPS 13",
    serialNumber: "DLL-XPS13-001",
    description: "Compact premium ultrabook for daily professional and student use",
    quantityInStock: 7,
    price: 1499,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Dell Authorized Distributor",
  },
  {
    productId: "p007",
    categoryId: "cat2",
    name: "ASUS",
    model: "ROG Zephyrus G14",
    serialNumber: "ASS-G14-001",
    description: "Portable high-performance laptop suitable for gaming and creative workloads",
    quantityInStock: 5,
    price: 1799,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "ASUS Türkiye",
  },
  {
    productId: "p008",
    categoryId: "cat2",
    name: "Lenovo",
    model: "ThinkPad X1 Carbon",
    serialNumber: "LNV-X1C-001",
    description: "Business-class lightweight laptop known for durability and keyboard quality",
    quantityInStock: 9,
    price: 1699,
    warrantyStatus: "3 years official warranty",
    distributorInfo: "Lenovo Türkiye",
  },

  {
    productId: "p009",
    categoryId: "cat3",
    name: "Sony",
    model: "WH-1000XM5",
    serialNumber: "SNY-XM5-001",
    description: "Wireless over-ear headphones with premium noise cancellation",
    quantityInStock: 15,
    price: 399,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Sony Eurasia",
  },
  {
    productId: "p010",
    categoryId: "cat3",
    name: "Apple",
    model: "AirPods Pro 2nd Gen",
    serialNumber: "APL-AIRPODSPRO2-001",
    description: "Wireless earbuds with active noise cancellation and seamless Apple ecosystem support",
    quantityInStock: 20,
    price: 249,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Apple Türkiye",
  },
  {
    productId: "p011",
    categoryId: "cat3",
    name: "Bose",
    model: "QuietComfort Ultra Headphones",
    serialNumber: "BSE-QCUH-001",
    description: "Premium wireless headphones designed for comfort and immersive audio",
    quantityInStock: 11,
    price: 429,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Bose Regional Distributor",
  },
  {
    productId: "p012",
    categoryId: "cat3",
    name: "JBL",
    model: "Charge 5",
    serialNumber: "JBL-CHG5-001",
    description: "Portable Bluetooth speaker with durable design and strong battery life",
    quantityInStock: 14,
    price: 179,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "JBL Türkiye",
  },

  {
    productId: "p013",
    categoryId: "cat4",
    name: "Sony",
    model: "PlayStation 5",
    serialNumber: "SNY-PS5-001",
    description: "Current-generation gaming console with fast storage and strong exclusive game support",
    quantityInStock: 8,
    price: 499,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Sony Eurasia",
  },
  {
    productId: "p014",
    categoryId: "cat4",
    name: "Microsoft",
    model: "Xbox Series X",
    serialNumber: "MSC-XSX-001",
    description: "High-performance gaming console focused on 4K gaming and subscription ecosystem",
    quantityInStock: 6,
    price: 499,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Microsoft Authorized Distributor",
  },
  {
    productId: "p015",
    categoryId: "cat4",
    name: "Nintendo",
    model: "Switch OLED",
    serialNumber: "NTD-SWOLED-001",
    description: "Hybrid gaming console with portable and docked play modes",
    quantityInStock: 10,
    price: 349,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Nintendo Regional Distributor",
  },
  {
    productId: "p016",
    categoryId: "cat4",
    name: "Valve",
    model: "Steam Deck OLED",
    serialNumber: "VLV-SDOLED-001",
    description: "Portable handheld gaming device built for PC game libraries",
    quantityInStock: 5,
    price: 549,
    warrantyStatus: "1 year limited warranty",
    distributorInfo: "Valve Authorized Distributor",
  },

  {
    productId: "p017",
    categoryId: "cat5",
    name: "Logitech",
    model: "MX Master 3S",
    serialNumber: "LGT-MX3S-001",
    description: "Wireless productivity mouse designed for professional multi-device workflows",
    quantityInStock: 18,
    price: 99,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Logitech Türkiye",
  },
  {
    productId: "p018",
    categoryId: "cat5",
    name: "Keychron",
    model: "K6",
    serialNumber: "KYC-K6-001",
    description: "Compact wireless mechanical keyboard popular among programmers and office users",
    quantityInStock: 14,
    price: 89,
    warrantyStatus: "1 year official warranty",
    distributorInfo: "Keychron Regional Distributor",
  },
  {
    productId: "p019",
    categoryId: "cat5",
    name: "Samsung",
    model: "970 EVO Plus 1TB",
    serialNumber: "SMS-970EVO-001",
    description: "High-speed internal SSD storage upgrade for laptops and desktops",
    quantityInStock: 25,
    price: 129,
    warrantyStatus: "5 years limited warranty",
    distributorInfo: "Samsung Türkiye",
  },
  {
    productId: "p020",
    categoryId: "cat5",
    name: "LG",
    model: "UltraGear 27GP850",
    serialNumber: "LG-27GP850-001",
    description: "27-inch high-refresh-rate monitor suitable for gaming and multimedia use",
    quantityInStock: 11,
    price: 449,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "LG Türkiye",
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