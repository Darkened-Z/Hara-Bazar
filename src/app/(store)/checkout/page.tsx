"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { MapPin, CreditCard } from "lucide-react";

interface CartEntry {
  id: number;
  quantity: number;
  productName: string;
  price: number;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartEntry[]>([]);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      setPhone((session.user as any)?.phone || "");
      fetch("/api/cart")
        .then((r) => r.json())
        .then((data) => {
          if (data.length === 0) {
            router.push("/cart");
            return;
          }
          setItems(data);
        })
        .finally(() => setPageLoading(false));
    }
  }, [status, session, router]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = 150;
  const total = subtotal + deliveryFee;

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryAddress: address, deliveryPhone: phone, notes }),
    });

    if (res.ok) {
      const order = await res.json();
      router.push(`/orders/${order.id}`);
    } else {
      const data = await res.json().catch(() => null);
      setOrderError(data?.error || "Failed to place order. Please try again.");
      setLoading(false);
    }
  }

  if (pageLoading) {
    return <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      {orderError && (
        <div style={{
          marginBottom: 16, borderRadius: 'var(--radius-sm)', padding: 12,
          fontSize: 13, background: 'var(--danger-bg)', color: 'var(--danger)',
        }}>
          {orderError}
        </div>
      )}

      <form onSubmit={placeOrder} className="space-y-6">
        {/* Delivery info */}
        <div className="card p-4">
          <div className="mb-4 flex items-center gap-2">
            <MapPin style={{ width: 20, height: 20, color: 'var(--primary)' }} />
            <h2 className="font-bold">Delivery Details</h2>
          </div>
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="address">Delivery Address</label>
              <input
                id="address"
                placeholder="House/Flat, Street, Area, Faisalabad"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="03XX-XXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notes (optional)</label>
              <textarea
                id="notes"
                placeholder="Special instructions for delivery..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="card p-4">
          <div className="mb-2 flex items-center gap-2">
            <CreditCard style={{ width: 20, height: 20, color: 'var(--primary)' }} />
            <h2 className="font-bold">Payment Method</h2>
          </div>
          <div className="flex items-center gap-3 rounded-lg p-3" style={{ border: '2px solid var(--primary)', background: 'var(--primary-light)' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: '4px solid var(--primary)' }} />
            <span className="font-medium">Cash on Delivery (COD)</span>
          </div>
        </div>

        {/* Order summary */}
        <div className="card p-4">
          <h2 className="mb-3 font-bold">Order Summary</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>
                  {item.productName} x{item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <hr style={{ borderColor: 'var(--border)' }} />
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <hr style={{ borderColor: 'var(--border)' }} />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
          {loading ? "Placing Order..." : `Place Order — ${formatPrice(total)}`}
        </button>
      </form>
    </div>
  );
}
