"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "badge badge-warning" },
  confirmed: { label: "Confirmed", className: "badge badge-info" },
  processing: { label: "Processing", className: "badge badge-info" },
  shipped: { label: "Shipped", className: "badge badge-info" },
  delivered: { label: "Delivered", className: "badge badge-success" },
  cancelled: { label: "Cancelled", className: "badge badge-danger" },
};

const nextStatus: Record<string, string> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "shipped",
  shipped: "delivered",
};

interface SellerOrder {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  createdAt: string;
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/orders")
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(orderId: number, status: string) {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      );
    }
  }

  if (loading) return <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><ShoppingBag style={{ width: 64, height: 64, color: 'var(--text-muted)', opacity: 0.5 }} /></div>
        <h3>No orders yet</h3>
        <p>Orders will appear here when customers place them</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const next = nextStatus[order.status];
              return (
                <tr key={order.id}>
                  <td style={{ fontWeight: 500 }}>{order.orderNumber}</td>
                  <td>
                    <p>{order.customerName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.customerPhone}</p>
                  </td>
                  <td style={{ fontWeight: 500 }}>{formatPrice(order.total)}</td>
                  <td>
                    <span className={config.className}>{config.label}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                  </td>
                  <td>
                    {next ? (
                      <button
                        onClick={() => updateStatus(order.id, next)}
                        className="btn btn-primary btn-sm"
                      >
                        Mark {statusConfig[next]?.label}
                      </button>
                    ) : order.status === "delivered" ? (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Completed</span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
