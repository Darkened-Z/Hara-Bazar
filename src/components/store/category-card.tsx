import Link from "next/link";
import type { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/categories/${category.slug}`} className="category-card">
      <div className="category-icon" style={{ background: category.color }}>
        {category.abbreviation}
      </div>
      <span className="category-label">{category.name}</span>
    </Link>
  );
}
