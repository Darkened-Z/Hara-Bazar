import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { like, eq, and, desc } from "drizzle-orm";
import { ProductCard } from "@/components/store/product-card";
import { Search } from "lucide-react";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  const results = q
    ? await db
        .select()
        .from(products)
        .where(and(like(products.name, `%${q}%`), eq(products.status, "active")))
        .orderBy(desc(products.totalSold))
        .limit(40)
    : await db.select().from(products).where(eq(products.status, "active")).orderBy(desc(products.totalSold)).limit(40);

  return (
    <div>
      <form action="/search" className="search-bar mb-6">
        <Search />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search groceries..."
          autoFocus
        />
      </form>

      {q && (
        <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          {results.length} results for &quot;{q}&quot;
        </p>
      )}

      {results.length === 0 ? (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
