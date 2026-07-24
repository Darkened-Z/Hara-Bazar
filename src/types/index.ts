import type { InferSelectModel } from "drizzle-orm";
import type { users, sellers, categories, products, orders, orderItems, addresses, reviews, cartItems } from "@/lib/db/schema";

export type User = InferSelectModel<typeof users>;
export type Seller = InferSelectModel<typeof sellers>;
export type Category = InferSelectModel<typeof categories>;
export type Product = InferSelectModel<typeof products>;
export type Order = InferSelectModel<typeof orders>;
export type OrderItem = InferSelectModel<typeof orderItems>;
export type Address = InferSelectModel<typeof addresses>;
export type Review = InferSelectModel<typeof reviews>;
export type CartItem = InferSelectModel<typeof cartItems>;

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export type ProductWithCategory = Product & { category: Category };

export type OrderWithItems = Order & { items: (OrderItem & { product: Product })[] };

export type CartItemWithProduct = CartItem & { product: Product };
