"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const statusBadge: Record<string, string> = {
  active: "badge badge-success",
  inactive: "badge badge-default",
  pending: "badge badge-warning",
};

interface SellerProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  status: string;
  totalSold: number | null;
  categoryName: string | null;
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/products")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>Loading products...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Products</h2>
        <Link href="/seller/products/new">
          <button className="btn btn-primary">
            <Plus style={{ width: 16, height: 16 }} /> Add Product
          </button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Package style={{ width: 64, height: 64, color: 'var(--text-muted)', opacity: 0.5 }} /></div>
          <h3>No products yet</h3>
          <p>Add your first product to start selling</p>
          <Link href="/seller/products/new">
            <button className="btn btn-primary">Add Product</button>
          </Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.categoryName}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td>{p.stock}</td>
                  <td>{p.totalSold || 0}</td>
                  <td>
                    <span className={statusBadge[p.status] || "badge badge-default"}>{p.status}</span>
                  </td>
                  <td>
                    <Link href={`/seller/products/${p.id}/edit`} style={{ color: 'var(--primary)' }}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
