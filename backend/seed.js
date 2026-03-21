require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/category');
const Product = require('./models/product');

const seedData = async () => {
  await connectDB();

  await Category.deleteMany();
  await Product.deleteMany();

  const categories = await Category.insertMany([
    {
      category_id: 'cat1',
      name: "Men's Clothing",
      description: "Clothing and fashion items for men"
    },
    {
      category_id: 'cat2',
      name: "Women's Clothing",
      description: "Clothing and fashion items for women"
    },
    {
      category_id: 'cat3',
      name: "Kids & Baby",
      description: "Clothing for children and babies"
    }
  ]);

  console.log('Categories inserted');

  await Product.insertMany([

    // Men's Clothing (cat1)
    {
      product_id: 'p001',
      category_id: 'cat1',
      distributor_id: 'dist1',
      name: "Levi's 501 Original Jeans",
      model: 'LV501-32',
      serial_number: 'SN-LV501-001',
      description: 'Classic straight fit jeans in dark wash denim, timeless style for everyday wear',
      stock_quantity: 50,
      price: 59.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },
    {
      product_id: 'p002',
      category_id: 'cat1',
      distributor_id: 'dist1',
      name: 'Nike Dri-FIT T-Shirt',
      model: 'NK-DRFT-BLK',
      serial_number: 'SN-NKDFT-002',
      description: 'Lightweight Nike Dri-FIT training t-shirt with moisture wicking technology',
      stock_quantity: 80,
      price: 29.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },
    {
      product_id: 'p003',
      category_id: 'cat1',
      distributor_id: 'dist2',
      name: 'Zara Slim Fit Blazer',
      model: 'ZR-BLZ-NVY',
      serial_number: 'SN-ZRBLZ-003',
      description: 'Navy slim fit blazer perfect for smart casual and formal occasions',
      stock_quantity: 25,
      price: 89.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },
    {
      product_id: 'p004',
      category_id: 'cat1',
      distributor_id: 'dist2',
      name: 'H&M Regular Fit Oxford Shirt',
      model: 'HM-OXF-WHT',
      serial_number: 'SN-HMOXF-004',
      description: 'Classic white oxford shirt in regular fit, 100% cotton',
      stock_quantity: 60,
      price: 24.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },
    {
      product_id: 'p005',
      category_id: 'cat1',
      distributor_id: 'dist1',
      name: 'Adidas Track Pants',
      model: 'AD-TRK-BLK',
      serial_number: 'SN-ADTRK-005',
      description: 'Adidas classic 3-stripe track pants in black, comfortable everyday wear',
      stock_quantity: 45,
      price: 44.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },
    {
      product_id: 'p006',
      category_id: 'cat1',
      distributor_id: 'dist2',
      name: 'Mango Wool Blend Coat',
      model: 'MNG-CT-GRY',
      serial_number: 'SN-MNGCT-006',
      description: 'Grey wool blend long coat, warm and stylish for winter season',
      stock_quantity: 20,
      price: 129.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },

    // Women's Clothing (cat2)
    {
      product_id: 'p007',
      category_id: 'cat2',
      distributor_id: 'dist2',
      name: 'Zara Floral Midi Dress',
      model: 'ZR-DRS-FLR',
      serial_number: 'SN-ZRDRS-007',
      description: 'Elegant floral print midi dress with v-neck and short sleeves',
      stock_quantity: 35,
      price: 49.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },
    {
      product_id: 'p008',
      category_id: 'cat2',
      distributor_id: 'dist2',
      name: 'H&M High Waist Trousers',
      model: 'HM-TRS-BLK',
      serial_number: 'SN-HMTRS-008',
      description: 'Sleek black high waist trousers with wide leg fit, office ready',
      stock_quantity: 40,
      price: 34.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },
    {
      product_id: 'p009',
      category_id: 'cat2',
      distributor_id: 'dist3',
      name: 'Nike Women Running Jacket',
      model: 'NK-WRJ-PNK',
      serial_number: 'SN-NKWRJ-009',
      description: 'Lightweight pink running jacket with zip pockets and reflective details',
      stock_quantity: 30,
      price: 64.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },
    {
      product_id: 'p010',
      category_id: 'cat2',
      distributor_id: 'dist2',
      name: 'Mango Knit Turtleneck Sweater',
      model: 'MNG-SWT-CRM',
      serial_number: 'SN-MNGSWT-010',
      description: 'Cream knit turtleneck sweater, soft fabric perfect for autumn and winter',
      stock_quantity: 28,
      price: 39.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },
    {
      product_id: 'p011',
      category_id: 'cat2',
      distributor_id: 'dist3',
      name: "Levi's 721 High Rise Skinny Jeans",
      model: 'LV721-28',
      serial_number: 'SN-LV721-011',
      description: "Levi's 721 high rise skinny jeans in light blue wash",
      stock_quantity: 55,
      price: 54.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },
    {
      product_id: 'p012',
      category_id: 'cat2',
      distributor_id: 'dist2',
      name: 'Zara Leather Look Biker Jacket',
      model: 'ZR-BJK-BLK',
      serial_number: 'SN-ZRBJK-012',
      description: 'Black faux leather biker jacket with zip details and quilted lining',
      stock_quantity: 18,
      price: 99.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },

    // Kids & Baby (cat3)
    {
      product_id: 'p013',
      category_id: 'cat3',
      distributor_id: 'dist3',
      name: 'H&M Baby Cotton Bodysuit Set',
      model: 'HM-BBS-WHT',
      serial_number: 'SN-HMBBS-013',
      description: 'Set of 5 white cotton bodysuits for babies 0-6 months, soft and breathable',
      stock_quantity: 70,
      price: 19.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },
    {
      product_id: 'p014',
      category_id: 'cat3',
      distributor_id: 'dist3',
      name: 'Nike Kids Tracksuit',
      model: 'NK-KTS-BLU',
      serial_number: 'SN-NKKTS-014',
      description: 'Blue Nike kids tracksuit with zip top and elastic waist pants ages 4-6',
      stock_quantity: 40,
      price: 44.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },
    {
      product_id: 'p015',
      category_id: 'cat3',
      distributor_id: 'dist2',
      name: 'Zara Kids Denim Dungarees',
      model: 'ZR-DNG-BLU',
      serial_number: 'SN-ZRDNG-015',
      description: 'Blue denim dungarees for kids ages 3-8, adjustable straps',
      stock_quantity: 32,
      price: 29.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },
    {
      product_id: 'p016',
      category_id: 'cat3',
      distributor_id: 'dist3',
      name: 'Mango Baby Knit Cardigan',
      model: 'MNG-BKC-PNK',
      serial_number: 'SN-MNGBKC-016',
      description: 'Pink soft knit cardigan for babies 6-18 months with button closure',
      stock_quantity: 45,
      price: 22.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },
    {
      product_id: 'p017',
      category_id: 'cat3',
      distributor_id: 'dist2',
      name: 'H&M Kids Puffer Jacket',
      model: 'HM-KPJ-RED',
      serial_number: 'SN-HMKPJ-017',
      description: 'Red puffer jacket for kids ages 4-10, warm and water repellent',
      stock_quantity: 25,
      price: 34.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    },
    {
      product_id: 'p018',
      category_id: 'cat3',
      distributor_id: 'dist3',
      name: 'Adidas Kids Shorts 3-Pack',
      model: 'AD-KSH-MLT',
      serial_number: 'SN-ADKSH-018',
      description: 'Pack of 3 Adidas cotton shorts for kids ages 5-12 in assorted colors',
      stock_quantity: 55,
      price: 27.99,
      warranty_status: false,
      image_url: '',
      is_active: true
    }
  ]);

  console.log('Products inserted');
  console.log('Database seeded successfully!');
  process.exit(0);
};

seedData();