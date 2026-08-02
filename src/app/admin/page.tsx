"use client";

import { useEffect, useState } from "react";
import { Users, Store, Bike, ShoppingBag, TrendingUp, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Stats {
  totalUsers: number;
  totalSellers: number;
  totalRiders: number;
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <div className="py-20 text-center" style={{ color: "var(--text-muted)" }}>Loading dashboard...</div>;

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "var(--info)" },
    { label: "Total Sellers", value: stats.totalSellers, icon: Store, color: "#7C3AED" },
    { label: "Total Riders", value: stats.totalRiders, icon: Bike, color: "var(--warning)" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "var(--primary)" },
    { label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: "var(--success)" },
    { label: "Active Products", value: stats.activeProducts, icon: Package, color: "var(--danger)" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

      <div className="stat-grid">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "var(--surface-alt)", color }}
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
