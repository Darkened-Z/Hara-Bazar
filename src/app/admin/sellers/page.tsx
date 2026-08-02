"use client";

import { useEffect, useState } from "react";
import { Store } from "lucide-react";

interface Seller {
  id: number;
  storeName: string;
  ownerName: string;
  city: string | null;
  status: string;
  productsCount: number;
  createdAt: string;
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/sellers")
      .then((r) => r.json())
      .then(setSellers)
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: number, status: string) {
    const res = await fetch("/api/admin/sellers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setSellers((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    }
  }

  if (loading) return <div className="py-20 text-center" style={{ color: "var(--text-muted)" }}>Loading sellers...</div>;

  if (sellers.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><Store style={{ width: 64, height: 64, color: "var(--text-muted)", opacity: 0.5 }} /></div>
        <h3>No sellers found</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="text-2xl font-bold">Sellers</h1>
        <span className="badge badge-default">{sellers.length} total</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Store</th>
              <th>Owner</th>
              <th>City</th>
              <th>Products</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr key={seller.id}>
                <td style={{ fontWeight: 500 }}>{seller.storeName}</td>
                <td>{seller.ownerName}</td>
                <td style={{ color: "var(--text-muted)" }}>{seller.city || "-"}</td>
                <td>{seller.productsCount}</td>
                <td>
                  <span className={seller.status === "active" ? "badge badge-success" : "badge badge-danger"}>
                    {seller.status}
                  </span>
                </td>
                <td>
                  {seller.status === "active" ? (
                    <button onClick={() => updateStatus(seller.id, "suspended")} className="btn btn-sm" style={{ color: "var(--danger)" }}>
                      Suspend
                    </button>
                  ) : (
                    <button onClick={() => updateStatus(seller.id, "active")} className="btn btn-primary btn-sm">
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
