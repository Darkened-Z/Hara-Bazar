"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface CategoryOption {
  id: number;
  name: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/seller/products/${id}`).then((r) => r.json()),
    ]).then(([cats, product]) => {
      setCategories(cats);
      if (product.error) {
        setError(product.error);
      } else {
        setName(product.name);
        setDescription(product.description || "");
        setPrice(String(product.price));
        setComparePrice(product.comparePrice ? String(product.comparePrice) : "");
        setStock(String(product.stock));
        setCategoryId(String(product.categoryId));
        setStatus(product.status);
      }
      setPageLoading(false);
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/seller/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        price: parseInt(price),
        comparePrice: comparePrice ? parseInt(comparePrice) : null,
        stock: parseInt(stock) || 0,
        categoryId: parseInt(categoryId),
        status,
      }),
    });

    if (res.ok) {
      router.push("/seller/products");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to update product");
      setLoading(false);
    }
  }

  if (pageLoading) return <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>Loading product...</div>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Edit Product</h1>

      {error && (
        <div className="mb-4 rounded-lg p-3 text-sm" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6">
        <div className="space-y-4">
          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (Rs)</label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="comparePrice">Compare Price (optional)</label>
              <input
                id="comparePrice"
                type="number"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stock">Stock</label>
              <input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => router.back()}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
