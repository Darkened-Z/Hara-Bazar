"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CartEntry {
  id: number;
  quantity: number;
  productId: number;
  productName: string;
  productSlug: string;
  price: number;
  comparePrice: number | null;
  stock: number;
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/cart")
        .then((r) => r.json())
        .then(setItems)
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  async function updateQuantity(cartItemId: number, quantity: number) {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== cartItemId)
        : prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i)),
    );
    await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId, quantity }),
    });
  }

  async function removeItem(cartItemId: number) {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId }),
    });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal > 0 ? 15000 : 0;
  const total = subtotal + deliveryFee;

  if (loading) {
    return <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><ShoppingCart style={{ width: 64, height: 64, color: 'var(--text-muted)', opacity: 0.5 }} /></div>
        <h3>Your cart is empty</h3>
        <p>Add some products to get started</p>
        <Link href="/">
          <button className="btn btn-primary">Browse Products</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-3 md:col-span-2">
        <h1 className="text-2xl font-bold">Shopping Cart ({items.length})</h1>
        {items.map((item) => (
          <div
            key={item.id}
            className="card flex items-center gap-4 p-4"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg text-2xl" style={{ background: 'var(--surface-alt)' }}>
              📦
            </div>
            <div className="flex-1">
              <Link
                href={`/product/${item.productSlug}`}
                className="font-medium"
                style={{ color: 'var(--text)' }}
              >
                {item.productName}
              </Link>
              <div className="mt-1 text-sm font-bold" style={{ color: 'var(--primary)' }}>
                {formatPrice(item.price)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="qty-control">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="qty-btn"
                >
                  <Minus style={{ width: 12, height: 12 }} />
                </button>
                <span className="qty-val">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))}
                  className="qty-btn"
                >
                  <Plus style={{ width: 12, height: 12 }} />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="flex h-8 w-8 items-center justify-center"
                style={{ color: 'var(--danger)' }}
              >
                <Trash2 style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card h-fit p-4">
        <h2 className="mb-4 font-bold">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
          <hr style={{ borderColor: 'var(--border)' }} />
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>{formatPrice(total)}</span>
          </div>
        </div>
        <Link href="/checkout">
          <button className="btn btn-primary btn-block mt-4">Proceed to Checkout</button>
        </Link>
        <p className="mt-2 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Cash on Delivery only</p>
      </div>
    </div>
  );
}
