"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CategoryOption {
  id: number;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/seller/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        price: parseInt(price),
        comparePrice: comparePrice ? parseInt(comparePrice) : undefined,
        stock: parseInt(stock) || 0,
        categoryId: parseInt(categoryId),
      }),
    });

    if (res.ok) {
      router.push("/seller/products");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to add product");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Add New Product</h1>

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
              placeholder="e.g. Dalda Cooking Oil 5L"
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
              placeholder="Product description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (paisa)</label>
              <input
                id="price"
                type="number"
                placeholder="e.g. 28500 for Rs 285"
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
                placeholder="Original price"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock Quantity</label>
            <input
              id="stock"
              type="number"
              placeholder="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? "Adding..." : "Add Product"}
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
