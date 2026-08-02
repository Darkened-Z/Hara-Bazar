"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "badge badge-warning" },
  confirmed: { label: "Confirmed", className: "badge badge-info" },
  processing: { label: "Processing", className: "badge badge-info" },
  shipped: { label: "Shipped", className: "badge badge-info" },
  delivered: { label: "Delivered", className: "badge badge-success" },
  cancelled: { label: "Cancelled", className: "badge badge-danger" },
};

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  storeName: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center" style={{ color: "var(--text-muted)" }}>Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><ShoppingBag style={{ width: 64, height: 64, color: "var(--text-muted)", opacity: 0.5 }} /></div>
        <h3>No orders yet</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="text-2xl font-bold">Orders</h1>
        <span className="badge badge-default">{orders.length} total</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Store</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              return (
                <tr key={order.id}>
                  <td style={{ fontWeight: 500 }}>{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{order.storeName}</td>
                  <td style={{ fontWeight: 500 }}>{formatPrice(order.total)}</td>
                  <td>
                    <span className={config.className}>{config.label}</span>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>
                    {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
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
