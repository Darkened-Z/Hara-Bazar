import Link from "next/link";
import { Store, TrendingUp, Truck, Shield } from "lucide-react";

const benefits = [
  { icon: Store, title: "Free Store Setup", desc: "Create your online store in minutes — no fees, no commission on your first 50 orders." },
  { icon: TrendingUp, title: "Reach More Customers", desc: "Access thousands of grocery buyers across Faisalabad looking for quality products." },
  { icon: Truck, title: "Easy Delivery", desc: "We handle delivery logistics. You pack the order, our riders pick it up." },
  { icon: Shield, title: "Secure Payments", desc: "Get paid directly to your bank account. Transparent settlements, no hidden charges." },
];

const steps = [
  { num: "1", title: "Register", desc: "Create a seller account with your store name and phone number." },
  { num: "2", title: "Add Products", desc: "List your products with photos, prices, and stock quantities." },
  { num: "3", title: "Start Selling", desc: "Receive orders, manage inventory, and grow your business." },
];

export default function SellPage() {
  return (
    <div>
      <section style={{ textAlign: 'center', padding: '48px 16px', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius)', marginBottom: 48 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Sell on Hara Bazaar</h1>
        <p style={{ fontSize: 16, opacity: 0.9, maxWidth: 500, margin: '0 auto 24px' }}>
          Join Faisalabad&apos;s fastest growing grocery marketplace. Reach thousands of customers from your shop.
        </p>
        <Link
          href="/register"
          style={{
            display: 'inline-block', padding: '14px 32px', background: '#fff', color: 'var(--primary)',
            borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 15,
          }}
        >
          Register as Seller
        </Link>
      </section>

      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>Why Sell With Us?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card" style={{ padding: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon style={{ width: 24, height: 24 }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          {steps.map(({ num, title, desc }) => (
            <div key={num} style={{ textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, margin: '0 auto 12px' }}>
                {num}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card" style={{ padding: 32, textAlign: 'center', background: 'var(--surface-alt)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Ready to grow your business?</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
          Join hundreds of sellers already on Hara Bazaar
        </p>
        <Link
          href="/register"
          className="btn btn-primary btn-lg"
        >
          Get Started — It&apos;s Free
        </Link>
      </section>
    </div>
  );
}
