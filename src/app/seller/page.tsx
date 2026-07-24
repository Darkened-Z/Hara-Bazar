"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingBag, TrendingUp, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Stats {
  storeName: string;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/seller/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>Loading dashboard...</div>;

  const cards = [
    { label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: 'var(--success)' },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: 'var(--info)' },
    { label: "Products", value: stats.totalProducts, icon: Package, color: '#7C3AED' },
    { label: "Pending Orders", value: stats.pendingOrders, icon: AlertCircle, color: 'var(--warning)' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Welcome, {stats.storeName}</h1>

      <div className="stat-grid">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: 'var(--surface-alt)', color }}
              >
                <Icon style={{ width: 24, height: 24 }} />
              </div>
              <div>
                <div className="label">{label}</div>
                <div className="value" style={{ fontSize: 24 }}>{value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
