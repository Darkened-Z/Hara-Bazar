import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { hash } from "bcryptjs";
import * as schema from "./schema";

async function seed() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const db = drizzle(client, { schema });

  console.log("Seeding database...");

  // Categories
  const categoryData = [
    { name: "Oil & Ghee", slug: "oil-ghee", abbreviation: "OG", color: "#E85D2A", sortOrder: 1 },
    { name: "Rice & Flour", slug: "rice-flour", abbreviation: "RF", color: "#2E7D32", sortOrder: 2 },
    { name: "Spices", slug: "spices", abbreviation: "SP", color: "#D32F2F", sortOrder: 3 },
    { name: "Dairy", slug: "dairy", abbreviation: "DA", color: "#1976D2", sortOrder: 4 },
    { name: "Beverages", slug: "beverages", abbreviation: "BV", color: "#7B1FA2", sortOrder: 5 },
    { name: "Snacks", slug: "snacks", abbreviation: "SN", color: "#F57C00", sortOrder: 6 },
    { name: "Cleaning", slug: "cleaning", abbreviation: "CL", color: "#00838F", sortOrder: 7 },
    { name: "Personal Care", slug: "personal-care", abbreviation: "PC", color: "#C2185B", sortOrder: 8 },
  ];

  const cats = await db.insert(schema.categories).values(categoryData).returning();
  console.log(`Inserted ${cats.length} categories`);

  // Seller user
  const sellerHash = await hash("seller123", 12);
  const [sellerUser] = await db.insert(schema.users).values({
    name: "Khan General Store",
    phone: "03001234567",
    passwordHash: sellerHash,
    role: "seller",
    city: "Faisalabad",
  }).returning();

  const [seller] = await db.insert(schema.sellers).values({
    userId: sellerUser.id,
    storeName: "Khan General Store",
    storeSlug: "khan-general-store",
    storeDescription: "Your one-stop shop for quality groceries in Faisalabad.",
    city: "Faisalabad",
    address: "Shop 12, D Ground, Faisalabad",
    phone: "03001234567",
    status: "active",
  }).returning();

  // Customer user
  const customerHash = await hash("customer123", 12);
  await db.insert(schema.users).values({
    name: "Ahmed Khan",
    phone: "03211234567",
    passwordHash: customerHash,
    role: "customer",
    city: "Faisalabad",
  });

  // Products
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  const productData = [
    { name: "Dalda Cooking Oil 5L", slug: "dalda-cooking-oil-5l", categoryId: catMap["oil-ghee"], price: 2850, comparePrice: 3200, stock: 45, description: "Premium quality cooking oil for everyday use. 5 litre family pack.", totalSold: 2340, ratingAvg: 4.5, totalReviews: 128 },
    { name: "Guard Super Basmati Rice 5kg", slug: "guard-basmati-rice-5kg", categoryId: catMap["rice-flour"], price: 1650, comparePrice: 1800, stock: 120, description: "Extra long grain premium basmati rice. Aged for perfect aroma.", totalSold: 5600, ratingAvg: 4.7, totalReviews: 256 },
    { name: "Shan Biryani Masala 6-Pack", slug: "shan-biryani-masala-6", categoryId: catMap["spices"], price: 480, comparePrice: 540, stock: 300, description: "Authentic biryani masala mix. Pack of 6 sachets.", totalSold: 12400, ratingAvg: 4.8, totalReviews: 892 },
    { name: "Tapal Danedar Tea 950g", slug: "tapal-danedar-tea-950g", categoryId: catMap["beverages"], price: 1350, comparePrice: 1500, stock: 200, description: "Strong danedar tea for the perfect cup. 950g economy pack.", totalSold: 18700, ratingAvg: 4.6, totalReviews: 1450 },
    { name: "Lux Soap Bar Pack of 6", slug: "lux-soap-bar-6pack", categoryId: catMap["personal-care"], price: 590, comparePrice: 720, stock: 180, description: "Luxury soap bars with moisturizing cream. Pack of 6.", totalSold: 4500, ratingAvg: 4.3, totalReviews: 340 },
    { name: "Sufi Banaspati Ghee 5kg", slug: "sufi-banaspati-ghee-5kg", categoryId: catMap["oil-ghee"], price: 3200, comparePrice: 3600, stock: 60, description: "Pure banaspati ghee. 5kg tin pack for cooking.", totalSold: 1800, ratingAvg: 4.4, totalReviews: 95 },
    { name: "National Salt 800g x3", slug: "national-salt-800g-x3", categoryId: catMap["spices"], price: 180, comparePrice: null, stock: 500, description: "Iodized table salt. Pack of 3.", totalSold: 8900, ratingAvg: 4.2, totalReviews: 45 },
    { name: "Surf Excel Washing Powder 3kg", slug: "surf-excel-3kg", categoryId: catMap["cleaning"], price: 1250, comparePrice: 1400, stock: 150, description: "Superior stain removal washing powder. 3kg box.", totalSold: 3200, ratingAvg: 4.5, totalReviews: 210 },
    { name: "Peek Freans Sooper 12-Pack", slug: "peek-freans-sooper-12", categoryId: catMap["snacks"], price: 720, comparePrice: 780, stock: 250, description: "Classic Sooper biscuits. Family pack of 12.", totalSold: 6700, ratingAvg: 4.4, totalReviews: 380 },
    { name: "Sunflower Cooking Oil 3L", slug: "sunflower-oil-3l", categoryId: catMap["oil-ghee"], price: 1650, comparePrice: 1900, stock: 80, description: "Light and healthy cooking oil. 3 litre bottle.", totalSold: 2100, ratingAvg: 4.3, totalReviews: 78 },
    { name: "Olpers Full Cream Milk 1L x6", slug: "olpers-milk-1l-x6", categoryId: catMap["dairy"], price: 1440, comparePrice: 1560, stock: 100, description: "Full cream UHT milk. Pack of 6 litres.", totalSold: 9200, ratingAvg: 4.6, totalReviews: 520 },
    { name: "Nurpur Butter 200g", slug: "nurpur-butter-200g", categoryId: catMap["dairy"], price: 420, comparePrice: 460, stock: 90, description: "Pure cream butter. 200g pack.", totalSold: 3400, ratingAvg: 4.5, totalReviews: 190 },
    { name: "Nestle Everyday 900g", slug: "nestle-everyday-900g", categoryId: catMap["beverages"], price: 1180, comparePrice: 1300, stock: 160, description: "Tea whitener for rich creamy tea. 900g pouch.", totalSold: 7800, ratingAvg: 4.4, totalReviews: 670 },
    { name: "Lays Classic Large", slug: "lays-classic-large", categoryId: catMap["snacks"], price: 180, comparePrice: 200, stock: 400, description: "Classic salted potato chips. Large pack.", totalSold: 15000, ratingAvg: 4.2, totalReviews: 120 },
    { name: "Harpic Toilet Cleaner 500ml", slug: "harpic-500ml", categoryId: catMap["cleaning"], price: 380, comparePrice: 420, stock: 220, description: "Power plus disinfectant toilet cleaner.", totalSold: 2800, ratingAvg: 4.3, totalReviews: 85 },
    { name: "Habib Cooking Oil 1L", slug: "habib-oil-1l", categoryId: catMap["oil-ghee"], price: 620, comparePrice: 680, stock: 130, description: "Premium cooking oil. 1 litre bottle.", totalSold: 4100, ratingAvg: 4.1, totalReviews: 62 },
    { name: "Sunridge Chakki Atta 10kg", slug: "sunridge-atta-10kg", categoryId: catMap["rice-flour"], price: 1200, comparePrice: 1350, stock: 70, description: "Stone ground whole wheat flour. 10kg bag.", totalSold: 3900, ratingAvg: 4.5, totalReviews: 245 },
    { name: "Mehran Chili Powder 400g", slug: "mehran-chili-400g", categoryId: catMap["spices"], price: 380, comparePrice: 420, stock: 280, description: "Pure red chili powder. 400g pack.", totalSold: 5600, ratingAvg: 4.3, totalReviews: 198 },
    { name: "Rooh Afza 800ml", slug: "rooh-afza-800ml", categoryId: catMap["beverages"], price: 490, comparePrice: 540, stock: 110, description: "The classic summer drink. 800ml bottle.", totalSold: 8400, ratingAvg: 4.7, totalReviews: 920 },
    { name: "Lifebuoy Handwash 500ml", slug: "lifebuoy-handwash-500ml", categoryId: catMap["personal-care"], price: 450, comparePrice: 500, stock: 190, description: "Antibacterial handwash. 500ml pump bottle.", totalSold: 6200, ratingAvg: 4.4, totalReviews: 310 },
    { name: "Adams Cheese Spread 500g", slug: "adams-cheese-500g", categoryId: catMap["dairy"], price: 680, comparePrice: 750, stock: 85, description: "Creamy cheese spread. 500g jar.", totalSold: 2100, ratingAvg: 4.3, totalReviews: 120 },
    { name: "Kurkure Masala Munch", slug: "kurkure-masala", categoryId: catMap["snacks"], price: 80, comparePrice: 100, stock: 600, description: "Crunchy masala flavored snack.", totalSold: 22000, ratingAvg: 4.1, totalReviews: 95 },
    { name: "Vim Dishwash Bar 300g", slug: "vim-dishwash-300g", categoryId: catMap["cleaning"], price: 120, comparePrice: 140, stock: 350, description: "Grease cutting dishwash bar.", totalSold: 7800, ratingAvg: 4.0, totalReviews: 55 },
    { name: "Falak Basmati Rice 1kg", slug: "falak-basmati-1kg", categoryId: catMap["rice-flour"], price: 480, comparePrice: 520, stock: 200, description: "Premium aged basmati rice. 1kg pack.", totalSold: 4500, ratingAvg: 4.6, totalReviews: 310 },
  ];

  const prods = await db.insert(schema.products).values(
    productData.map((p) => ({ ...p, sellerId: seller.id, status: "active" as const }))
  ).returning();
  console.log(`Inserted ${prods.length} products`);

  console.log("\nSeed complete!");
  console.log("Customer login: 03211234567 / customer123");
  console.log("Seller login:   03001234567 / seller123");

  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
