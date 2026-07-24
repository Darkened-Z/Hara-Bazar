import Link from "next/link";
import { formatPrice, discountPercent } from "@/lib/utils";
import type { Product } from "@/types";

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} viewBox="0 0 12 12" width="10" height="10">
          <polygon
            points="6,1 7.5,4.1 11,4.6 8.5,7 9.1,10.5 6,8.9 2.9,10.5 3.5,7 1,4.6 4.5,4.1"
            fill={i <= Math.floor(rating) ? "#F59E0B" : "#E5E7EB"}
          />
        </svg>
      ))}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const discount = product.comparePrice ? discountPercent(product.price, product.comparePrice) : 0;

  return (
    <Link href={`/product/${product.slug}`} className="product-card">
      <div className="product-img">
        <span className="product-img-letter">{product.name[0]}</span>
        {discount > 0 && (
          <span className="product-badge">-{discount}%</span>
        )}
        <span className="product-fav">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#71717A" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </span>
        {product.stock === 0 && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.4)",
          }}>
            <span style={{
              background: "#fff", color: "#1C1C1E",
              borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 500,
            }}>
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
          <div className="product-price">{formatPrice(product.price)}</div>
          {product.comparePrice && (
            <div style={{ fontSize: 10, color: "#A1A1AA", textDecoration: "line-through" }}>
              {formatPrice(product.comparePrice)}
            </div>
          )}
        </div>
        {product.ratingAvg && product.ratingAvg > 0 && (
          <div className="product-rating">
            <StarRating rating={product.ratingAvg} />
            <span>{product.ratingAvg} ({((product.totalSold || 0) / 1000).toFixed(1)}k sold)</span>
          </div>
        )}
      </div>
    </Link>
  );
}
