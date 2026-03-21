const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/Product");

dotenv.config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};

const products = [
  {
    name: "Apple",
    model: "iPhone 15 Pro",
    serialNumber: "APL-IP15PRO-001",
    description: "6.1-inch display, A17 Pro chip, 128GB storage",
    quantityInStock: 12,
    price: 1299,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Apple Türkiye",
  },
  {
    name: "Samsung",
    model: "Galaxy S24 Ultra",
    serialNumber: "SMS-S24ULTRA-001",
    description: "6.8-inch display, 200MP camera, 256GB storage",
    quantityInStock: 10,
    price: 1199,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Samsung Türkiye",
  },
  {
    name: "Google",
    model: "Pixel 8 Pro",
    serialNumber: "GGL-PX8PRO-001",
    description: "Tensor G3 chip, advanced AI camera features",
    quantityInStock: 8,
    price: 999,
    warrantyStatus: "2 years limited warranty",
    distributorInfo: "Google Devices Distributor",
  },
  {
    name: "Apple",
    model: "MacBook Pro M3",
    serialNumber: "APL-MBPM3-001",
    description: "14-inch laptop, Apple M3 chip, 16GB RAM, 512GB SSD",
    quantityInStock: 6,
    price: 1999,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Apple Türkiye",
  },
  {
    name: "Dell",
    model: "XPS 13",
    serialNumber: "DLL-XPS13-001",
    description: "13.4-inch laptop, Intel i7, 16GB RAM, 512GB SSD",
    quantityInStock: 7,
    price: 1499,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Dell Authorized Distributor",
  },
  {
    name: "ASUS",
    model: "ROG Zephyrus G14",
    serialNumber: "ASS-G14-001",
    description: "Gaming laptop with Ryzen 9, RTX 4060, 16GB RAM",
    quantityInStock: 5,
    price: 1799,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "ASUS Türkiye",
  },
  {
    name: "Sony",
    model: "WH-1000XM5",
    serialNumber: "SNY-XM5-001",
    description: "Wireless noise-cancelling over-ear headphones",
    quantityInStock: 15,
    price: 399,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Sony Eurasia",
  },
  {
    name: "Apple",
    model: "AirPods Pro 2nd Gen",
    serialNumber: "APL-AIRPODSPRO2-001",
    description: "Wireless earbuds with active noise cancellation and spatial audio",
    quantityInStock: 20,
    price: 249,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Apple Türkiye",
  },
  {
    name: "Apple",
    model: "Watch Series 9",
    serialNumber: "APL-WATCH9-001",
    description: "Smartwatch with fitness tracking, ECG, and always-on display",
    quantityInStock: 10,
    price: 499,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Apple Türkiye",
  },
  {
    name: "Samsung",
    model: "Galaxy Watch 6",
    serialNumber: "SMS-WATCH6-001",
    description: "Smartwatch with advanced health and activity tracking",
    quantityInStock: 9,
    price: 349,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Samsung Türkiye",
  },
  {
    name: "Sony",
    model: "PlayStation 5",
    serialNumber: "SNY-PS5-001",
    description: "Next-generation gaming console with ultra-fast SSD",
    quantityInStock: 8,
    price: 499,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Sony Eurasia",
  },
  {
    name: "Microsoft",
    model: "Xbox Series X",
    serialNumber: "MSC-XSX-001",
    description: "4K gaming console with 1TB SSD storage",
    quantityInStock: 6,
    price: 499,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Microsoft Authorized Distributor",
  },
  {
    name: "LG",
    model: "UltraGear 27GP850",
    serialNumber: "LG-27GP850-001",
    description: "27-inch QHD gaming monitor with 165Hz refresh rate",
    quantityInStock: 11,
    price: 449,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "LG Türkiye",
  },
  {
    name: "Dell",
    model: "UltraSharp U2723QE",
    serialNumber: "DLL-U2723QE-001",
    description: "27-inch 4K IPS monitor for professional use",
    quantityInStock: 7,
    price: 599,
    warrantyStatus: "3 years official warranty",
    distributorInfo: "Dell Authorized Distributor",
  },
  {
    name: "Samsung",
    model: "970 EVO Plus 1TB",
    serialNumber: "SMS-970EVO-001",
    description: "1TB NVMe M.2 high-speed SSD storage device",
    quantityInStock: 25,
    price: 129,
    warrantyStatus: "5 years limited warranty",
    distributorInfo: "Samsung Türkiye",
  },
  {
    name: "Logitech",
    model: "MX Master 3S",
    serialNumber: "LGT-MX3S-001",
    description: "Advanced wireless productivity mouse",
    quantityInStock: 18,
    price: 99,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Logitech Türkiye",
  },
  {
    name: "Keychron",
    model: "K6",
    serialNumber: "KYC-K6-001",
    description: "Wireless compact mechanical keyboard",
    quantityInStock: 14,
    price: 89,
    warrantyStatus: "1 year official warranty",
    distributorInfo: "Keychron Regional Distributor",
  },
  {
    name: "Canon",
    model: "EOS R6 Mark II",
    serialNumber: "CNN-R6M2-001",
    description: "Full-frame mirrorless camera for photography and video",
    quantityInStock: 4,
    price: 2499,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Canon Türkiye",
  },
  {
    name: "Dyson",
    model: "V15 Detect",
    serialNumber: "DYS-V15-001",
    description: "Cordless vacuum cleaner with laser dust detection",
    quantityInStock: 6,
    price: 749,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Dyson Türkiye",
  },
  {
    name: "Philips",
    model: "Hue Starter Kit",
    serialNumber: "PHL-HUEKIT-001",
    description: "Smart lighting starter kit with hub and bulbs",
    quantityInStock: 13,
    price: 199,
    warrantyStatus: "2 years official warranty",
    distributorInfo: "Philips Türkiye",
  },
];

const seedProducts = async () => {
  try {
    await connectDB();

    // Optional full reset of the collection
    await mongoose.connection.db
      .dropCollection("products")
      .catch(() => console.log("products collection does not exist, skipping drop"));

    await Product.insertMany(products);

    console.log("20 products inserted successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedProducts();