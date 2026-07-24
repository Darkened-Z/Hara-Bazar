"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Minus, Plus } from "lucide-react";

export function AddToCartButton({ productId, stock }: { productId: number; stock: number }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  async function addToCart() {
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });

    setLoading(false);
    if (res.ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  }

  if (stock === 0) {
    return (
      <button disabled className="btn btn-primary flex-1" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
        Out of Stock
      </button>
    );
  }

  return (
    <div className="flex flex-1 items-center gap-3">
      <div className="qty-control">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="qty-btn"
        >
          <Minus style={{ width: 16, height: 16 }} />
        </button>
        <span className="qty-val">{quantity}</span>
        <button
          onClick={() => setQuantity(Math.min(stock, quantity + 1))}
          className="qty-btn"
        >
          <Plus style={{ width: 16, height: 16 }} />
        </button>
      </div>
      <button onClick={addToCart} disabled={loading} className="btn btn-primary flex-1">
        <ShoppingCart style={{ width: 16, height: 16 }} />
        {loading ? "Adding..." : added ? "Added!" : "Add to Cart"}
      </button>
    </div>
  );
}
