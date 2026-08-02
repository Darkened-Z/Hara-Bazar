"use client";

import { useEffect, useState } from "react";
import { Bike } from "lucide-react";

interface Rider {
  id: number;
  riderName: string;
  phone: string | null;
  userPhone: string;
  vehicleType: string;
  zone: string | null;
  status: string;
  totalDeliveries: number;
  createdAt: string;
}

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/riders")
      .then((r) => r.json())
      .then(setRiders)
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: number, status: string) {
    const res = await fetch("/api/admin/riders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setRiders((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    }
  }

  if (loading) return <div className="py-20 text-center" style={{ color: "var(--text-muted)" }}>Loading riders...</div>;

  if (riders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><Bike style={{ width: 64, height: 64, color: "var(--text-muted)", opacity: 0.5 }} /></div>
        <h3>No riders found</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="text-2xl font-bold">Riders</h1>
        <span className="badge badge-default">{riders.length} total</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Vehicle</th>
              <th>Zone</th>
              <th>Deliveries</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {riders.map((rider) => (
              <tr key={rider.id}>
                <td style={{ fontWeight: 500 }}>{rider.riderName}</td>
                <td>{rider.phone || rider.userPhone}</td>
                <td>
                  <span className="badge badge-default">{rider.vehicleType}</span>
                </td>
                <td style={{ color: "var(--text-muted)" }}>{rider.zone || "-"}</td>
                <td>{rider.totalDeliveries}</td>
                <td>
                  <span className={rider.status === "active" ? "badge badge-success" : "badge badge-danger"}>
                    {rider.status}
                  </span>
                </td>
                <td>
                  {rider.status === "active" ? (
                    <button onClick={() => updateStatus(rider.id, "suspended")} className="btn btn-sm" style={{ color: "var(--danger)" }}>
                      Suspend
                    </button>
                  ) : (
                    <button onClick={() => updateStatus(rider.id, "active")} className="btn btn-primary btn-sm">
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
