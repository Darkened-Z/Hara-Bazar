"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, Circle, Package, Truck, MapPin } from "lucide-react";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "badge badge-warning" },
  confirmed: { label: "Confirmed", className: "badge badge-info" },
  processing: { label: "Processing", className: "badge badge-info" },
  shipped: { label: "Shipped", className: "badge badge-info" },
  delivered: { label: "Delivered", className: "badge badge-success" },
  cancelled: { label: "Cancelled", className: "badge badge-danger" },
};

const statusSteps = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch(`/api/orders/${params.id}`)
        .then((r) => r.json())
        .then(setOrder)
        .finally(() => setLoading(false));
    }
  }, [status, params.id, router]);

  if (loading) return <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>Loading order...</div>;
  if (!order) return <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>Order not found</div>;

  const currentStepIndex = statusSteps.indexOf(order.status);
  const config = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {new Date(order.createdAt).toLocaleDateString("en-PK", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span className={config.className}>{config.label}</span>
      </div>

      {/* Status timeline */}
      {order.status !== "cancelled" && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => {
              const done = i <= currentStepIndex;
              const icons = [Package, CheckCircle2, Package, Truck, MapPin];
              const Icon = icons[i];
              return (
                <div key={step} className="flex flex-col items-center gap-1">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{
                      background: done ? 'var(--success-bg)' : 'var(--surface-alt)',
                      color: done ? 'var(--success)' : 'var(--text-muted)',
                    }}
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                  </div>
                  <span
                    className="text-xs capitalize"
                    style={{
                      color: done ? 'var(--success)' : 'var(--text-muted)',
                      fontWeight: done ? 600 : 400,
                    }}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-4">
        <h2 className="mb-3 font-bold">Items</h2>
        <div className="space-y-3">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <Link href={`/product/${item.productSlug}`} className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {item.productName}
                </Link>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity} x {formatPrice(item.unitPrice)}</p>
              </div>
              <span className="font-medium">{formatPrice(item.totalPrice)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="card p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
            <span>{formatPrice(order.deliveryFee)}</span>
          </div>
          <hr style={{ borderColor: 'var(--border)' }} />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div className="card p-4">
        <h2 className="mb-2 font-bold">Delivery</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{order.deliveryAddress}</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{order.deliveryPhone}</p>
        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>Payment: Cash on Delivery</p>
      </div>
    </div>
  );
}
