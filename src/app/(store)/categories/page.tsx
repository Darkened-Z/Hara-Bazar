import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { CategoryCard } from "@/components/store/category-card";

export default async function CategoriesPage() {
  const allCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.sortOrder);

  return (
    <div style={{ padding: 16 }}>
      <div className="page-header">
        <h2>Categories</h2>
      </div>
      <div className="category-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
        {allCategories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
}
