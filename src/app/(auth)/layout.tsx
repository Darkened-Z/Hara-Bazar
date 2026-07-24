import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: '48px 16px', background: 'var(--bg)',
    }}>
      <Link href="/" style={{
        marginBottom: 32, display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
      }}>
        <div style={{
          width: 36, height: 36, background: '#E85D2A', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 18, color: '#fff',
        }}>H</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.3px' }}>Hara Bazaar</div>
      </Link>
      <div style={{ width: '100%', maxWidth: 420 }}>{children}</div>
    </div>
  );
}
