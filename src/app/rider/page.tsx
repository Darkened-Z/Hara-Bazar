"use client";

import { useEffect, useState } from "react";
import { Bike, Package, Clock, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Stats {
  totalDeliveries: number;
  todayDeliveries: number;
  availableOrders: number;
  activeDeliveries: number;
}

export default function RiderDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/rider/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>Loading dashboard...</div>;

  const cards = [
    { label: "Today's Deliveries", value: stats.todayDeliveries, icon: Clock, color: 'var(--success)' },
    { label: "Total Deliveries", value: stats.totalDeliveries, icon: Bike, color: 'var(--info)' },
    { label: "Available Orders", value: stats.availableOrders, icon: Package, color: 'var(--warning)' },
    { label: "Active Delivery", value: stats.activeDeliveries, icon: Truck, color: '#7C3AED' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Rider Dashboard</h1>

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
