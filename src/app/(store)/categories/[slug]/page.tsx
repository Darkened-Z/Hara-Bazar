import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/store/product-card";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort } = await searchParams;

  const [category] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  if (!category) notFound();

  const orderBy = sort === "price-low" ? asc(products.price)
    : sort === "price-high" ? desc(products.price)
    : sort === "rating" ? desc(products.ratingAvg)
    : desc(products.totalSold);

  const categoryProducts = await db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, category.id), eq(products.status, "active")))
    .orderBy(orderBy);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {categoryProducts.length} products
          </p>
        </div>
        <select defaultValue={sort || "popular"}>
          <option value="popular">Most Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {categoryProducts.length === 0 ? (
        <p className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
