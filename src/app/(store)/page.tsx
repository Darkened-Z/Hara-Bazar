import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { ProductCard } from "@/components/store/product-card";
import { CategoryCard } from "@/components/store/category-card";
import { FlashCountdown } from "@/components/store/flash-countdown";
import { formatPrice, discountPercent } from "@/lib/utils";
import Link from "next/link";

export default async function HomePage() {
  const [allCategories, allProducts] = await Promise.all([
    db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder),
    db.select().from(products).where(eq(products.status, "active")).orderBy(desc(products.totalSold)).limit(24),
  ]);

  const flashProducts = allProducts.filter((p) => p.comparePrice).slice(0, 5);
  const hotProducts = allProducts.slice(0, 4);
  const featuredProducts = allProducts.slice(4, 10);

  return (
    <div style={{ animation: "fadeUp 0.4s ease-out" }}>
      {/* Hero Banner */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{
          borderRadius: 14, overflow: "hidden", position: "relative", height: 150,
          background: "linear-gradient(135deg, #1B5E3B 0%, #0D3321 100%)",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "24px 32px",
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)",
            textTransform: "uppercase", letterSpacing: 1, marginBottom: 4,
          }}>
            Fresh & Local
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 4 }}>
            Groceries delivered in Faisalabad
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
            Quality products from local sellers. Cash on delivery.
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ padding: "16px 16px 0" }}>
        <div className="section-header">
          <h3>Categories</h3>
          <Link href="/categories">See all</Link>
        </div>
        <div className="category-grid">
          {allCategories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>

      {/* Flash Deals */}
      {flashProducts.length > 0 && (
        <div style={{ padding: "20px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Flash Deals</h3>
              <FlashCountdown />
            </div>
            <Link href="/search" style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)" }}>See all</Link>
          </div>
          <div className="flash-row">
            {flashProducts.map((p) => {
              const discount = p.comparePrice ? discountPercent(p.price, p.comparePrice) : 0;
              const soldPct = Math.min(90, Math.floor(((p.totalSold || 0) / Math.max(p.stock + (p.totalSold || 0), 1)) * 100));
              return (
                <Link key={p.id} href={`/product/${p.slug}`} className="flash-card">
                  <div className="flash-img">
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#C8C8BE", opacity: 0.5 }}>{p.name[0]}</div>
                    {discount > 0 && <div className="flash-badge">-{discount}%</div>}
                  </div>
                  <div className="flash-info">
                    <div className="flash-name">{p.name}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                      <div className="flash-price">{formatPrice(p.price)}</div>
                      {p.comparePrice && (
                        <div className="flash-old-price">{formatPrice(p.comparePrice)}</div>
                      )}
                    </div>
                    <div className="flash-progress">
                      <div className="flash-progress-fill" style={{ width: `${soldPct}%` }} />
                    </div>
                    <div className="flash-sold">{p.totalSold || 0} sold</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Hot Right Now */}
      <div style={{ padding: "20px 16px 0" }}>
        <div className="section-header">
          <h3>Hot Right Now</h3>
          <Link href="/search">See all</Link>
        </div>
        <div className="product-grid">
          {hotProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Featured For You */}
      {featuredProducts.length > 0 && (
        <div style={{ padding: "20px 16px 8px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Featured For You</h3>
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
