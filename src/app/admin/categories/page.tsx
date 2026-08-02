"use client";

import { useEffect, useState } from "react";
import { FolderTree, Plus } from "lucide-react";
import { slugify } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
  slug: string;
  abbreviation: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [color, setColor] = useState("#22c55e");
  const [sortOrder, setSortOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !abbreviation.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), slug: slugify(name), abbreviation: abbreviation.trim(), color, sortOrder }),
    });

    if (res.ok) {
      const cat = await res.json();
      setCategories((prev) => [...prev, cat]);
      setName("");
      setAbbreviation("");
      setColor("#22c55e");
      setSortOrder(0);
    }
    setSubmitting(false);
  }

  async function toggleActive(id: number, isActive: boolean) {
    const res = await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    if (res.ok) {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !isActive } : c)));
    }
  }

  if (loading) return <div className="py-20 text-center" style={{ color: "var(--text-muted)" }}>Loading categories...</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Categories</h1>

      <div className="card mb-6" style={{ padding: 20 }}>
        <h3 className="mb-4 font-semibold">Add Category</h3>
        <form onSubmit={addCategory}>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" required />
            </div>
            <div className="form-group">
              <label>Abbreviation</label>
              <input type="text" value={abbreviation} onChange={(e) => setAbbreviation(e.target.value)} placeholder="e.g. FV" required />
            </div>
            <div className="form-group">
              <label>Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Sort Order</label>
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            <Plus style={{ width: 16, height: 16 }} /> Add Category
          </button>
        </form>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FolderTree style={{ width: 64, height: 64, color: "var(--text-muted)", opacity: 0.5 }} /></div>
          <h3>No categories yet</h3>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Color</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Abbr</th>
                <th>Sort</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <div
                      style={{ width: 24, height: 24, borderRadius: "var(--radius-sm)", background: cat.color }}
                    />
                  </td>
                  <td style={{ fontWeight: 500 }}>{cat.name}</td>
                  <td style={{ color: "var(--text-muted)" }}>{cat.slug}</td>
                  <td>{cat.abbreviation}</td>
                  <td>{cat.sortOrder}</td>
                  <td>
                    <span className={cat.isActive ? "badge badge-success" : "badge badge-danger"}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleActive(cat.id, cat.isActive)}
                      className={cat.isActive ? "btn btn-sm" : "btn btn-primary btn-sm"}
                      style={cat.isActive ? { color: "var(--danger)" } : undefined}
                    >
                      {cat.isActive ? "Deactivate" : "Activate"}
                    </button>
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
