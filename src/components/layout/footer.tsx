import Link from "next/link";

export function Footer() {
  return (
    <footer className="desktop-footer" style={{
      background: "#1C1C1E", padding: "40px 16px 24px",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", gap: 48, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{
              width: 28, height: 28, background: "#E85D2A", borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 14, color: "#fff",
            }}>H</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>Hara Bazaar</div>
          </div>
          <div style={{ fontSize: 12, color: "#71717A", lineHeight: 1.6 }}>
            Pakistan&apos;s trusted marketplace for groceries, wholesale and general store items.
          </div>
        </div>
        <FooterCol title="Shop" links={[
          { label: "Categories", href: "/categories" },
          { label: "Flash Deals", href: "/search?deals=1" },
          { label: "Hot List", href: "/search" },
        ]} />
        <FooterCol title="Sell" links={[
          { label: "Seller Dashboard", href: "/seller" },
          { label: "Register as Seller", href: "/sell" },
          { label: "Seller Policies", href: "#" },
        ]} />
        <FooterCol title="Deliver" links={[
          { label: "Become a Rider", href: "#" },
          { label: "Rider App", href: "#" },
          { label: "Support", href: "#" },
        ]} />
      </div>
      <div style={{
        maxWidth: 1280, margin: "24px auto 0", paddingTop: 16,
        borderTop: "1px solid #2A2A2E", fontSize: 11, color: "#52525B",
      }}>
        &copy; 2026 Hara Bazaar. All rights reserved.
      </div>
      <style>{`
        .desktop-footer { display: none; }
        @media (min-width: 768px) { .desktop-footer { display: block !important; } }
      `}</style>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map(l => (
          <Link key={l.label} href={l.href} style={{ fontSize: 12, color: "#A1A1AA", textDecoration: "none" }}>
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
