/**
 * Rayeva AI Systems – Seed Data Script
 * Populates the database with sample products and proposals for testing.
 * Run: node seed_data.js
 */

require("./src/config"); // load .env
const { initDb } = require("./src/database");
const { Product } = require("./src/models");

const SAMPLE_PRODUCTS = [
  {
    name: "Bamboo Toothbrush",
    description:
      "Eco-friendly bamboo toothbrush with charcoal-infused BPA-free bristles. Biodegradable handle made from sustainably harvested moso bamboo. Comes in plastic-free recyclable kraft paper packaging.",
    price: 149.0,
    primary_category: "Personal Care & Hygiene",
    sub_category: "Oral Care",
    seo_tags: [
      "bamboo toothbrush",
      "eco-friendly toothbrush",
      "biodegradable toothbrush",
      "charcoal bristles",
      "plastic-free oral care",
      "sustainable hygiene",
      "zero waste bathroom",
    ],
    sustainability_filters: [
      "plastic-free",
      "biodegradable",
      "compostable",
      "zero-waste",
    ],
  },
  {
    name: "Reusable Beeswax Food Wraps (Set of 3)",
    description:
      "Natural beeswax wraps made from organic cotton, beeswax, jojoba oil, and tree resin. Replace plastic cling wrap. Washable and reusable for up to 1 year. Available in fun botanical prints.",
    price: 499.0,
    primary_category: "Kitchen & Dining",
    sub_category: "Food Storage",
    seo_tags: [
      "beeswax wraps",
      "reusable food wrap",
      "plastic-free kitchen",
      "eco food storage",
      "organic cotton wrap",
      "sustainable kitchen",
      "zero waste food",
    ],
    sustainability_filters: [
      "plastic-free",
      "reusable",
      "organic",
      "zero-waste",
    ],
  },
  {
    name: "Coconut Coir Scrub Pad (Pack of 5)",
    description:
      "Natural coconut coir scrub pads for kitchen cleaning. Handmade by local artisans. Effective on tough grease without scratching. Fully compostable at end of life. No synthetic materials used.",
    price: 199.0,
    primary_category: "Cleaning & Laundry",
    sub_category: "Kitchen Cleaning",
    seo_tags: [
      "coconut coir scrubber",
      "natural scrub pad",
      "eco cleaning",
      "compostable scrubber",
      "plastic-free cleaning",
      "handmade scrubber",
      "sustainable kitchen cleaning",
    ],
    sustainability_filters: [
      "plastic-free",
      "compostable",
      "locally-sourced",
      "chemical-free",
    ],
  },
  {
    name: "Organic Cotton Tote Bag",
    description:
      "GOTS-certified organic cotton tote bag with reinforced handles. 10oz canvas weight, perfect for grocery shopping. Features a fun 'Say No to Plastic' print. Machine washable.",
    price: 349.0,
    primary_category: "Fashion & Accessories",
    sub_category: "Bags & Carriers",
    seo_tags: [
      "organic cotton tote",
      "eco-friendly bag",
      "reusable grocery bag",
      "sustainable fashion",
      "GOTS certified",
      "plastic-free shopping",
      "cotton canvas bag",
    ],
    sustainability_filters: [
      "organic",
      "reusable",
      "plastic-free",
      "fair-trade",
    ],
  },
  {
    name: "Recycled Paper Notebook (A5)",
    description:
      "120-page ruled notebook made from 100% post-consumer recycled paper. Soy-based ink printing. Cardboard cover from recycled materials. Ideal for office and school use.",
    price: 179.0,
    primary_category: "Office & Stationery",
    sub_category: "Notebooks & Journals",
    seo_tags: [
      "recycled notebook",
      "eco stationery",
      "sustainable notebook",
      "recycled paper",
      "green office supplies",
      "soy ink notebook",
      "eco-friendly journal",
    ],
    sustainability_filters: ["recycled", "plastic-free", "zero-waste"],
  },
];

async function seedDatabase() {
  try {
    await initDb();

    // Check if data already exists
    const existing = await Product.count();
    if (existing > 0) {
      console.log(
        `Database already has ${existing} products. Skipping seed.`
      );
      return;
    }

    // Add sample products
    for (const prodData of SAMPLE_PRODUCTS) {
      await Product.create({
        ...prodData,
        ai_categorized_at: new Date(),
      });
    }

    console.log(`✅ Seeded ${SAMPLE_PRODUCTS.length} sample products.`);
  } catch (err) {
    console.error(`❌ Seed failed: ${err.message}`);
  }

  process.exit(0);
}

seedDatabase();
