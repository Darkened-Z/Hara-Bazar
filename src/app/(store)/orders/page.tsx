"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "badge badge-warning" },
  confirmed: { label: "Confirmed", className: "badge badge-info" },
  processing: { label: "Processing", className: "badge badge-info" },
  shipped: { label: "Shipped", className: "badge badge-info" },
  delivered: { label: "Delivered", className: "badge badge-success" },
  cancelled: { label: "Cancelled", className: "badge badge-danger" },
};

interface OrderEntry {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

export default function OrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then(setOrders)
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (loading) return <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><Package style={{ width: 64, height: 64, color: 'var(--text-muted)', opacity: 0.5 }} /></div>
        <h3>No orders yet</h3>
        <p>Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
      <div className="space-y-3">
        {orders.map((order) => {
          const config = statusConfig[order.status] || statusConfig.pending;
          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="card list-item"
              style={{ textDecoration: 'none' }}
            >
              <div className="flex-1">
                <p className="font-medium">{order.orderNumber}</p>
                <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {new Date(order.createdAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <span className={config.className}>{config.label}</span>
                <p className="mt-1 font-bold" style={{ color: 'var(--primary)' }}>{formatPrice(order.total)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
