"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bike, Package, Settings, ArrowLeft, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/rider", icon: Bike, label: "Dashboard" },
  { href: "/rider/deliveries", icon: Package, label: "Deliveries" },
  { href: "/rider/settings", icon: Settings, label: "Settings" },
];

export function RiderSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
        style={{ background: 'var(--surface)', boxShadow: 'var(--shadow)' }}
      >
        {open ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setOpen(false)} />
      )}

      <aside
        className={`sidebar fixed left-0 top-0 z-40 flex h-full w-64 flex-col transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: 256 }}
      >
        <div className="flex h-14 items-center px-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <Link href="/" className="flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <ArrowLeft style={{ width: 16, height: 16 }} />
            <span className="font-bold">Hara Bazaar</span>
          </Link>
          <span
            className="badge ml-auto"
            style={{ background: '#2563EB', color: '#fff' }}
          >
            Rider
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {links.map(({ href, icon: Icon, label }) => {
            const isActive = href === "/rider" ? pathname === "/rider" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`sidebar-item ${isActive ? "active" : ""}`}
              >
                <Icon style={{ width: 20, height: 20 }} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
