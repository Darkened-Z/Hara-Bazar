"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";

interface DeliveryOrder {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  deliveryAddress: string;
  customerName: string;
  storeName: string;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export default function RiderDeliveriesPage() {
  const [tab, setTab] = useState<"available" | "mine">("available");
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  function loadOrders(type: string) {
    setLoading(true);
    fetch(`/api/rider/deliveries?type=${type}`)
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders(tab);
  }, [tab]);

  async function acceptOrder(orderId: number) {
    const res = await fetch("/api/rider/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  }

  async function updateDelivery(orderId: number, action: "pickup" | "deliver") {
    const res = await fetch(`/api/rider/deliveries/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      if (action === "pickup") {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, pickedUpAt: new Date().toISOString() } : o
          )
        );
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, deliveredAt: new Date().toISOString(), status: "delivered" }
              : o
          )
        );
      }
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Deliveries</h1>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("available")}
          className={`btn ${tab === "available" ? "btn-primary" : "btn-outline"} btn-sm`}
        >
          Available
        </button>
        <button
          onClick={() => setTab("mine")}
          className={`btn ${tab === "mine" ? "btn-primary" : "btn-outline"} btn-sm`}
        >
          My Deliveries
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Package style={{ width: 64, height: 64, color: 'var(--text-muted)', opacity: 0.5 }} />
          </div>
          <h3>{tab === "available" ? "No available orders" : "No deliveries yet"}</h3>
          <p>
            {tab === "available"
              ? "Orders ready for pickup will appear here"
              : "Accepted deliveries will appear here"}
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Store</th>
                <th>Address</th>
                <th>Total</th>
                {tab === "mine" && <th>Status</th>}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 500 }}>{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>{order.storeName}</td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: 200 }}>{order.deliveryAddress}</td>
                  <td style={{ fontWeight: 500 }}>{formatPrice(order.total)}</td>
                  {tab === "mine" && (
                    <td>
                      {order.deliveredAt ? (
                        <span className="badge badge-success">Delivered</span>
                      ) : order.pickedUpAt ? (
                        <span className="badge badge-info">Picked Up</span>
                      ) : (
                        <span className="badge badge-warning">Assigned</span>
                      )}
                    </td>
                  )}
                  <td>
                    {tab === "available" ? (
                      <button
                        onClick={() => acceptOrder(order.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Accept
                      </button>
                    ) : order.deliveredAt ? (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Completed</span>
                    ) : !order.pickedUpAt ? (
                      <button
                        onClick={() => updateDelivery(order.id, "pickup")}
                        className="btn btn-primary btn-sm"
                      >
                        Mark Picked Up
                      </button>
                    ) : (
                      <button
                        onClick={() => updateDelivery(order.id, "deliver")}
                        className="btn btn-primary btn-sm"
                      >
                        Mark Delivered
                      </button>
                    )}
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
