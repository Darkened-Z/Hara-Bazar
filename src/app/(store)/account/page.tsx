"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, MapPin, Heart, Store, LogOut, ChevronRight } from "lucide-react";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "loading") {
    return <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>;
  }

  const user = session?.user as any;

  const menuItems = [
    { href: "/orders", icon: Package, label: "My Orders", desc: "Track and manage orders" },
    { href: "/account/addresses", icon: MapPin, label: "Saved Addresses", desc: "Manage delivery addresses" },
    { href: "/account/wishlist", icon: Heart, label: "Wishlist", desc: "Your saved items" },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Profile */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div
            className="avatar avatar-lg"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="font-bold">{user?.name}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.phone}</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="card">
        {menuItems.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="list-item"
          >
            <Icon style={{ width: 20, height: 20, color: 'var(--text-muted)', flexShrink: 0 }} />
            <div className="flex-1">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
            <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
          </Link>
        ))}
      </div>

      {/* Seller link */}
      {user?.role === "seller" ? (
        <Link
          href="/seller"
          className="list-item card"
          style={{ background: 'var(--primary-light)', borderColor: 'var(--primary)' }}
        >
          <Store style={{ width: 20, height: 20, color: 'var(--primary)' }} />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>Seller Dashboard</p>
            <p className="text-xs" style={{ color: 'var(--primary)', opacity: 0.7 }}>Manage your store</p>
          </div>
          <ChevronRight style={{ width: 16, height: 16, color: 'var(--primary)' }} />
        </Link>
      ) : (
        <Link
          href="/sell"
          className="list-item card"
        >
          <Store style={{ width: 20, height: 20, color: 'var(--text-muted)' }} />
          <div className="flex-1">
            <p className="text-sm font-medium">Become a Seller</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Start selling on Hara Bazaar</p>
          </div>
          <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
        </Link>
      )}

      <button
        className="btn btn-outline btn-block"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut style={{ width: 16, height: 16 }} />
        Sign Out
      </button>
    </div>
  );
}
