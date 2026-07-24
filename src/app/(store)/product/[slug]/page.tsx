import { db } from "@/lib/db";
import { products, sellers, categories, reviews, users } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { formatPrice, discountPercent } from "@/lib/utils";
import { Star, Store, ShoppingCart, Heart } from "lucide-react";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductCard } from "@/components/store/product-card";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!product) notFound();

  const [[seller], [category], productReviews, related] = await Promise.all([
    db.select().from(sellers).where(eq(sellers.id, product.sellerId)).limit(1),
    db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1),
    db
      .select({ rating: reviews.rating, comment: reviews.comment, createdAt: reviews.createdAt, userName: users.name })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, product.id))
      .orderBy(desc(reviews.createdAt))
      .limit(10),
    db
      .select()
      .from(products)
      .where(and(eq(products.categoryId, product.categoryId), eq(products.status, "active")))
      .limit(4),
  ]);

  const discount = product.comparePrice ? discountPercent(product.comparePrice, product.price) : 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl" style={{ background: 'var(--surface-alt)' }}>
          <div className="flex h-full items-center justify-center text-8xl" style={{ color: 'var(--text-muted)' }}>
            📦
          </div>
          {discount > 0 && (
            <span className="absolute left-4 top-4 rounded-full px-3 py-1 text-sm font-bold" style={{ background: 'var(--danger)', color: '#fff' }}>
              -{discount}%
            </span>
          )}
        </div>

        {/* Details */}
        <div>
          {category && (
            <span className="text-sm" style={{ color: 'var(--primary)' }}>{category.name}</span>
          )}
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">{product.name}</h1>

          {product.ratingAvg && product.ratingAvg > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star style={{ width: 16, height: 16, fill: 'var(--warning)', color: 'var(--warning)' }} />
                <span className="font-medium">{product.ratingAvg}</span>
              </div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({product.totalReviews} reviews)</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>·</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{product.totalSold} sold</span>
            </div>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-lg line-through" style={{ color: 'var(--text-muted)' }}>{formatPrice(product.comparePrice)}</span>
            )}
          </div>

          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>

          <div className="mt-6 flex items-center gap-3">
            <Store style={{ width: 20, height: 20, color: 'var(--text-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sold by <strong>{seller?.storeName}</strong>
            </span>
          </div>

          <div className="mt-2 text-sm">
            {product.stock > 0 ? (
              <span style={{ color: 'var(--success)' }}>In Stock ({product.stock} available)</span>
            ) : (
              <span style={{ color: 'var(--danger)' }}>Out of Stock</span>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <AddToCartButton productId={product.id} stock={product.stock} />
          </div>
        </div>
      </div>

      {/* Reviews */}
      {productReviews.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold">Customer Reviews</h2>
          <div className="space-y-4">
            {productReviews.map((review, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        style={{
                          width: 16,
                          height: 16,
                          fill: j < review.rating ? 'var(--warning)' : 'transparent',
                          color: j < review.rating ? 'var(--warning)' : 'var(--text-muted)',
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.userName}</span>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related.filter((r) => r.id !== product.id).length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold">Related Products</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {related
              .filter((r) => r.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
