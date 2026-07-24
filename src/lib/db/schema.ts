import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["customer", "seller"] }).notNull().default("customer"),
  city: text("city").default("Faisalabad"),
  avatarUrl: text("avatar_url"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const sellers = sqliteTable("sellers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  storeName: text("store_name").notNull(),
  storeSlug: text("store_slug").notNull().unique(),
  storeDescription: text("store_description"),
  city: text("city").default("Faisalabad"),
  address: text("address"),
  phone: text("phone"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  accountTitle: text("account_title"),
  status: text("status", { enum: ["pending", "active", "suspended"] }).notNull().default("active"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  abbreviation: text("abbreviation").notNull(),
  color: text("color").notNull(),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sellerId: integer("seller_id").notNull().references(() => sellers.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: integer("price").notNull(),
  comparePrice: integer("compare_price"),
  stock: integer("stock").notNull().default(0),
  sku: text("sku"),
  status: text("status", { enum: ["active", "inactive", "pending"] }).notNull().default("active"),
  ratingAvg: real("rating_avg").default(0),
  totalReviews: integer("total_reviews").default(0),
  totalSold: integer("total_sold").default(0),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const productImages = sqliteTable("product_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const addresses = sqliteTable("addresses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  label: text("label").notNull(),
  addressLine: text("address_line").notNull(),
  city: text("city").notNull().default("Faisalabad"),
  phone: text("phone").notNull(),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("order_number").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  sellerId: integer("seller_id").notNull().references(() => sellers.id),
  status: text("status", {
    enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
  }).notNull().default("pending"),
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  total: integer("total").notNull(),
  paymentMethod: text("payment_method").notNull().default("cod"),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryPhone: text("delivery_phone").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  totalPrice: integer("total_price").notNull(),
});

export const wishlist = sqliteTable("wishlist", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  orderId: integer("order_id").references(() => orders.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const cartItems = sqliteTable("cart_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  seller: one(sellers, { fields: [users.id], references: [sellers.userId] }),
  addresses: many(addresses),
  orders: many(orders),
  reviews: many(reviews),
  cartItems: many(cartItems),
  wishlistItems: many(wishlist),
}));

export const sellersRelations = relations(sellers, ({ one, many }) => ({
  user: one(users, { fields: [sellers.userId], references: [users.id] }),
  products: many(products),
  orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(sellers, { fields: [products.sellerId], references: [sellers.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  seller: one(sellers, { fields: [orders.sellerId], references: [sellers.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));
