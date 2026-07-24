"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/search?deals=1", label: "Deals" },
  { href: "/sell", label: "Sell on Hara Bazaar" },
];

const categoryChips = [
  "Oil & Ghee", "Rice & Flour", "Spices", "Dairy",
  "Beverages", "Snacks", "Cleaning", "Personal Care",
];

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: "linear-gradient(135deg, #1B5E3B 0%, #14532D 100%)" }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto", padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, background: "#E85D2A", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 16, color: "#fff",
          }}>H</div>
          <div style={{ fontWeight: 800, fontSize: 19, color: "#fff", letterSpacing: "-0.3px" }}>Hara Bazaar</div>
        </Link>

        {/* Desktop nav links */}
        <nav className="desktop-only" style={{ alignItems: "center", gap: 20, marginLeft: 16 }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} style={{
              fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)",
              textDecoration: "none",
            }}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search bar */}
        <form action="/search" style={{ flex: 1, position: "relative", maxWidth: 560, margin: "0 auto" }}>
          <input
            type="search"
            name="q"
            placeholder="Search groceries, brands..."
            style={{
              width: "100%", padding: "10px 14px 10px 38px", border: "none",
              borderRadius: 10, fontSize: 14, background: "rgba(255,255,255,0.95)",
              color: "#1C1C1E", fontWeight: 500,
            }}
          />
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2.5"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
        </form>

        {/* Right icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <Link href="/cart" style={{ position: "relative", color: "#fff", textDecoration: "none" }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </Link>

          {session?.user ? (
            <Link href="/account" style={{
              width: 30, height: 30, background: "rgba(255,255,255,0.15)", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none",
            }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          ) : (
            <Link href="/login" style={{
              padding: "6px 16px", background: "rgba(255,255,255,0.15)", borderRadius: 8,
              fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "none",
            }}>
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Desktop category bar */}
      <div className="desktop-only" style={{ background: "rgba(0,0,0,0.12)", flexWrap: "wrap" }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto", display: "flex", gap: 0,
          padding: "0 16px", overflowX: "auto",
        }}>
          {categoryChips.map(name => {
            const slug = name.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-");
            return (
              <Link key={slug} href={`/categories/${slug}`} style={{
                padding: "8px 16px", fontSize: 12, fontWeight: 600,
                color: "rgba(255,255,255,0.8)", textDecoration: "none", whiteSpace: "nowrap",
              }}>
                {name}
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .desktop-only { display: none; }
        @media (min-width: 768px) {
          .desktop-only { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
