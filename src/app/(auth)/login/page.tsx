"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid phone number or password");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="card" style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Welcome back</h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Sign in to your Hara Bazaar account
      </p>

      {error && (
        <div style={{
          marginBottom: 16, borderRadius: 'var(--radius-sm)', padding: 12,
          fontSize: 13, background: 'var(--danger-bg)', color: 'var(--danger)',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            placeholder="03XX-XXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
        Don&apos;t have an account?{" "}
        <Link href="/register" style={{ fontWeight: 600, color: 'var(--primary)' }}>
          Register
        </Link>
      </p>
    </div>
  );
}
